import { NextResponse } from "next/server";
import { users } from "@/models/server/config";
import { validateDepartment, validateRole } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { userId, role, department, receiveNotifications } =
      await request.json();

    // Validate inputs if provided
    if (role !== undefined) {
      const roleValidation = validateRole(role);
      if (!roleValidation.isValid) {
        return NextResponse.json(
          { error: roleValidation.error },
          { status: 400 }
        );
      }
    }

    if (department !== undefined && department !== "") {
      const departmentValidation = await validateDepartment(department);
      if (!departmentValidation.isValid) {
        return NextResponse.json(
          { error: departmentValidation.error },
          { status: 400 }
        );
      }
    }

    // Get the current user's preferences
    const user = await users.get(userId);
    const currentPrefs = user.prefs || {};

    // Update only the provided fields while preserving other preferences
    const updatedPrefs = {
      ...currentPrefs,
      ...(role !== undefined && { role }),
      // Handle department explicitly to allow setting to null/empty
      ...(department !== undefined && { department }),
      // Handle receiveNotifications toggle (convert to boolean if it's a string)
      ...(receiveNotifications !== undefined && {
        receiveNotifications:
          typeof receiveNotifications === "string"
            ? receiveNotifications === "true"
            : Boolean(receiveNotifications),
      }),
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
