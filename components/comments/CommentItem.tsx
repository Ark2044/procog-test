import React, { useState } from "react";
import { Comment } from "@/types/Comment";
import { useAuthStore } from "@/store/Auth";
import { useCommentStore } from "@/store/Comment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentEditor } from "./CommentEditor";
import ReactMarkdown from "react-markdown";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  Reply,
  Trash,
  Edit,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onReply: (content: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth,
  onReply,
}) => {
  const { user } = useAuthStore();
  const {
    voteComment,
    flagComment,
    deleteComment,
    updateComment,
    getParentComment,
  } = useCommentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState<string>("");
  const authorName = comment.authorName || comment.authorId; // Fallback to authorId if no name

  // Get parent comment if this is a reply
  const parentComment = comment.parentId
    ? getParentComment(comment.parentId)
    : undefined;
  const parentAuthorName = parentComment?.authorName;
  const parentContent = parentComment?.content;

  const userVote =
    user && comment.voters.find((v) => v.userId === user.$id)?.vote;
  const canModify =
    user && (user.$id === comment.authorId || user.prefs?.role === "admin");
  const isAdmin = user?.prefs?.role === "admin";

  const handleVote = (voteType: "up" | "down") => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }
    voteComment(comment.$id, user.$id, voteType);
  };

  const handleFlag = () => {
    if (!user) {
      toast.error("You must be logged in to flag content");
      return;
    }
    setShowFlagDialog(true);
  };

  const submitFlag = () => {
    flagComment(comment.$id);
    setShowFlagDialog(false);
    toast.success("Comment flagged for moderation");
  };

  const handleEdit = (newContent: string) => {
    updateComment(comment.$id, { content: newContent });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment(comment.$id);
      toast.success("Comment deleted");
    }
  };

  const handleSubmitReply = (content: string) => {
    if (!content.trim()) return;
    onReply(content);
    setIsReplying(false);
  };

  const approveComment = () => {
    updateComment(comment.$id, { isFlagged: false });
    toast.success("Comment approved");
  };

  // If comment is flagged, show different UIs for admin vs regular users
  if (comment.isFlagged) {
    if (isAdmin) {
      return (
        <div className={`py-2 ${depth > 0 ? "ml-3 sm:ml-6" : ""}`}>
          <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-medium">{authorName}</span>
                <span className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(comment.created), {
                    addSuffix: true,
                  })}
                </span>
                <Badge className="bg-amber-200 text-amber-800">
                  Flagged for review
                </Badge>
              </div>
            </div>

            <div className="prose max-w-none prose-sm sm:prose-base break-words">
              <ReactMarkdown>
                {comment.content}
              </ReactMarkdown>
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={approveComment}
                className="flex items-center gap-1 text-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-1"
              >
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={`py-2 ${depth > 0 ? "ml-3 sm:ml-6" : ""}`}>
          <div className="text-gray-500 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 italic flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            This comment has been flagged for review
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`py-2 ${depth > 0 ? "ml-3 sm:ml-6" : ""}`}>
      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{authorName}</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(comment.created), {
                addSuffix: true,
              })}
            </span>
          </div>

          {canModify && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {comment.parentId && depth > 0 && parentComment && (
          <div className="text-gray-500 mb-3">
            <div className="flex items-center gap-1 text-sm mb-1">
              <Reply className="w-3 h-3 rotate-180" />
              Replying to{" "}
              <span className="font-medium">
                {parentAuthorName || "another comment"}
              </span>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded border-l-2 border-gray-300 text-sm text-gray-600 line-clamp-2 italic overflow-hidden">
              {parentContent
                ? parentContent.substring(0, 150) +
                  (parentContent.length > 150 ? "..." : "")
                : "Original comment not available"}
            </div>
          </div>
        )}

        {isEditing ? (
          <CommentEditor
            riskId={comment.riskId}
            initialContent={comment.content}
            onSubmit={handleEdit}
            submitLabel="Save"
          />
        ) : (
          <div className="prose max-w-none prose-sm sm:prose-base break-words">
            <ReactMarkdown>
              {comment.content}
            </ReactMarkdown>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote("up")}
            className={userVote === "up" ? "text-green-600" : ""}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            {comment.upvotes}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote("down")}
            className={userVote === "down" ? "text-red-600" : ""}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            {comment.downvotes}
          </Button>

          {depth < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFlag}
            className={comment.isFlagged ? "text-amber-600" : ""}
          >
            <Flag className="w-4 h-4 mr-1" />
            Flag
          </Button>
        </div>

        {isReplying && (
          <div className="mt-4">
            <h4 className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <Reply className="w-3 h-3 rotate-180" />
              Replying to <span className="font-semibold">{authorName}</span>
            </h4>
            <div className="bg-gray-50 px-3 py-2 rounded border-l-2 border-gray-300 text-sm text-gray-600 mb-3 italic overflow-hidden">
              {comment.content.substring(0, 100)}
              {comment.content.length > 100 ? "..." : ""}
            </div>
            <CommentEditor
              riskId={comment.riskId}
              parentId={comment.$id}
              onSubmit={handleSubmitReply}
              placeholder={`Reply to ${authorName}...`}
            />
          </div>
        )}
      </div>

      <AlertDialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag inappropriate content</AlertDialogTitle>
            <AlertDialogDescription>
              Please let us know why you&apos;re flagging this comment. This
              will help our moderation team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Explain why this comment is inappropriate..."
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitFlag}>
              Submit Flag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
