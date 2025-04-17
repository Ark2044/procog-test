import { NextResponse } from "next/server";
import { users } from "@/models/server/config";
import {
  validateEmail,
  validateName,
  validateDepartment,
  validateRole,
} from "@/lib/validation";
import { v4 as uuidv4 } from "uuid"; // Use uuid for generating IDs

export async function POST(request: Request) {
  try {
    const { name, email, role, department } = await request.json();

    // Validate the inputs
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    if (department) {
      const departmentValidation = validateDepartment(department);
      if (!departmentValidation.isValid) {
        return NextResponse.json(
          { error: departmentValidation.error },
          { status: 400 }
        );
      }
    }

    if (role) {
      const roleValidation = validateRole(role);
      if (!roleValidation.isValid) {
        return NextResponse.json(
          { error: roleValidation.error },
          { status: 400 }
        );
      }
    }

    // Create temporary password
    const tempPassword = uuidv4().substring(0, 8);

    // Generate a valid user ID (must be <= 36 chars with valid characters)
    const userId = uuidv4();

    // Create a new user with the generated userId
    const newUser = await users.create(userId, email, undefined, tempPassword, name);

    // Set the user's preferences
    const prefs = {
      role: role || "user",
      department: department === "none" ? "" : department || "",
      reputation: 0,
      receiveNotifications: true,
    };

    await users.updatePrefs(newUser.$id, prefs);

    return NextResponse.json({
      success: true,
      user: {
        ...newUser,
        prefs,
      },
      tempPassword: tempPassword, // In a real app, this would be sent via email, not returned in response
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    // Check for duplicate email error
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
