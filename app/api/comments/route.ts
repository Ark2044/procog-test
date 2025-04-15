import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { ID, Query } from "appwrite";
import {
  handleApiError,
  createSuccessResponse,
  validateRequestBody,
} from "@/lib/apiUtils";
import { validateString } from "@/lib/validation";
import {
  checkCommentRateLimit,
  isSpam,
  isSuspiciousInput,
} from "@/lib/rateLimit";
import { sendCommentNotification } from "@/utils/emailService";
import { Comment } from "@/types/Comment";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const riskId = searchParams.get("riskId");
  const sortBy = searchParams.get("sortBy") || "popular"; // 'popular' or 'recent'
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!riskId) {
    return NextResponse.json({ error: "Risk ID is required" }, { status: 400 });
  }

  try {
    const queryParams = [
      Query.equal("riskId", riskId),
      Query.limit(limit),
      Query.offset(offset),
    ];

    // Add sorting based on the sortBy parameter
    if (sortBy === "recent") {
      queryParams.push(Query.orderDesc("created"));
    } else {
      // For popular comments, we'll fetch all and sort in memory
      // since Appwrite doesn't support complex sorting by calculated fields
      queryParams.push(Query.orderDesc("upvotes"));
    }

    const response = await databases.listDocuments(
      db,
      commentCollection,
      queryParams
    );

    // If sorting by popular, do additional in-memory sorting
    if (sortBy === "popular") {
      response.documents.sort((a, b) => {
        const scoreA = a.upvotes - a.downvotes;
        const scoreB = b.upvotes - b.downvotes;
        return scoreB - scoreA;
      });
    }

    return createSuccessResponse({ comments: response.documents });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await validateRequestBody(request, "/api/comments");

    // Safely cast and validate the body
    const body = {
      content: rawBody.content as string,
      authorId: rawBody.authorId as string,
      riskId: rawBody.riskId as string,
      parentId: rawBody.parentId as string | undefined,
      type: rawBody.type as "answer" | "question",
      typeId: rawBody.typeId as string,
    };

    // Enhanced input validation
    const contentValidation = validateString(body.content, "Comment content", {
      required: true,
      minLength: 5, // Increased minimum length requirement
      maxLength: 10000,
      minMeaningfulChars: 5, // Must have at least 5 meaningful characters
      blockSingleChar: true,
    });

    if (!contentValidation.isValid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

    if (!body.typeId || body.typeId.trim() === "") {
      return NextResponse.json(
        { error: "Type ID is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!body.riskId || body.riskId.trim() === "") {
      return NextResponse.json(
        { error: "Risk ID is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!["answer", "question"].includes(body.type)) {
      return NextResponse.json(
        { error: "Type must be either 'answer' or 'question'" },
        { status: 400 }
      );
    }

    // Check for suspicious patterns that may indicate attacks
    if (isSuspiciousInput(body.content)) {
      return NextResponse.json(
        { error: "Comment contains suspicious patterns" },
        { status: 400 }
      );
    }

    // Check rate limit
    const underLimit = await checkCommentRateLimit(body.authorId);
    if (!underLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before posting again." },
        { status: 429 }
      );
    }

    // Check for spam
    if (isSpam(body.content)) {
      return NextResponse.json(
        { error: "Comment detected as potential spam" },
        { status: 400 }
      );
    }

    // Extract mentions from content (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(body.content.matchAll(mentionRegex))
      .map((match) => match[1])
      .filter(Boolean);

    const comment = await databases.createDocument(
      db,
      commentCollection,
      ID.unique(),
      {
        content: body.content.trim(),
        authorId: body.authorId,
        riskId: body.riskId.trim(),
        parentId: body.parentId || null,
        upvotes: 0,
        downvotes: 0,
        voters: [],
        isFlagged: false,
        created: new Date().toISOString(),
        mentions,
      }
    );

    // Send notifications
    if (body.parentId) {
      // Get parent comment for reply notification
      const parentComment = await databases.getDocument(
        db,
        commentCollection,
        body.parentId
      );
      await sendCommentNotification(
        comment as unknown as Comment,
        "reply",
        parentComment as unknown as Comment
      );
    }

    // Send mention notifications
    if (mentions.length > 0) {
      await sendCommentNotification(comment as unknown as Comment, "mention");
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
