import { Reminder } from '@/types/Reminder';
import { databases } from '@/models/server/config';
import { Query } from 'node-appwrite';
import env from '@/app/env';
import { reminderCollection } from '@/models/name';
import { sendReminderNotification } from '@/utils/emailService';

// Validation constants
const VALID_RECURRENCE = ['none', 'daily', 'weekly', 'monthly'] as const;
const MAX_RETRIES = 3;
const BATCH_SIZE = 50;

// Enhanced validation
const validateReminder = (reminder: Partial<Reminder>): { isValid: boolean; error?: string } => {
    if (!reminder.title?.trim() || !reminder.datetime || !reminder.userId) {
        return { isValid: false, error: "Missing required fields" };
    }

    const reminderDate = new Date(reminder.datetime);
    if (isNaN(reminderDate.getTime())) {
        return { isValid: false, error: "Invalid datetime format" };
    }

    if (reminderDate < new Date()) {
        return { isValid: false, error: "Reminder datetime must be in the future" };
    }

    if (reminder.recurrence && !VALID_RECURRENCE.includes(reminder.recurrence as typeof VALID_RECURRENCE[number])) {
        return { isValid: false, error: "Invalid recurrence value" };
    }

    return { isValid: true };
};

// Calculate next reminder date based on recurrence
function calculateNextReminderDate(currentDate: string, recurrence: typeof VALID_RECURRENCE[number]): Date {
    const date = new Date(currentDate);
    
    switch (recurrence) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        default:
            return date;
    }
    
    return date;
}

// Process a single reminder with retries
async function processReminderWithRetry(reminder: Reminder, attempt = 1): Promise<{ success: boolean; error?: string }> {
    try {
        // Send due notification before updating status
        await sendReminderNotification(reminder, "due");

        // Update reminder status
        await databases.updateDocument(
            env.appwrite.databaseId,
            reminderCollection,
            reminder.$id,
            {
                status: 'completed',
                updated: new Date().toISOString()
            }
        );

        // Handle recurrence
        if (reminder.recurrence !== 'none') {
            const nextDate = calculateNextReminderDate(reminder.datetime, reminder.recurrence);
            
            const nextReminder: Partial<Reminder> = {
                ...reminder,
                datetime: nextDate.toISOString(),
                status: 'pending',
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            };

            // Validate next reminder
            const validation = validateReminder(nextReminder);
            if (!validation.isValid) {
                throw new Error(`Invalid next reminder: ${validation.error}`);
            }

            const createdReminder = await databases.createDocument(
                env.appwrite.databaseId,
                reminderCollection,
                'unique()',
                nextReminder
            );

            // Send notification for the new recurring reminder
            await sendReminderNotification(createdReminder as unknown as Reminder, "created");
        }

        return { success: true };
    } catch (error) {
        console.error(`Error processing reminder ${reminder.$id} (attempt ${attempt}):`, error);
        
        if (attempt < MAX_RETRIES) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            return processReminderWithRetry(reminder, attempt + 1);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Process reminders in batches
async function processBatch(reminders: Reminder[]): Promise<Array<{ reminderId: string; success: boolean; error?: string }>> {
    const results = [];
    
    for (const reminder of reminders) {
        const validation = validateReminder(reminder);
        if (!validation.isValid) {
            results.push({
                reminderId: reminder.$id,
                success: false,
                error: validation.error
            });
            continue;
        }

        const result = await processReminderWithRetry(reminder);
        results.push({
            reminderId: reminder.$id,
            ...result
        });
    }

    return results;
}

export async function checkAndSendReminders() {
    try {
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

        console.log('Checking reminders between:', now.toISOString(), 'and', fiveMinutesFromNow.toISOString());

        // Get all pending reminders
        const response = await databases.listDocuments(
            env.appwrite.databaseId,
            reminderCollection,
            [
                Query.equal('status', 'pending'),
                Query.lessThanEqual('datetime', fiveMinutesFromNow.toISOString()),
                Query.greaterThanEqual('datetime', now.toISOString()),
                Query.limit(BATCH_SIZE)
            ]
        );

        const reminders = response.documents as unknown as Reminder[];
        console.log('Found reminders:', reminders.length);

        // Process reminders in batches
        const results = await processBatch(reminders);

        // Calculate success rate
        const successCount = results.filter(r => r.success).length;
        const successRate = (successCount / results.length) * 100;

        return {
            success: true,
            processed: results.length,
            successRate: successRate.toFixed(2) + '%',
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