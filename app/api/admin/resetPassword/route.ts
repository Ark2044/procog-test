import { NextRequest, NextResponse } from "next/server";
import { users } from "@/models/server/config";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, newPassword, confirmPassword } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // We don't need validateAdminUpdate for password reset
    // This was causing the error: "At least one field (role or department) must be updated"

    // First check if user exists
    try {
      await users.get(userId);
    } catch {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user's password
    await users.updatePassword(userId, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      newPassword: newPassword, // Return the password so it can be shown to the admin
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
