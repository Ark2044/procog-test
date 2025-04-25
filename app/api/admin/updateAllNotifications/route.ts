import { NextResponse } from "next/server";
import { users } from "@/models/server/config";
import { Query } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Enabled status must be a boolean" },
        { status: 400 }
      );
    }

    // Fetch all users with pagination (100 users per page)
    const MAX_USERS_PER_PAGE = 100;
    let allUserIds: string[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await users.list([
        Query.limit(MAX_USERS_PER_PAGE),
        Query.offset(offset),
      ]);

      allUserIds = allUserIds.concat(response.users.map((user) => user.$id));

      if (response.users.length < MAX_USERS_PER_PAGE) {
        hasMore = false;
      } else {
        offset += MAX_USERS_PER_PAGE;
      }
    }

    // Update each user's notification preferences
    let successCount = 0;
    let failureCount = 0;

    for (const userId of allUserIds) {
      try {
        const user = await users.get(userId);
        const currentPrefs = user.prefs || {};

        // Update the receiveNotifications field
        await users.updatePrefs(userId, {
          ...currentPrefs,
          receiveNotifications: enabled,
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to update user ${userId}:`, err);
        failureCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated notification settings for ${successCount} users`,
      successCount,
      failureCount,
      totalUsers: allUserIds.length,
    });
  } catch (error) {
    console.error("Error updating notification settings for all users:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
