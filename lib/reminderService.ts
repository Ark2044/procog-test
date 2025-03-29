import { Reminder } from '@/types/Reminder';
import { sendReminderEmail } from './email';
import { databases } from '@/models/server/config';
import { Query } from 'node-appwrite';
import env from '@/app/env';

const COLLECTION_ID = 'reminders';

// Validation constants
const VALID_RECURRENCE = ['none', 'daily', 'weekly', 'monthly'] as const;
const VALID_STATUS = ['pending', 'completed', 'cancelled'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate reminder data
const validateReminder = (reminder: Partial<Reminder>): { isValid: boolean; error?: string } => {
    if (!reminder.title || !reminder.datetime || !reminder.userId || !reminder.email) {
        return { isValid: false, error: "Missing required fields" };
    }
    if (!EMAIL_REGEX.test(reminder.email)) {
        return { isValid: false, error: "Invalid email format" };
    }
    if (new Date(reminder.datetime) < new Date()) {
        return { isValid: false, error: "Reminder datetime must be in the future" };
    }
    if (reminder.recurrence && !VALID_RECURRENCE.includes(reminder.recurrence as any)) {
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
            COLLECTION_ID,
            [
                Query.equal('status', 'pending'),
                Query.lessThanEqual('datetime', fiveMinutesFromNow.toISOString()),
                Query.greaterThanEqual('datetime', now.toISOString())
            ]
        );

        console.log('Found reminders:', response.documents.length);

        const reminders = response.documents as unknown as Reminder[];
        const results = [];

        // Send emails for each due reminder
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

            console.log('Processing reminder:', reminder.$id, 'for email:', reminder.email);
            
            const emailResult = await sendReminderEmail(
                reminder.email,
                `Reminder: ${reminder.title}`,
                reminder.title,
                reminder.description,
                reminder.riskId
            );

            console.log('Email result:', emailResult);

            if (emailResult.success) {
                try {
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

                        const nextReminder = {
                            ...reminder,
                            datetime: nextDate.toISOString(),
                            status: 'pending'
                        };

                        // Validate next reminder before creating
                        const nextValidation = validateReminder(nextReminder);
                        if (nextValidation.isValid) {
                            await databases.createDocument(
                                env.appwrite.databaseId,
                                COLLECTION_ID,
                                'unique()',
                                nextReminder
                            );
                        } else {
                            console.error(`Failed to create next reminder for ${reminder.$id}:`, nextValidation.error);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to process reminder ${reminder.$id} after email sent:`, error);
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