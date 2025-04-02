import { databases } from "@/models/client/config";
import { db, riskCollection } from "@/models/name";
import { UserPrefs } from "@/store/Auth";
import { Models } from "node-appwrite";

// Removed redundant User interface

export async function hasRiskPermission(
  user: Models.User<UserPrefs> | null,
  riskId: string,
  action: "read" | "update" | "delete"
): Promise<boolean> {
  if (!user) return false;

  try {
    const risk = await databases.getDocument(db, riskCollection, riskId);

    // Admin has full access
    if (user.prefs?.role === "admin") return true;

    // Author has full access to their own risks
    if (risk.authorId === user.$id) return true;

    // For confidential risks, check authorized viewers
    if (risk.isConfidential) {
      if (!risk.authorizedViewers?.includes(user.$id)) {
        return false;
      }
    }

    // Department-based access
    if (risk.department && risk.department !== user.prefs?.department) {
      return false;
    }

    // Read permissions are more permissive
    if (action === "read") return true;

    // For update/delete, only author and admin can perform these actions
    return false;
  } catch (error) {
    console.error("Error checking risk permissions:", error);
    return false;
  }
}