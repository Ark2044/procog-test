import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { commentCollection, db } from "@/models/name";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  try {
    const body = await request.json();
    const { userId, voteType } = body;

    if (!userId || !voteType) {
      return NextResponse.json(
        { error: "User ID and vote type are required" },
        { status: 400 }
      );
    }

    const comment = await databases.getDocument(
      db,
      commentCollection,
      commentId
    );

    let upvotes = comment.upvotes;
    let downvotes = comment.downvotes;
    let voters = [...comment.voters];

    const existingVote = voters.find((v) => v.userId === userId);

    if (existingVote) {
      if (existingVote.vote === voteType) {
        // Remove vote
        voters = voters.filter((v) => v.userId !== userId);
        if (voteType === "up") upvotes--;
        else downvotes--;
      } else {
        // Change vote
        voters = voters.map((v) =>
          v.userId === userId ? { userId, vote: voteType } : v
        );
        if (voteType === "up") {
          upvotes++;
          downvotes--;
        } else {
          upvotes--;
          downvotes++;
        }
      }
    } else {
      // Add new vote
      voters.push({ userId, vote: voteType });
      if (voteType === "up") upvotes++;
      else downvotes++;
    }

    const updatedComment = await databases.updateDocument(
      db,
      commentCollection,
      commentId,
      { upvotes, downvotes, voters }
    );

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json(
      { error: "Failed to vote on comment" },
      { status: 500 }
    );
  }
}
