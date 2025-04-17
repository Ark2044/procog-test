import { NextRequest, NextResponse } from "next/server";
import { users } from "@/models/server/config";
import { validateAdminUpdate } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate using general admin update validator
    const validation = validateAdminUpdate({ userId });

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

    // Generate a secure random password (12 characters)
    const newPassword = generateRandomPassword(12);

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

// Helper function to generate a secure random password
function generateRandomPassword(length: number): string {
  // Define character sets
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+[]{}|;:,.<>?";

  // Combine all character sets
  const allChars = lowercase + uppercase + numbers + special;

  // Ensure we have at least one character from each set
  let password =
    lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
    uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
    special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest of the password with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password characters
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}
