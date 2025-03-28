import { NextResponse } from 'next/server';
import { checkAndSendReminders } from '@/lib/reminderService';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('x-vercel-cron');
        const isVercelCron = !!authHeader;
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Only allow requests from Vercel Cron or in development
        if (!isVercelCron && !isDevelopment) {
            console.warn('Unauthorized reminder check attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const result = await checkAndSendReminders();
        
        if (!result.success) {
            console.error('Failed to process reminders:', result.error);
            return NextResponse.json(
                { error: 'Failed to process reminders', details: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            processed: result.processed,
            results: result.results
        });
    } catch (error) {
        console.error('Error checking reminders:', error);
        return NextResponse.json(
            { 
                error: 'Failed to check reminders',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';