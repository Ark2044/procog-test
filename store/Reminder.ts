import { create } from 'zustand';
import { Reminder } from '@/types/Reminder';
import { databases } from '@/models/client/config';
import { ID, Query } from 'appwrite';
import env from '@/app/env';

const COLLECTION_ID = 'reminders';

// Collection functions
export const getReminders = async (userId: string) => {
    return await databases.listDocuments(
        env.appwrite.databaseId,
        COLLECTION_ID,
        [Query.equal('userId', userId)]
    );
};

export const createReminder = async (data: Omit<Reminder, '$id' | 'created' | 'updated'>) => {
    return await databases.createDocument(
        env.appwrite.databaseId,
        COLLECTION_ID,
        ID.unique(),
        {
            ...data,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
        }
    );
};

export const updateReminder = async (reminderId: string, data: Partial<Reminder>) => {
    return await databases.updateDocument(
        env.appwrite.databaseId,
        COLLECTION_ID,
        reminderId,
        {
            ...data,
            updated: new Date().toISOString(),
        }
    );
};

export const deleteReminder = async (reminderId: string) => {
    return await databases.deleteDocument(
        env.appwrite.databaseId,
        COLLECTION_ID,
        reminderId
    );
};

// Zustand store interface
interface ReminderState {
    reminders: Reminder[];
    loading: boolean;
    error: string | null;
    fetchReminders: (userId: string) => Promise<void>;
    createReminder: (data: Omit<Reminder, '$id' | 'created' | 'updated'>) => Promise<void>;
    updateReminder: (reminderId: string, data: Partial<Reminder>) => Promise<void>;
    deleteReminder: (reminderId: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set) => ({
    reminders: [],
    loading: false,
    error: null,

    fetchReminders: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            console.log('Fetching reminders for user:', userId);
            const response = await getReminders(userId);
            console.log('Fetched reminders:', response.documents.length);
            set({ reminders: response.documents.map(doc => ({
                $id: doc.$id,
                title: doc.title,
                datetime: doc.datetime,
                userId: doc.userId,
                riskId: doc.riskId,
                created: doc.created,
                updated: doc.updated,
                description: doc.description,
                status: doc.status,
                recurrence: doc.recurrence,
                email: doc.email,
            })) as Reminder[] });
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
            set({ error: 'Failed to fetch reminders' });
        } finally {
            set({ loading: false });
        }
    },

    createReminder: async (data) => {
        set({ loading: true, error: null });
        try {
            console.log('Creating reminder:', data);
            const reminder = await createReminder(data);
            console.log('Created reminder:', reminder.$id);
            set((state) => ({
                reminders: [...state.reminders, {
                    $id: reminder.$id,
                    title: reminder.title,
                    datetime: reminder.datetime,
                    userId: reminder.userId,
                    riskId: reminder.riskId,
                    created: reminder.created,
                    updated: reminder.updated,
                    description: reminder.description,
                    status: reminder.status,
                    recurrence: reminder.recurrence,
                    email: reminder.email,
                } as Reminder]
            }));
        } catch (error) {
            console.error('Failed to create reminder:', error);
            set({ error: 'Failed to create reminder' });
        } finally {
            set({ loading: false });
        }
    },

    updateReminder: async (reminderId, data) => {
        set({ loading: true, error: null });
        try {
            console.log('Updating reminder:', reminderId, data);
            const updated = await updateReminder(reminderId, data);
            console.log('Updated reminder:', updated.$id);
            set((state) => ({
                reminders: state.reminders.map((r) => 
                    r.$id === reminderId ? { ...r, ...updated } : r
                )
            }));
        } catch (error) {
            console.error('Failed to update reminder:', error);
            set({ error: 'Failed to update reminder' });
        } finally {
            set({ loading: false });
        }
    },

    deleteReminder: async (reminderId) => {
        set({ loading: true, error: null });
        try {
            console.log('Deleting reminder:', reminderId);
            await deleteReminder(reminderId);
            console.log('Deleted reminder:', reminderId);
            set((state) => ({
                reminders: state.reminders.filter((r) => r.$id !== reminderId)
            }));
        } catch (error) {
            console.error('Failed to delete reminder:', error);
            set({ error: 'Failed to delete reminder' });
        } finally {
            set({ loading: false });
        }
    }
}));