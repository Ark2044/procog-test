import React, { useEffect } from "react";
import { useCommentStore } from "@/store/Comment";
import { CommentEditor } from "./CommentEditor";
import { CommentItem } from "./CommentItem";
import { useAuthStore } from "@/store/Auth";
import { Comment } from "@/types/Comment";

interface CommentSectionProps {
  riskId: string;
}

// Define a type for a comment with replies
interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ riskId }) => {
  const {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    subscribe,
    unsubscribe,
  } = useCommentStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComments(riskId);
    subscribe(riskId);
    return () => unsubscribe();
  }, [riskId, fetchComments, subscribe, unsubscribe]);

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!user) return;

    const mentions = (content.match(/@(\w+)/g) || []).map((mention) =>
      mention.slice(1)
    );

    await addComment({
      content,
      authorId: user.$id,
      riskId,
      parentId,
      mentions,
    });
  };

  if (loading) {
    return <div className="animate-pulse">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Organize comments into a tree structure
  const commentTree = comments.reduce(
    (acc, comment) => {
      if (!comment.parentId) {
        acc[comment.$id] = {
          ...comment,
          replies: [],
        };
      } else if (acc[comment.parentId]) {
        acc[comment.parentId].replies.push(comment);
      }
      return acc;
    },
    {} as Record<string, CommentWithReplies>
  );

  // Sort comments by votes (upvotes - downvotes)
  const sortedComments = Object.values(commentTree).sort(
    (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
  );

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xl font-semibold">Comments</h3>

      {user && (
        <CommentEditor
          riskId={riskId}
          onSubmit={(content) => handleSubmitComment(content)}
          placeholder="Join the discussion..."
        />
      )}

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div key={comment.$id}>
            <CommentItem
              comment={comment}
              depth={0}
              onReply={(parentId) =>
                handleSubmitComment(comment.content, parentId)
              }
            />
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.$id}
                comment={reply}
                depth={1}
                onReply={(parentId) =>
                  handleSubmitComment(reply.content, parentId)
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
