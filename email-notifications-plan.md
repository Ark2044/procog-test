# Email Notifications Implementation Plan

## 1. Extend Email Service

Add new functions to emailService.ts:

```typescript
// For comments
export const sendCommentNotification = async (
  comment: Comment,
  action: "reply" | "mention",
  parentComment?: Comment
) => {
  // Similar to sendRiskNotification
}

// For reminders
export const sendReminderNotification = async (
  reminder: Reminder,
  action: "due" | "created" | "updated"
) => {
  // Similar to sendRiskNotification
}
```

## 2. Comment Notification Templates

HTML templates for:
- New replies to comments
- User mentions in comments
- Comment moderation notifications (for flagged content)

## 3. Reminder Notification Templates

HTML templates for:
- Upcoming reminder notifications
- Reminder created/updated confirmations
- Recurring reminder notifications

## 4. Integration Points

### Comments:
- Send notifications when:
  1. User replies to a comment
  2. User mentions someone
  3. Comment is flagged/moderated

### Reminders:
- Send notifications when:
  1. Reminder is about to be due
  2. Recurring reminder is created
  3. Reminder details are updated

## 5. User Preferences

Add email preference settings:
- Comment notifications (replies, mentions)
- Reminder notifications (due dates, updates)
- Notification frequency (instant, daily digest, weekly)

## Implementation Steps:

1. Extend emailService.ts with new functions
2. Add email templates for each notification type
3. Integrate notifications in comment/reminder services
4. Add user preference controls
5. Implement notification queuing for better performance
6. Add error handling and logging