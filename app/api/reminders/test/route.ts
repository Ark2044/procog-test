import { NextResponse } from 'next/server';
import { sendReminderEmail } from '@/lib/email';
import { headers } from 'next/headers';

// Simple rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;
const requests = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const requestData = requests.get(ip);

    if (!requestData) {
        requests.set(ip, { count: 1, timestamp: now });
        return false;
    }

    if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
        requests.set(ip, { count: 1, timestamp: now });
        return false;
    }

    if (requestData.count >= MAX_REQUESTS) {
        return true;
    }

    requestData.count++;
    return false;
}

export async function POST(request: Request) {
    try {
        // Get client IP
        const headersList = headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor?.split(',')[0] || 'unknown';

        // Check rate limit
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate request body
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Only allow test emails in development
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json(
                { error: 'Test endpoint is only available in development' },
                { status: 403 }
            );
        }

        const result = await sendReminderEmail(
            email,
            'Test Reminder',
            'Test Reminder Title',
            'This is a test reminder description',
            'test-risk-id'
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to send test email' 
        }, { status: 500 });
    }
}