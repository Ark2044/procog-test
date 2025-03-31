import React, { useState } from "react";
import { Comment } from "@/types/Comment";
import { useAuthStore } from "@/store/Auth";
import { useCommentStore } from "@/store/Comment";
import { Button } from "@/components/ui/button";
import { CommentEditor } from "./CommentEditor";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown, Flag, Reply, Trash, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onReply: (parentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth,
  onReply,
}) => {
  const { user } = useAuthStore();
  const { voteComment, flagComment, deleteComment, updateComment } =
    useCommentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const authorName = comment.authorName || comment.authorId; // Fallback to authorId if no name

  const userVote =
    user && comment.voters.find((v) => v.userId === user.$id)?.vote;
  const canModify =
    user && (user.$id === comment.authorId || user.prefs?.role === "admin");

  const handleVote = (voteType: "up" | "down") => {
    if (!user) return;
    voteComment(comment.$id, user.$id, voteType);
  };

  const handleFlag = () => {
    if (!user) return;
    flagComment(comment.$id);
  };

  const handleEdit = (newContent: string) => {
    updateComment(comment.$id, { content: newContent });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment(comment.$id);
    }
  };

  if (comment.isFlagged && !(user?.prefs?.role === "admin")) {
    return (
      <div className="text-gray-500 italic">
        This comment has been flagged for review
      </div>
    );
  }

  return (
    <div className={`pl-${depth * 4} py-2`}>
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
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

        {isEditing ? (
          <CommentEditor
            riskId={comment.riskId}
            initialContent={comment.content}
            onSubmit={handleEdit}
            submitLabel="Save"
          />
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>
        )}

        <div className="flex items-center gap-4 mt-4">
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
            <ThumbsDown
              className="w-4 h “

4 mr-1"
            />
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

          <Button variant="ghost" size="sm" onClick={handleFlag}>
            <Flag className="w-4 h-4 mr-1" />
            Flag
          </Button>
        </div>

        {isReplying && (
          <div className="mt-4">
            <CommentEditor
              riskId={comment.riskId}
              parentId={comment.$id}
              onSubmit={() => {
                onReply(comment.$id);
                setIsReplying(false);
              }}
              placeholder="Write a reply..."
            />
          </div>
        )}
      </div>
    </div>
  );
};
