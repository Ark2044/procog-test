import { NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, riskCollection } from "@/models/name";

export async function POST(request: Request) {
  try {

    const body = await request.json();
    const { riskId, ...updateData } = body;

    if (!riskId) {
      return NextResponse.json(
        { error: "Risk ID is required" },
        { status: 400 }
      );
    }

    // Validate the update fields (ensuring we only update valid properties)
    const validUpdateFields = [
      "title",
      "content",
      "impact",
      "probability",
      "action",
      "department",
      "status",
      "mitigation",
      "acceptance",
      "transfer",
      "avoidance",
      "dueDate",
    ];

    const sanitizedUpdateData: Record<string, string | number | boolean | Date | null> = {};

    // Only include valid fields in the update
    Object.keys(updateData).forEach((key) => {
      if (validUpdateFields.includes(key)) {
        sanitizedUpdateData[key] = updateData[key];
      }
    });

    if (Object.keys(sanitizedUpdateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add last updated timestamp
    sanitizedUpdateData.updated = new Date().toISOString();

    // Update the risk in the database
    const updatedRisk = await databases.updateDocument(
      db,
      riskCollection,
      riskId,
      sanitizedUpdateData
    );

    return NextResponse.json({
      success: true,
      risk: updatedRisk,
    });
  } catch (error) {
    console.error("Error updating risk:", error);
    return NextResponse.json(
      { error: "Failed to update risk" },
      { status: 500 }
    );
  }
}
