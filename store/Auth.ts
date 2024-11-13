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
          const session = await account.getSession("current");
          set({ session });
        } catch (error) {
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
        set({ loading: true });
        try {
          await account.deleteSessions();
          set({ session: null, jwt: null, user: null });
        } catch (error) {
          set({ error: error instanceof AppwriteException ? error : null });
        } finally {
          set({ loading: false });
        }
      },

      async updateUserProfile(prefs: UserPrefs) {
        set({ loading: true, error: null });
        try {
          // Call your API to update user preferences
          await account.updatePrefs<UserPrefs>(prefs);

          // Optionally fetch the updated user info after updating
          const user = await account.get<UserPrefs>();
          set({ user }); // Update the user state with the new preferences

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
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      }
    }
  )
);
