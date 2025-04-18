import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  // Await params to get the actual value
  const { commentId } = await params;

  try {
    const body = await request.json();
    const { content, mentions } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const comment = await databases.updateDocument(
      db,
      commentCollection,
      commentId,
      {
        content,
        mentions: mentions || [],
      }
    );

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  try {
    await databases.deleteDocument(db, commentCollection, commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
