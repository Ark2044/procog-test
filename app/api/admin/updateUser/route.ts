import { NextResponse } from "next/server";
import { users } from "@/models/server/config";

export async function POST(request: Request) {
  try {
    const { userId, role, department } = await request.json();

    // Get the current user's preferences
    const user = await users.get(userId);
    const currentPrefs = user.prefs || {};

    // Update only the provided fields while preserving other preferences
    const updatedPrefs = {
      ...currentPrefs,
      ...(role !== undefined && { role }),
      // Handle department explicitly to allow setting to null/empty
      ...(department !== undefined && { department }),
    };

    // Update the user's preferences
    const updatedUser = await users.updatePrefs(userId, updatedPrefs);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
