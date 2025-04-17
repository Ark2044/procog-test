import { NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, riskCollection } from "@/models/name";

export async function GET() {
  try {
    // Fetch all risks from the database
    const response = await databases.listDocuments(db, riskCollection);

    return NextResponse.json({ risks: response.documents });
  } catch (error) {
    console.error("Error fetching all risks:", error);
    return NextResponse.json(
      { error: "Failed to fetch risks" },
      { status: 500 }
    );
  }
}
