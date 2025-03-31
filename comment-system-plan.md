# Comment System Implementation Plan

## 1. Database Schema Updates

Extend the comment collection with additional fields:

```typescript
interface Comment {
  $id: string;
  content: string;
  authorId: string;
  riskId: string;
  parentId: string | null; // For nested replies
  upvotes: number;
  downvotes: number;
  voters: { userId: string; vote: 'up' | 'down' }[];
  isFlagged: boolean;
  created: string;
  mentions: string[]; // Array of mentioned user IDs
}
```

## 2. API Endpoints

Create new API routes:

```typescript
// app/api/comments/route.ts - List/Create comments
// app/api/comments/[commentId]/route.ts - Update/Delete comment
// app/api/comments/[commentId]/vote/route.ts - Handle voting
// app/api/comments/[commentId]/flag/route.ts - Flag inappropriate content
```

## 3. UI Components

Create new components:

```typescript
// components/comments/CommentSection.tsx
interface CommentSectionProps {
  riskId: string;
}

// components/comments/CommentItem.tsx
interface CommentItemProps {
  comment: Comment;
  depth: number;
}

// components/comments/CommentEditor.tsx
interface CommentEditorProps {
  riskId: string;
  parentId?: string;
  onSubmit: (content: string) => void;
}
```

## 4. Real-time Updates

Use Appwrite's realtime subscriptions:

```typescript
// store/Comments.ts
interface CommentStore {
  comments: Comment[];
  subscribe: (riskId: string) => void;
  unsubscribe: () => void;
  addComment: (comment: Comment) => void;
  updateComment: (comment: Comment) => void;
  deleteComment: (commentId: string) => void;
}
```

## 5. Features Implementation Order

1. Basic commenting (create/read)
2. Nested replies
3. Markdown support
4. Voting system
5. User mentions
6. Real-time updates
7. Moderation features

## 6. Integration

Add CommentSection to RiskDetail page below risk content.