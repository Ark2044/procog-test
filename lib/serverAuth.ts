import { cookies } from "next/headers";
import { account } from "@/models/client/config";
import { Models } from "appwrite";
import { UserPrefs } from "@/store/Auth";

export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get("appwrite_session");

    if (!sessionCookie?.value) {
      return null;
    }

    // Try to get the current session
    return account.getSession("current");
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<Models.User<UserPrefs> | null> {
  try {
    const session = await getServerSession();

    if (!session) {
      return null;
    }

    return await account.get<UserPrefs>();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
