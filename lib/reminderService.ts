import { Reminder } from '@/types/Reminder';
import { databases } from '@/models/server/config';
import { Query } from 'node-appwrite';
import env from '@/app/env';
import { reminderCollection } from '@/models/name';

// Validation constants
const VALID_RECURRENCE = ['none', 'daily', 'weekly', 'monthly'] as const;

// Validate reminder data
const validateReminder = (reminder: Partial<Reminder>): { isValid: boolean; error?: string } => {
    if (!reminder.title || !reminder.datetime || !reminder.userId) {
        return { isValid: false, error: "Missing required fields" };
    }
    if (new Date(reminder.datetime) < new Date()) {
        return { isValid: false, error: "Reminder datetime must be in the future" };
    }
    if (reminder.recurrence && !VALID_RECURRENCE.includes(reminder.recurrence as typeof VALID_RECURRENCE[number])) {
        return { isValid: false, error: "Invalid recurrence value" };
    }
    return { isValid: true };
};

export async function checkAndSendReminders() {
    try {
        // Get all pending reminders
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

        console.log('Checking reminders between:', now.toISOString(), 'and', fiveMinutesFromNow.toISOString());

        const response = await databases.listDocuments(
            env.appwrite.databaseId,
            reminderCollection,
            [
                Query.equal('status', 'pending'),
                Query.lessThanEqual('datetime', fiveMinutesFromNow.toISOString()),
                Query.greaterThanEqual('datetime', now.toISOString())
            ]
        );

        console.log('Found reminders:', response.documents.length);

        const reminders = response.documents as unknown as Reminder[];
        const results = [];

        // Process each due reminder
        for (const reminder of reminders) {
            // Validate reminder data
            const validation = validateReminder(reminder);
            if (!validation.isValid) {
                console.error(`Invalid reminder data for ${reminder.$id}:`, validation.error);
                results.push({
                    reminderId: reminder.$id,
                    success: false,
                    error: validation.error
                });
                continue;
            }

            try {
                // Update reminder status
                await databases.updateDocument(
                    env.appwrite.databaseId,
                    reminderCollection,
                    reminder.$id,
                    {
                        status: 'completed'
                    }
                );

                // If it's a recurring reminder, create the next occurrence
                if (reminder.recurrence !== 'none') {
                    const nextDate = new Date(reminder.datetime);
                    switch (reminder.recurrence) {
                        case 'daily':
                            nextDate.setDate(nextDate.getDate() + 1);
                            break;
                        case 'weekly':
                            nextDate.setDate(nextDate.getDate() + 7);
                            break;
                        case 'monthly':
                            nextDate.setMonth(nextDate.getMonth() + 1);
                            break;
                    }

                    const nextReminder = {
                        ...reminder,
                        datetime: nextDate.toISOString(),
                        status: 'pending'
                    };

                    // Validate next reminder before creating
                    const nextValidation = validateReminder(nextReminder as Partial<Reminder>);
                    if (nextValidation.isValid) {
                        await databases.createDocument(
                            env.appwrite.databaseId,
                            reminderCollection,
                            'unique()',
                            nextReminder
                        );
                    } else {
                        console.error(`Failed to create next reminder for ${reminder.$id}:`, nextValidation.error);
                    }
                }

                results.push({
                    reminderId: reminder.$id,
                    success: true
                });
            } catch (error) {
                console.error(`Failed to process reminder ${reminder.$id}:`, error);
                results.push({
                    reminderId: reminder.$id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return {
            success: true,
            processed: results.length,
            results
        };
    } catch (error) {
        console.error('Error processing reminders:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            processed: 0,
            results: []
        };
    }
}