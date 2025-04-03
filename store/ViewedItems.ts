import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewedItemsState {
  // Tracks the last viewed comment count for each risk, per user
  viewedComments: Record<string, Record<string, number>>; // userId -> {riskId: count}
  // Tracks the last viewed reminder count for each risk, per user
  viewedReminders: Record<string, Record<string, number>>; // userId -> {riskId: count}
  // Mark comments as viewed for a specific risk and user
  markCommentsViewed: (userId: string, riskId: string, count: number) => void;
  // Mark reminders as viewed for a specific risk and user
  markRemindersViewed: (userId: string, riskId: string, count: number) => void;
  // Check if there are new comments for a risk since last viewed by this user
  hasNewComments: (
    userId: string,
    riskId: string,
    currentCount: number
  ) => boolean;
  // Check if there are new reminders for a risk since last viewed by this user
  hasNewReminders: (
    userId: string,
    riskId: string,
    currentCount: number
  ) => boolean;
  // Get the number of new comments since last viewed by this user
  getNewCommentsCount: (
    userId: string,
    riskId: string,
    currentCount: number
  ) => number;
  // Get the number of new reminders since last viewed by this user
  getNewRemindersCount: (
    userId: string,
    riskId: string,
    currentCount: number
  ) => number;
  // Clear all viewed items for a specific user
  clearUserData: (userId: string) => void;
  // Clear all data
  clearAll: () => void;
}

export const useViewedItemsStore = create<ViewedItemsState>()(
  persist(
    (set, get) => ({
      viewedComments: {},
      viewedReminders: {},

      markCommentsViewed: (userId: string, riskId: string, count: number) => {
        if (!userId) return;

        set((state) => {
          const userComments = state.viewedComments[userId] || {};

          return {
            viewedComments: {
              ...state.viewedComments,
              [userId]: {
                ...userComments,
                [riskId]: count,
              },
            },
          };
        });
      },

      markRemindersViewed: (userId: string, riskId: string, count: number) => {
        if (!userId) return;

        set((state) => {
          const userReminders = state.viewedReminders[userId] || {};

          return {
            viewedReminders: {
              ...state.viewedReminders,
              [userId]: {
                ...userReminders,
                [riskId]: count,
              },
            },
          };
        });
      },

      hasNewComments: (
        userId: string,
        riskId: string,
        currentCount: number
      ) => {
        if (!userId) return false;

        const userComments = get().viewedComments[userId] || {};
        const lastViewedCount = userComments[riskId] || 0;
        return currentCount > lastViewedCount;
      },

      hasNewReminders: (
        userId: string,
        riskId: string,
        currentCount: number
      ) => {
        if (!userId) return false;

        const userReminders = get().viewedReminders[userId] || {};
        const lastViewedCount = userReminders[riskId] || 0;
        return currentCount > lastViewedCount;
      },

      getNewCommentsCount: (
        userId: string,
        riskId: string,
        currentCount: number
      ) => {
        if (!userId) return 0;

        const userComments = get().viewedComments[userId] || {};
        const lastViewedCount = userComments[riskId] || 0;
        return Math.max(0, currentCount - lastViewedCount);
      },

      getNewRemindersCount: (
        userId: string,
        riskId: string,
        currentCount: number
      ) => {
        if (!userId) return 0;

        const userReminders = get().viewedReminders[userId] || {};
        const lastViewedCount = userReminders[riskId] || 0;
        return Math.max(0, currentCount - lastViewedCount);
      },

      clearUserData: (userId: string) => {
        if (!userId) return;

        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [userId]: _, ...remainingComments } = state.viewedComments;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [userId]: __, ...remainingReminders } = state.viewedReminders;

          return {
            viewedComments: remainingComments,
            viewedReminders: remainingReminders,
          };
        });
      },

      clearAll: () => {
        set({
          viewedComments: {},
          viewedReminders: {},
        });
      },
    }),
    {
      name: "viewed-items-storage", // Name for localStorage
      // Only persist viewedComments and viewedReminders
      partialize: (state) => ({
        viewedComments: state.viewedComments,
        viewedReminders: state.viewedReminders,
      }),
    }
  )
);
