'use client'
import React from "react";
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
          const user = await account.get<UserPrefs>();
          set({ session, user });
        } catch (error) {
          set({
            session: null,
            user: null,
            jwt: null,
            error: error instanceof AppwriteException ? error : null,
          });
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
            account.createJWT(),
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
            error: error instanceof AppwriteException ? error : null,
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
            error: error instanceof AppwriteException ? error : null,
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
      },
    }
  )
);

// React to Storage Changes and Ensure Proper Hydration
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "auth") {
      useAuthStore.getState().verifySession();
    }
  });
}

// Ensure the state is not stuck in loading after hydration
const useHydrationCheck = () => {
  const hydrated = useAuthStore((state) => state.hydrated);
  const verifySession = useAuthStore((state) => state.verifySession);

  React.useEffect(() => {
    if (!hydrated) return;
    verifySession().catch(() => {
      // Gracefully handle session verification errors
    });
  }, [hydrated, verifySession]);
};

export default useHydrationCheck;
