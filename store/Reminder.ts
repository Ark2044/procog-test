// store/Reminder.ts
import { create } from "zustand";
import { databases } from "@/models/client/config";
import { Query } from "appwrite";
import { db, reminderCollection } from "@/models/name";
import { Reminder } from "@/types/Reminder";

interface ReminderStore {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  fetchReminders: (userId: string) => Promise<void>;
  addReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (
    reminderId: string,
    data: Partial<Reminder>
  ) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
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

      set({
        reminders: response.documents.map((doc) => ({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          datetime: doc.datetime,
          recurrence: doc.recurrence,
          userId: doc.userId,
          riskId: doc.riskId,
          riskTitle: doc.riskTitle,
          status: doc.status,
          created: doc.created,
          updated: doc.updated,
        })) as Reminder[],
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

  addReminder: async (reminder: Reminder) => {
    set({ loading: true, error: null });
    try {
      set((state) => ({
        reminders: [...state.reminders, reminder],
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

  updateReminder: async (reminderId: string, data: Partial<Reminder>) => {
    set({ loading: true, error: null });
    try {
      await databases.updateDocument(db, reminderCollection, reminderId, data);

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
