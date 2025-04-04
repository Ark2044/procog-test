import React, { useEffect, useRef, useCallback, useState } from "react";
import { useCommentStore } from "@/store/Comment";
import { CommentEditor } from "./CommentEditor";
import { CommentItem } from "./CommentItem";
import { useAuthStore } from "@/store/Auth";
import { Comment } from "@/types/Comment";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useViewedItemsStore } from "@/store/ViewedItems";

interface CommentSectionProps {
  riskId: string;
  entityType?: string;
  onCommentsCountChange?: (count: number) => void;
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

export const CommentSection: React.FC<CommentSectionProps> = ({
  riskId,
  onCommentsCountChange,
}) => {
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
  const prevCommentCountRef = useRef<number>(0);
  const [sortBy, setSortBy] = useState<"popular" | "recent">("popular");
  const { markCommentsViewed } = useViewedItemsStore();

  // Infinite scroll setup
  const lastCommentRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreComments(riskId);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMoreComments, riskId]
  );

  useEffect(() => {
    fetchComments(riskId, true);
    subscribe(riskId);
    return () => unsubscribe();
  }, [riskId, fetchComments, subscribe, unsubscribe]);

  useEffect(() => {
    if (comments.length > 0 && user) {
      markCommentsViewed(user.$id, riskId, comments.length);
    }
  }, [comments.length, riskId, user, markCommentsViewed]);

  // Separate effect for comment count changes to avoid infinite loops
  useEffect(() => {
    if (comments.length > 0 && user && onCommentsCountChange) {
      // Only call the callback if the count actually changed
      if (prevCommentCountRef.current !== comments.length) {
        onCommentsCountChange(comments.length);
        prevCommentCountRef.current = comments.length;
      }
    }
  }, [comments.length, onCommentsCountChange, user]);

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!user) return;

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const mentions = (content.match(/@(\w+)/g) || []).map((mention) =>
      mention.slice(1)
    );

    try {
      await addComment({
        content,
        authorId: user.$id,
        authorName: user.name,
        riskId,
        parentId,
        mentions,
      });

      // Refresh comments to show the new reply
      if (parentId) {
        fetchComments(riskId, true);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
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
  const commentTree = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      // This is a top-level comment
      acc[comment.$id] = {
        ...comment,
        replies: [],
        isCollapsed: false,
      };
    } else if (comment.parentId) {
      // This is a reply - find the right parent
      if (acc[comment.parentId]) {
        // Direct child of a top-level comment
        acc[comment.parentId].replies.push(comment);
      } else {
        // It might be a reply to a reply, or parent not loaded yet
        // For simplicity, we'll treat it as a top-level comment
        acc[comment.$id] = {
          ...comment,
          replies: [],
          isCollapsed: false,
        };
      }
    }
    return acc;
  }, {} as Record<string, CommentWithReplies>);

  // Sort comments based on selected sort method
  const sortedComments = Object.values(commentTree).sort((a, b) => {
    if (sortBy === "popular") {
      // Sort by votes (upvotes - downvotes)
      return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
    } else {
      // Sort by most recent
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
  });

  // Also sort replies by the same criteria
  Object.values(commentTree).forEach((comment) => {
    comment.replies.sort((a, b) => {
      if (sortBy === "popular") {
        return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
      } else {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
    });
  });

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Comments</h3>

        <div className="flex gap-2">
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
            className="flex items-center gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            Most Helpful
          </Button>
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
            className="flex items-center gap-1"
          >
            <Clock className="w-4 h-4" />
            Most Recent
          </Button>
        </div>
      </div>

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
                ref={
                  index === sortedComments.length - 1 ? lastCommentRef : null
                }
              >
                <CommentItem
                  key={`comment-${comment.$id}`}
                  comment={comment}
                  depth={0}
                  onReply={(content) =>
                    handleSubmitComment(content, comment.$id)
                  }
                />
                {!comment.isCollapsed &&
                  comment.replies.map((reply) => (
                    <div
                      key={`reply-${reply.$id}`}
                      className="ml-6 pl-4 border-l-2 border-gray-200"
                    >
                      <CommentItem
                        key={`reply-item-${reply.$id}`}
                        comment={reply}
                        depth={1}
                        onReply={(content) =>
                          handleSubmitComment(content, reply.$id)
                        }
                      />
                    </div>
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
