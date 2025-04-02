import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { ID, Query } from "appwrite";
import {
  handleApiError,
  createSuccessResponse,
  validateRequestBody,
} from "@/lib/apiUtils";
import { validateComment } from "@/lib/validation";
import { checkCommentRateLimit, isSpam } from "@/lib/rateLimit";

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

    return createSuccessResponse(response.documents);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await validateRequestBody(request)) as {
      content: string;
      authorId: string;
      riskId: string;
      parentId?: string;
      mentions?: string[];
    };
    const { content, authorId, riskId, parentId } = body;

    // Extract mentions from content (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(content.matchAll(mentionRegex))
      .map((match) => match[1])
      .filter(Boolean);

    // Validate input
    const validation = validateComment({
      content,
      type: parentId ? "answer" : "question",
      typeId: riskId,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check rate limit
    const underLimit = await checkCommentRateLimit(authorId);
    if (!underLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before posting again." },
        { status: 429 }
      );
    }

    // Check for spam
    if (isSpam(content)) {
      return NextResponse.json(
        { error: "Comment detected as potential spam" },
        { status: 400 }
      );
    }

    const comment = await databases.createDocument(
      db,
      commentCollection,
      ID.unique(),
      {
        content,
        authorId,
        riskId,
        parentId: parentId || null,
        upvotes: 0,
        downvotes: 0,
        voters: [],
        isFlagged: false,
        created: new Date().toISOString(),
        mentions,
      }
    );

    // TODO: If there are mentions, notify mentioned users
    if (mentions.length > 0) {
      // In a real implementation, you would:
      // 1. Look up user IDs from usernames
      // 2. Create notifications for each mentioned user
      console.log(`Users mentioned: ${mentions.join(", ")}`);
    }

    return createSuccessResponse(comment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
