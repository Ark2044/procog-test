import { Reminder } from '@/types/Reminder';
import { sendReminderEmail } from './email';
import { databases } from '@/models/server/config';
import { Query } from 'node-appwrite';
import env from '@/app/env';

const COLLECTION_ID = 'reminders';

export async function checkAndSendReminders() {
    try {
        // Get all pending reminders
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

        const response = await databases.listDocuments(
            env.appwrite.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', 'pending'),
                Query.lessThanEqual('datetime', fiveMinutesFromNow.toISOString()),
                Query.greaterThanEqual('datetime', now.toISOString())
            ]
        );

        const reminders = response.documents as unknown as Reminder[];
        const results = [];

        // Send emails for each due reminder
        for (const reminder of reminders) {
            const emailResult = await sendReminderEmail(
                reminder.email,
                `Reminder: ${reminder.title}`,
                reminder.title,
                reminder.description,
                reminder.riskId
            );

            if (emailResult.success) {
                // Update reminder status
                await databases.updateDocument(
                    env.appwrite.databaseId,
                    COLLECTION_ID,
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

                    await databases.createDocument(
                        env.appwrite.databaseId,
                        COLLECTION_ID,
                        'unique()',
                        {
                            ...reminder,
                            datetime: nextDate.toISOString(),
                            status: 'pending'
                        }
                    );
                }
            }

            results.push({
                reminderId: reminder.$id,
                success: emailResult.success,
                error: emailResult.error
            });
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