import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { databases } from "@/models/server/config";
import { db, departmentCollection } from "@/models/name";
import { validateNewDepartment, DEFAULT_DEPARTMENTS } from "@/lib/validation";

// Initialize default departments if needed
async function ensureDefaultDepartments() {
  try {
    for (const dept of DEFAULT_DEPARTMENTS) {
      // Check if default department exists
      const existing = await databases.listDocuments(db, departmentCollection, [
        Query.equal("name", dept),
      ]);

      // If not found, create it
      if (existing.total === 0) {
        await databases.createDocument(db, departmentCollection, ID.unique(), {
          name: dept,
          isDefault: true,
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring default departments:", error);
  }
}

// Get all departments from the database
async function getAllDepartments() {
  try {
    await ensureDefaultDepartments();
    const response = await databases.listDocuments(
      db,
      departmentCollection,
      []
    );
    return response.documents.map((doc) => doc.name);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [...DEFAULT_DEPARTMENTS];
  }
}

export async function GET() {
  try {
    const departments = await getAllDepartments();
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
    const validation = await validateNewDepartment(department);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if department already exists
    const existing = await databases.listDocuments(db, departmentCollection, [
      Query.equal("name", department),
    ]);

    if (existing.total > 0) {
      return NextResponse.json(
        { error: "Department already exists" },
        { status: 400 }
      );
    }

    // Add the department to the database
    await databases.createDocument(db, departmentCollection, ID.unique(), {
      name: department,
      isDefault: false,
    });

    const departments = await getAllDepartments();

    return NextResponse.json({
      success: true,
      department,
      departments,
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

    // Find the department document
    const existing = await databases.listDocuments(db, departmentCollection, [
      Query.equal("name", department),
    ]);

    if (existing.total === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const departmentDoc = existing.documents[0];

    // Check if this is a default department
    if (departmentDoc.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default departments" },
        { status: 400 }
      );
    }

    // Delete the department
    await databases.deleteDocument(db, departmentCollection, departmentDoc.$id);

    const departments = await getAllDepartments();

    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
