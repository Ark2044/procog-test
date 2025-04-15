import { NextRequest, NextResponse } from "next/server";
import {
  isSuspiciousInput,
  getClientIp,
  checkRateLimit,
} from "@/lib/rateLimit";

// Standard error codes
export const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

export interface ApiError {
  message: string;
  code: number;
  details?: unknown;
}

// Handle API errors consistently
export function handleApiError(error: unknown, statusCode = 500): NextResponse {
  console.error("API Error:", error);

  if (error && typeof error === "object" && "code" in error) {
    // Handle Appwrite errors
    switch (error.code) {
      case 401:
        return NextResponse.json(
          { error: (error as { message?: string }).message || "Unauthorized" },
          { status: 401 }
        );
      case 404:
        return NextResponse.json(
          { error: (error as { message?: string }).message || "Not found" },
          { status: 404 }
        );
      case 409:
        return NextResponse.json(
          { error: (error as { message?: string }).message || "Conflict" },
          { status: 409 }
        );
      case 429:
        return NextResponse.json(
          { error: (error as { message?: string }).message || "Too many requests" },
          { status: 429 }
        );
      default:
        return NextResponse.json(
          { error: (error as { message?: string }).message || "An unexpected error occurred" },
          { status: statusCode }
        );
    }
  }

  return NextResponse.json(
    { error: (error as { message?: string }).message || "An unexpected error occurred" },
    { status: statusCode }
  );
}

// Create a consistent success response
export function createSuccessResponse(
  data: Record<string, unknown>,
  statusCode = 200
): NextResponse {
  return NextResponse.json(data, { status: statusCode });
}

// Validate request body with enhanced security checks
export async function validateRequestBody(
  request: NextRequest,
  routePath?: string
): Promise<Record<string, unknown>> {
  // Apply rate limiting if route path is provided
  if (routePath) {
    const clientIp = getClientIp(request);
    const isAllowed = await checkRateLimit(clientIp, routePath);

    if (!isAllowed) {
      throw new Error("Too many requests. Please try again later.");
    }
  }

  try {
    const body = await request.json();

    // Validate all string inputs for suspicious patterns
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string" && value.trim()) {
        // Check for suspicious patterns
        if (isSuspiciousInput(value)) {
          throw new Error(`Invalid input detected in ${key}`);
        }

        // Check for minimal content - a single dot or character
        if (value.trim().length <= 1) {
          throw new Error(`Field ${key} cannot be a single character`);
        }

        // For text fields, ensure they have at least some meaningful content
        if (
          key.includes("content") ||
          key.includes("title") ||
          key.includes("description")
        ) {
          const meaningfulChars = value
            .trim()
            .replace(/\s+|[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          if (meaningfulChars.length < 3) {
            throw new Error(
              `${key} must contain at least 3 meaningful characters`
            );
          }
        }
      }
    }

    return body;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Too many requests. Please try again later."
    ) {
      throw error;
    }

    if (
      (error instanceof Error && error.message.startsWith("Invalid input")) ||
      (error instanceof Error &&
        error.message.includes("must contain at least"))
    ) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON in request body");
    }

    throw error;
  }
}
