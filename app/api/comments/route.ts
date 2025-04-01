import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { ID } from "appwrite";
import { handleApiError, createSuccessResponse, validateRequestBody } from "@/lib/apiUtils";
import { validateComment } from "@/lib/validation";
import { checkCommentRateLimit, isSpam } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const riskId = searchParams.get('riskId');

    if (!riskId) {
        return NextResponse.json({ error: "Risk ID is required" }, { status: 400 });
    }

    try {
        const response = await databases.listDocuments(
            db,
            commentCollection,
            [
                // Query parameters for comments
            ]
        );
        return createSuccessResponse(response.documents);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await validateRequestBody(request) as {
            content: string;
            authorId: string;
            riskId: string;
            parentId?: string;
            mentions?: string[];
        };
        const { content, authorId, riskId, parentId, mentions } = body;

        // Validate input
        const validation = validateComment({
            content,
            type: parentId ? "answer" : "question",
            typeId: riskId
        });

        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
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
                mentions: mentions || []
            }
        );

        return createSuccessResponse(comment, 201);
    } catch (error) {
        return handleApiError(error);
    }
}