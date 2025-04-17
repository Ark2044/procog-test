import { NextRequest, NextResponse } from "next/server";
import { users } from "@/models/server/config";
import { validateAdminUpdate } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, name, email } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!name && !email) {
      return NextResponse.json(
        { error: "Name or email is required" },
        { status: 400 }
      );
    }

    // Validate using general admin update validator
    const validation = validateAdminUpdate({
      userId,
      ...(name && { name }),
      ...(email && { email }),
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid data" },
        { status: 400 }
      );
    }

    // First check if user exists
    try {
      await users.get(userId);
    } catch {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is unique if changing email
    if (email) {
      try {
        // Check if the email is already in use by another user
        const existingUsers = await users.list([`email=${email}`]);
        const emailExists =
          existingUsers.total > 0 &&
          existingUsers.users.some((user) => user.$id !== userId);

        if (emailExists) {
          return NextResponse.json(
            { error: "Email is already in use by another user" },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error checking email uniqueness:", error);
        // Continue processing even if we couldn't verify uniqueness
      }
    }

    // Update the user information
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    await users.updateName(userId, updateData.name);
    if (email) {
      await users.updateEmail(userId, email);
    }

    return NextResponse.json({
      success: true,
      message: "User information updated successfully",
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return NextResponse.json(
      { error: "Failed to update user information" },
      { status: 500 }
    );
  }
}
