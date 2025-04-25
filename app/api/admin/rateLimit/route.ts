import { NextRequest, NextResponse } from "next/server";
import { isRateLimitEnabled, setRateLimitEnabled } from "@/lib/rateLimit";

// Get the current rate limit status
export async function GET() {
  try {
    // Get the current rate limit status
    const enabled = await isRateLimitEnabled();

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Error getting rate limit status:", error);
    return NextResponse.json(
      { error: "Failed to get rate limit status" },
      { status: 500 }
    );
  }
}

// Update rate limit status
export async function POST(request: NextRequest) {
  try {
    // Verify admin access

    // Parse request body
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request. 'enabled' must be a boolean." },
        { status: 400 }
      );
    }

    // Set the rate limit status
    const success = await setRateLimitEnabled(enabled);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update rate limit setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enabled,
      message: `Rate limiting has been ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error("Error updating rate limit status:", error);
    return NextResponse.json(
      { error: "Failed to update rate limit status" },
      { status: 500 }
    );
  }
}
