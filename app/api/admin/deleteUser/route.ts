import { NextResponse } from "next/server";
import { users, databases } from "@/models/server/config";
import { Query } from "node-appwrite"; // Import from node-appwrite instead
import { db, riskCollection } from "@/models/name";

// Define the risk reassignment options
type RiskHandlingOption = "reassign" | "delete" | "anonymize";

export async function POST(request: Request) {
  try {
    const { userId, riskHandling, reassignToUserId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First check if the user exists
    try {
      await users.get(userId);
    } catch {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle user's risks before deletion
    // Get all risks created by this user - authorId is the field we need to query
    const userRisksResponse = await databases.listDocuments(
      db,
      riskCollection,
      [Query.equal("authorId", userId)]
    );

    const userRisks = userRisksResponse.documents;

    if (userRisks.length > 0) {
      // Handle risks based on the selected option
      switch (riskHandling as RiskHandlingOption) {
        case "reassign":
          if (!reassignToUserId) {
            return NextResponse.json(
              { error: "Reassignment user ID is required" },
              { status: 400 }
            );
          }

          // Check if the reassignment user exists
          try {
            await users.get(reassignToUserId);
          } catch {
            return NextResponse.json(
              { error: "Reassignment user not found" },
              { status: 404 }
            );
          }

          // Reassign all risks to the new user
          for (const risk of userRisks) {
            await databases.updateDocument(db, riskCollection, risk.$id, {
              authorId: reassignToUserId,
            });
          }
          break;

        case "delete":
          // Delete all risks created by the user
          for (const risk of userRisks) {
            await databases.deleteDocument(db, riskCollection, risk.$id);
          }
          break;

        case "anonymize":
          // Keep the risks but mark them as created by "Deleted User"
          // We update only the user-specific metadata
          for (const risk of userRisks) {
            await databases.updateDocument(db, riskCollection, risk.$id, {
              authorName: "Deleted User",
              isAnonymous: true,
            });
          }
          break;

        default:
          return NextResponse.json(
            { error: "Invalid risk handling option" },
            { status: 400 }
          );
      }
    }

    // Finally, delete the user
    await users.delete(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      handledRisks: userRisks.length,
    });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
