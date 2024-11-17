import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
  reputation: number;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<UserPrefs> | null;
  hydrated: boolean;
  loading: boolean;
  error: AppwriteException | null;

  setHydrated(): void;
  verifySession(): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  createAccount(
    name: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  logout(): Promise<void>;
  updateUserProfile: (prefs: UserPrefs) => Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,
      loading: false,
      error: null,

      setHydrated() {
        set({ hydrated: true });
      },

      async verifySession() {
        set({ loading: true, error: null });
        try {
          const session = await account.getSession("current"); // Check the current session
          const [user, { jwt }] = await Promise.all([
            account.get<UserPrefs>(), // Fetch user details
            account.createJWT() // Fetch JWT
          ]);
          set({ session, user, jwt });
        } catch (error) {
          if (error instanceof AppwriteException) {
            console.warn("Session expired or invalid. Logging out.");
            await account.deleteSessions(); // Clear expired sessions on Appwrite
            set({ session: null, jwt: null, user: null }); // Reset local state
            alert("Your session has expired. Please log in again."); // Notify user
          }
          set({ error: error instanceof AppwriteException ? error : null });
        } finally {
          set({ loading: false });
        }
      },

      async login(email: string, password: string) {
        set({ loading: true, error: null });
        try {
          const session = await account.createEmailPasswordSession(email, password);
          const [user, { jwt }] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT()
          ]);

          if (!user.prefs?.reputation) {
            await account.updatePrefs<UserPrefs>({ reputation: 0 });
          }

          set({ session, user, jwt });
          return { success: true };
        } catch (error) {
          set({ error: error instanceof AppwriteException ? error : null });
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null
          };
        } finally {
          set({ loading: false });
        }
      },

      async createAccount(name: string, email: string, password: string) {
        set({ loading: true, error: null });
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error) {
          set({ error: error instanceof AppwriteException ? error : null });
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null
          };
        } finally {
          set({ loading: false });
        }
      },

      async logout() {
        set({ loading: true, error: null });
        try {
          console.log("Attempting to log out...");
          await account.deleteSessions(); // Delete all sessions
          console.log("Successfully logged out on the server.");
          set({ session: null, jwt: null, user: null });
          console.log("State cleared.");
        } catch (error) {
          console.error("Error during logout:", error);
          set({ error: error instanceof AppwriteException ? error : null });
        } finally {
          set({ loading: false });
          console.log("Logout process finished.");
        }
      },
      

      async updateUserProfile(prefs: UserPrefs) {
        set({ loading: true, error: null });
        try {
          await account.updatePrefs<UserPrefs>(prefs);
          const user = await account.get<UserPrefs>(); // Optionally fetch updated user data
          set({ user });
          return { success: true };
        } catch (error) {
          set({ error: error instanceof AppwriteException ? error : null });
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        } finally {
          set({ loading: false });
        }
      },
    })),

    {
      name: "auth",
      onRehydrateStorage() {
        return async (state, error) => {
          if (!error && state) {
            await state.verifySession(); // Verify session after rehydration
            state.setHydrated(); // Mark the store as hydrated
          }
        };
      }
    }
  )
);
