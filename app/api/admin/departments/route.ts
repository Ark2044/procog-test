import { NextResponse } from "next/server";
import {
  getAllDepartments,
  addCustomDepartment,
  removeCustomDepartment,
  validateNewDepartment,
} from "@/lib/validation";

// Store departments in a simple file-based approach
// In a production environment, this would be a database
let customDepartments: string[] = [];

export async function GET() {
  try {
    const departments = getAllDepartments();
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { department } = await request.json();

    // Validate the department name
    const validation = validateNewDepartment(department);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Add the department
    addCustomDepartment(department);
    customDepartments.push(department);

    return NextResponse.json({
      success: true,
      department,
      departments: getAllDepartments(),
    });
  } catch (error) {
    console.error("Error adding department:", error);
    return NextResponse.json(
      { error: "Failed to add department" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    if (!department) {
      return NextResponse.json(
        { error: "Department parameter is required" },
        { status: 400 }
      );
    }

    // Check if department is in the defaults list
    if (department.startsWith("DEFAULT:")) {
      return NextResponse.json(
        { error: "Cannot delete default departments" },
        { status: 400 }
      );
    }

    // Remove the department
    removeCustomDepartment(department);
    customDepartments = customDepartments.filter((d) => d !== department);

    return NextResponse.json({
      success: true,
      departments: getAllDepartments(),
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
