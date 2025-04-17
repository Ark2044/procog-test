import { NextResponse } from "next/server";
import { users } from "@/models/server/config";
import {
  validateEmail,
  validateName,
  validateDepartment,
  validateRole,
} from "@/lib/validation";
import { v4 as uuidv4 } from "uuid"; // Use uuid instead of ID

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

    // Create temporary password (in a real app, you'd send an email with this or a reset link)
    const tempPassword = uuidv4();

    // Create a new user
    const newUser = await users.create(email, tempPassword, name);

    // Set the user's preferences
    const prefs = {
      role: role || "user",
      department: department || "",
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
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
