import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { ID } from "appwrite";

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
                // Query parameters
            ]
        );
        return NextResponse.json(response.documents);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, authorId, riskId, parentId, mentions } = body;

        if (!content || !authorId || !riskId) {
            return NextResponse.json(
                { error: "Missing required fields" },
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

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}