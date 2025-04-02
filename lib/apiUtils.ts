import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

export interface ApiError {
  message: string;
  code: number;
  details?: unknown;
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof AppwriteException) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.code }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}

export async function validateRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid request body");
  }
}

export function createSuccessResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}