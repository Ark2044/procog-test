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

    let upvotes = comment.upvotes || 0;
    let downvotes = comment.downvotes || 0;
    let voters = Array.isArray(comment.voters) ? [...comment.voters] : [];

    // Format: "userId:voteType"
    const voterKey = `${userId}:${voteType}`;
    const oppositeVoteKey = `${userId}:${voteType === "up" ? "down" : "up"}`;

    if (voters.includes(voterKey)) {
      // Remove vote if the same type exists
      voters = voters.filter((v) => v !== voterKey);
      if (voteType === "up") upvotes--;
      else downvotes--;
    } else {
      // Check if opposite vote exists and remove it
      if (voters.includes(oppositeVoteKey)) {
        voters = voters.filter((v) => v !== oppositeVoteKey);
        if (voteType === "up") {
          downvotes--;
        } else {
          upvotes--;
        }
      }

      // Add new vote
      voters.push(voterKey);
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
