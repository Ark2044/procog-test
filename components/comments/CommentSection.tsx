import React, { useEffect, useRef, useCallback } from "react";
import { useCommentStore } from "@/store/Comment";
import { CommentEditor } from "./CommentEditor";
import { CommentItem } from "./CommentItem";
import { useAuthStore } from "@/store/Auth";
import { Comment } from "@/types/Comment";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSectionProps {
  riskId: string;
}

interface CommentWithReplies extends Comment {
  replies: Comment[];
  isCollapsed?: boolean;
}

const CommentSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export const CommentSection: React.FC<CommentSectionProps> = ({ riskId }) => {
  const {
    comments,
    loading,
    error,
    hasMore,
    fetchComments,
    loadMoreComments,
    addComment,
    subscribe,
    unsubscribe,
  } = useCommentStore();
  const { user } = useAuthStore();
  const observer = useRef<IntersectionObserver>();

  // Infinite scroll setup
  const lastCommentRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreComments(riskId);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreComments, riskId]);

  useEffect(() => {
    fetchComments(riskId, true);
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
      authorName: user.name,
      riskId,
      parentId,
      mentions,
    });
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Organize comments into a tree structure
  const commentTree = comments.reduce(
    (acc, comment) => {
      if (!comment.parentId) {
        acc[comment.$id] = {
          ...comment,
          replies: [],
          isCollapsed: false,
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

      <AnimatePresence>
        <div className="space-y-4">
          {loading && comments.length === 0 ? (
            <CommentSkeleton />
          ) : (
            sortedComments.map((comment, index) => (
              <motion.div
                key={comment.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                ref={index === sortedComments.length - 1 ? lastCommentRef : null}
              >
                <CommentItem
                  comment={comment}
                  depth={0}
                  onReply={(parentId) => handleSubmitComment(comment.content, parentId)}
                />
                {!comment.isCollapsed && comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.$id}
                    comment={reply}
                    depth={1}
                    onReply={(parentId) => handleSubmitComment(reply.content, parentId)}
                  />
                ))}
              </motion.div>
            ))
          )}

          {loading && comments.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};
