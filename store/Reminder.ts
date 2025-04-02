// store/Reminder.ts
import { create } from "zustand";
import { databases } from "@/models/client/config";
import { Query } from "appwrite";
import { db, reminderCollection, riskCollection } from "@/models/name";
import { Reminder, ReminderWithRisk } from "@/types/Reminder";
import { Risk } from "@/types/Risk";

interface ReminderStore {
  reminders: ReminderWithRisk[];
  loading: boolean;
  error: string | null;
  fetchReminders: (userId: string) => Promise<void>;
  addReminder: (
    reminder: Omit<Reminder, "$id" | "created" | "updated">
  ) => Promise<void>;
  updateReminder: (
    reminderId: string,
    data: Partial<Reminder>
  ) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  getRiskTitle: (riskId: string) => Promise<string>;
}

export const useReminderStore = create<ReminderStore>((set) => ({
  reminders: [],
  loading: false,
  error: null,

  fetchReminders: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await databases.listDocuments(db, reminderCollection, [
        Query.equal("userId", userId),
      ]);

      const reminders = response.documents.map((doc) => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        datetime: doc.datetime,
        userId: doc.userId,
        riskId: doc.riskId,
        created: doc.created,
        updated: doc.updated,
        recurrence: doc.recurrence || "none",
        status: doc.status || "pending",
        email: doc.email,
      })) as Reminder[];

      // Get unique risk IDs
      const riskIds = [...new Set(reminders.map((r) => r.riskId))];

      // Fetch risk data in batch if possible
      const riskData: Record<string, Risk> = {};

      // Using Promise.all for parallel processing if your API supports it
      await Promise.all(
        riskIds.map(async (riskId) => {
          try {
            const risk = await databases.getDocument(
              db,
              riskCollection,
              riskId
            );
            riskData[riskId] = risk as unknown as Risk;
          } catch (error) {
            console.error(`Failed to fetch risk ${riskId}:`, error);
          }
        })
      );

      // Combine reminders with risk data
      const remindersWithRisk = reminders.map((reminder) => ({
        ...reminder,
        risk: riskData[reminder.riskId]
          ? {
              title: riskData[reminder.riskId].title,
            }
          : undefined,
        reminderDate: reminder.datetime, // Map datetime to reminderDate
        note: "", // Provide a default value for note
      }));

      set({
        reminders: remindersWithRisk,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching reminders:", error);
      set({
        error: "Failed to fetch reminders",
        loading: false,
      });
    }
  },

  addReminder: async (reminder) => {
    set({ loading: true, error: null });
    try {
      // Get the risk title
      let riskTitle = "";
      try {
        const risk = await databases.getDocument(
          db,
          riskCollection,
          reminder.riskId
        );
        riskTitle = risk.title;
      } catch (error) {
        console.error(`Failed to fetch risk ${reminder.riskId}:`, error);
      }

      // Update local state
      set((state) => ({
        reminders: [
          ...state.reminders,
          {
            ...reminder,
            $id: "", // Provide a default or generated ID
            created: new Date().toISOString(), // Provide a default created timestamp
            updated: new Date().toISOString(), // Provide a default updated timestamp
            risk: { title: riskTitle },
            reminderDate: reminder.datetime,
            note: "",
            recurrence: reminder.recurrence || "none",
            status: reminder.status || "pending",
          },
        ],
        loading: false,
      }));
    } catch (error) {
      console.error("Error adding reminder:", error);
      set({
        error: "Failed to add reminder",
        loading: false,
      });
    }
  },

  getRiskTitle: async (riskId: string): Promise<string> => {
    try {
      const risk = await databases.getDocument(db, riskCollection, riskId);
      return risk.title;
    } catch (error) {
      console.error(`Failed to fetch risk title for ${riskId}:`, error);
      return "";
    }
  },

  updateReminder: async (reminderId: string, data: Partial<Reminder>) => {
    set({ loading: true, error: null });
    try {
      await databases.updateDocument(db, reminderCollection, reminderId, {
        ...data,
        updated: new Date().toISOString(),
      });

      set((state) => ({
        reminders: state.reminders.map((reminder) =>
          reminder.$id === reminderId ? { ...reminder, ...data } : reminder
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Error updating reminder:", error);
      set({
        error: "Failed to update reminder",
        loading: false,
      });
    }
  },

  deleteReminder: async (reminderId: string) => {
    set({ loading: true, error: null });
    try {
      await databases.deleteDocument(db, reminderCollection, reminderId);

      set((state) => ({
        reminders: state.reminders.filter(
          (reminder) => reminder.$id !== reminderId
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      set({
        error: "Failed to delete reminder",
        loading: false,
      });
    }
  },
}));
