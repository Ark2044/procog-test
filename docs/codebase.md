# Procog Risk Management System Documentation

## System Architecture

### Frontend (Next.js)
1. **Pages**
   - `/app/dashboard/[userId]`: User dashboard
   - `/app/admin/users`: Admin panel for user management
   - `/app/risk/[riskId]`: Risk details and management
   - `/app/reminders`: Reminder management
   - `/app/login` & `/app/register`: Authentication
   - `/app/profile/[userId]`: User profile

2. **Components**
   - `CreateRisk.tsx`: Risk creation form with validation
   - `RiskCard.tsx`: Risk display component
   - `RiskList.tsx`: Risk listing and management
   - `ReminderDialog.tsx`: Reminder creation/editing
   - UI Components (Shadcn/ui):
     - Alert dialogs
     - Buttons
     - Cards
     - Tabs
     - etc.

### Backend (Appwrite)

1. **Database Collections**

a) **Risks Collection**
```typescript
{
  title: string (required, max 100 chars)
  content: string (required, max 1000 chars)
  authorId: string (required)
  tags: string[] (optional)
  attachmentId: string (optional)
  impact: enum ['low', 'medium', 'high']
  probability: number (0-5)
  action: enum ['mitigate', 'accept', 'transfer', 'avoid']
  mitigation: string (optional)
  department: string (optional)
  isConfidential: boolean
  authorizedViewers: string[]
  created: datetime
  updated: datetime
}
```

b) **Comments Collection**
```typescript
{
  content: string (required, max 10000 chars)
  type: enum ['answer', 'question']
  typeId: string (required)
  authorId: string (required)
  created: datetime
}
```

c) **Solutions Collection**
```typescript
{
  content: string (required, max 10000 chars)
  riskId: string (required)
  authorId: string (required)
}
```

d) **Reminders Collection**
```typescript
{
  title: string (required)
  description: string (optional)
  datetime: string (ISO format)
  userId: string (required)
  riskId: string (required)
  email: string (required)
  recurrence: enum ['none', 'daily', 'weekly', 'monthly']
  status: enum ['pending', 'completed', 'cancelled']
  created: string
  updated: string
}
```

2. **Storage**
- Risk attachments bucket
- Configurable file types and sizes

3. **Authentication**
- Email/password authentication
- User roles (admin, user)
- Department-based access control

## Validation System

### 1. Database Level (Appwrite)
- Schema validation
- Required fields
- Enum constraints
- String length limits
- Index configurations

### 2. Form Validation

a) **Risk Creation**
```typescript
- Title: required, max 100 chars
- Content: required, max 500 chars
- Impact: enum validation
- Probability: number 0-5
- Action: enum validation
- Mitigation: required if action is "mitigate"
- File attachments: optional
```

b) **Authentication**
```typescript
- Email: required, valid format
- Password: min 8 chars
- Name: required
```

c) **Reminders**
```typescript
- Title: required
- DateTime: future date
- Email: valid format
- Recurrence: valid enum value
```

### 3. API Route Validation
- Request body validation
- Authentication checks
- Permission verification
- Error handling

## Services

### 1. Email Service
- Appwrite mail integration
- HTML email templates
- Error handling and logging
- Environment configuration

### 2. Reminder Service
- Cron-based checks
- Recurring reminder handling
- Status management
- Email notifications

### 3. Storage Service
- File upload handling
- Attachment management
- Access control

## State Management

### 1. Auth Store (Zustand)
```typescript
{
  user: User | null
  login: (email, password) => Promise
  logout: () => Promise
  createAccount: (name, email, password) => Promise
}
```

### 2. Reminder Store
```typescript
{
  reminders: Reminder[]
  loading: boolean
  error: string | null
  fetchReminders: (userId) => Promise
  createReminder: (data) => Promise
  updateReminder: (id, data) => Promise
  deleteReminder: (id) => Promise
}
```

## Environment Configuration

### Development
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key
```

### Production
Additional configurations:
- Vercel deployment settings
- Cron job configuration
- Environment variables
- Domain configuration

## Security Features

1. **Authentication**
- Session management
- Password security
- Role-based access

2. **Authorization**
- Department-based access
- Confidential risk handling
- API route protection

3. **Data Protection**
- Input sanitization
- XSS prevention
- CSRF protection

## Testing

### 1. Local Testing
- Development environment setup
- API endpoint testing
- Email service testing
- Component testing

### 2. Production Testing
- Deployment checks
- Environment verification
- Service integration testing

## Error Handling

1. **Frontend**
- User-friendly error messages
- Form validation feedback
- Loading states
- Toast notifications

2. **Backend**
- API error responses
- Service error handling
- Logging system
- Error tracking

## Best Practices

1. **Code Organization**
- Feature-based directory structure
- Component reusability
- Service separation
- Type safety

2. **Performance**
- Optimized database queries
- Efficient state management
- Lazy loading
- Caching strategies

3. **Security**
- Input validation
- Authentication checks
- Authorization controls
- Data sanitization

4. **Maintenance**
- Code documentation
- Error logging
- Performance monitoring
- Regular updates

## Deployment

1. **Vercel Setup**
- Environment configuration
- Build settings
- Domain setup
- Cron job configuration

2. **Appwrite Setup**
- Collection creation
- Index configuration
- Permission setup
- API key management

## Monitoring

1. **Error Tracking**
- Console logging
- Error reporting
- Performance monitoring
- User feedback

2. **Performance**
- Response times
- Resource usage
- API latency
- User experience

## Future Improvements

1. **Features**
- Enhanced reporting
- Advanced analytics
- Mobile optimization
- Real-time updates

2. **Technical**
- Test coverage
- Performance optimization
- Security enhancements
- Documentation updates