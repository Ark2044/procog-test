# Reminder System Documentation

## Overview
The reminder system allows users to set up email reminders for risk reviews. The system includes:
- Email sending using Appwrite's built-in email service
- Recurring reminders (daily, weekly, monthly)
- Cron job for checking and sending reminders
- Test endpoints for local development

## Components

### 1. Email Service (`lib/email.ts`)
- Uses Appwrite's mail service
- Sends HTML formatted emails
- Includes risk review links
- Validates required parameters
- Environment requirements:
  - NEXT_PUBLIC_APP_URL: For generating risk review links

### 2. Reminder Service (`lib/reminderService.ts`)
- Checks for pending reminders every 5 minutes
- Handles recurring reminder creation
- Updates reminder status after sending
- Time window: Current time to 5 minutes ahead
- Logging at each step for debugging

### 3. API Routes
- `/api/reminders/check`: Cron endpoint for checking reminders
  - Protected by Vercel cron authentication
  - Accessible in development mode
- `/api/reminders/test`: Test endpoint for email sending
  - Useful for local testing and debugging

### 4. Database Schema (Appwrite)
Reminder Collection:
- title: string (required)
- description: string (optional)
- datetime: string (ISO format, required)
- userId: string (required)
- riskId: string (required)
- email: string (required)
- recurrence: enum ['none', 'daily', 'weekly', 'monthly']
- status: enum ['pending', 'completed', 'cancelled']

## Validation

### Database Level
- Required fields enforced by Appwrite
- Enum values strictly validated
- String length limits enforced

### Application Level
1. Email Service:
- Validates required parameters (to, subject, title)
- Checks for valid email format
- Verifies environment variables

2. Reminder Creation:
- Validates datetime (must be future)
- Checks recurrence values
- Verifies user permissions

3. API Routes:
- Request body validation
- Authentication checks
- Error handling and logging

## Testing

### Local Testing
1. Set up environment:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Test email sending:
```bash
curl -X POST http://localhost:3000/api/reminders/test \
-H "Content-Type: application/json" \
-d '{"email":"your-email@example.com"}'
```

3. Test reminder check:
```bash
curl http://localhost:3000/api/reminders/check
```

### Production Setup
1. Configure Vercel environment variables:
   - NEXT_PUBLIC_APP_URL: Your production URL

2. Verify Appwrite setup:
   - Email service enabled
   - Proper permissions set
   - Collections and indexes created

3. Cron job configuration:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/reminders/check",
    "schedule": "*/5 * * * *"
  }]
}
```

## Troubleshooting

### Common Issues
1. Emails not sending:
   - Check Appwrite email service status
   - Verify email permissions
   - Check for validation errors in logs

2. Reminders not triggering:
   - Verify cron job execution in Vercel logs
   - Check reminder datetime format
   - Confirm reminder status is 'pending'

3. Recurring reminders:
   - Verify next reminder creation in logs
   - Check datetime calculations
   - Confirm status updates

### Debugging
- Extensive logging added throughout the system
- Check Vercel deployment logs
- Monitor Appwrite console for errors
- Use test endpoint for direct email testing

## Recent Fixes
1. Switched to Appwrite email service from Resend
2. Added comprehensive validation
3. Improved error handling and logging
4. Created test endpoints
5. Fixed recurring reminder creation
6. Added production configuration guide

## Best Practices
1. Always test emails in development first
2. Monitor logs for any failures
3. Use test endpoint before deploying changes
4. Validate all user inputs
5. Handle edge cases in datetime calculations
6. Keep error messages user-friendly