import { NextResponse } from "next/server";
import { users } from "@/models/server/config";

export async function GET() {
  try {
    const response = await users.list();
    return NextResponse.json({ users: response.users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
