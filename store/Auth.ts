import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
  reputation: number;
  role: string;         // e.g., "user", "admin"
  department: string;   // e.g., "sales", "engineering"
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
          if (error instanceof AppwriteException && error.code === 401) {
            set({ session: null, user: null, jwt: null });
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

          if (!user.prefs?.role || !user.prefs?.department || user.prefs?.reputation === undefined) {
            await account.updatePrefs<UserPrefs>({
              reputation: user.prefs?.reputation || 0,
              role: user.prefs?.role || "user",
              department: user.prefs?.department || "general"
            });
            const updatedUser = await account.get<UserPrefs>();
            set({ session, user: updatedUser, jwt });
          } else {
            set({ session, user, jwt });
          }
          
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
          // Create the account
          await account.create(ID.unique(), email, password, name);
          
          // Set up initial preferences
          await account.updatePrefs<UserPrefs>({
            reputation: 0,
            role: "user",
            department: "general"
          });
          
          // Get the updated user after preferences are set
          const updatedUser = await account.get<UserPrefs>();
          set({ user: updatedUser });
          
          // Automatically log in after account creation
          const session = await account.createEmailPasswordSession(email, password);
          const { jwt } = await account.createJWT();
          
          set({ session, jwt });
          
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
          await account.updatePrefs<UserPrefs>(prefs);
          const user = await account.get<UserPrefs>();
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
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      }
    }
  )
);