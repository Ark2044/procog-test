import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, riskCollection } from "@/models/name";
import { Query } from "node-appwrite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Fetch all risks created by the specific user
    const response = await databases.listDocuments(db, riskCollection, [
      Query.equal("authorId", userId),
    ]);

    return NextResponse.json({
      success: true,
      risks: response.documents,
      total: response.total,
    });
  } catch (error) {
    console.error("Error fetching user risks:", error);
    return NextResponse.json(
      { error: "Failed to fetch user risks" },
      { status: 500 }
    );
  }
}
