import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { databases, client, account } from "@/models/client/config";
import { Comment } from "@/types/Comment"; // Ensure this type includes authorName
import { commentCollection, db } from "@/models/name";
import { ID, Query } from "appwrite";

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  subscription: (() => void) | null;

  fetchComments: (riskId: string) => Promise<void>;
  addComment: (comment: Partial<Comment>) => Promise<void>;
  updateComment: (
    commentId: string,
    updates: Partial<Comment>
  ) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  voteComment: (
    commentId: string,
    userId: string,
    voteType: "up" | "down"
  ) => Promise<void>;
  flagComment: (commentId: string) => Promise<void>;
  subscribe: (riskId: string) => void;
  unsubscribe: () => void;
}

export const useCommentStore = create<CommentState>()(
  immer((set, get) => ({
    comments: [],
    loading: false,
    error: null,
    subscription: null,

    fetchComments: async (riskId: string) => {
      set({ loading: true, error: null });
      try {
        const response = await databases.listDocuments(db, commentCollection, [
          Query.equal("riskId", riskId),
          Query.orderDesc("upvotes"),
          Query.orderDesc("created"),
          Query.limit(100),
        ]);
        const comments = response.documents as Comment[];
        set({ comments });
      } catch (error) {
        set({ error: "Failed to fetch comments" });
        console.error("Error fetching comments:", error);
      } finally {
        set({ loading: false });
      }
    },

    addComment: async (comment: Partial<Comment>) => {
      try {
        const currentUser = await account.get(); // Get current user's details
        await databases.createDocument(db, commentCollection, ID.unique(), {
          ...comment,
          authorId: currentUser.$id,
          authorName: currentUser.name, // Store the author's name
          upvotes: 0,
          downvotes: 0,
          voters: [],
          isFlagged: false,
          created: new Date().toISOString(),
        });
      } catch (error) {
        set({ error: "Failed to add comment" });
        console.error("Error adding comment:", error);
      }
    },

    updateComment: async (commentId: string, updates: Partial<Comment>) => {
      try {
        await databases.updateDocument(
          db,
          commentCollection,
          commentId,
          updates
        );
      } catch (error) {
        set({ error: "Failed to update comment" });
        console.error("Error updating comment:", error);
      }
    },

    deleteComment: async (commentId: string) => {
      try {
        await databases.deleteDocument(db, commentCollection, commentId);
        set((state) => {
          state.comments = state.comments.filter((c) => c.$id !== commentId);
        });
      } catch (error) {
        set({ error: "Failed to delete comment" });
        console.error("Error deleting comment:", error);
      }
    },

    voteComment: async (
      commentId: string,
      userId: string,
      voteType: "up" | "down"
    ) => {
      try {
        const comment = get().comments.find((c) => c.$id === commentId);
        if (!comment) return;

        const existingVote = comment.voters.find((v) => v.userId === userId);
        let upvotes = comment.upvotes;
        let downvotes = comment.downvotes;
        let voters = [...comment.voters];

        if (existingVote) {
          if (existingVote.vote === voteType) {
            voters = voters.filter((v) => v.userId !== userId);
            if (voteType === "up") upvotes--;
            else downvotes--;
          } else {
            voters = voters.map((v) =>
              v.userId === userId ? { userId, vote: voteType } : v
            );
            if (voteType === "up") {
              upvotes++;
              downvotes--;
            } else {
              upvotes--;
              downvotes++;
            }
          }
        } else {
          voters.push({ userId, vote: voteType });
          if (voteType === "up") upvotes++;
          else downvotes++;
        }

        await databases.updateDocument(db, commentCollection, commentId, {
          upvotes,
          downvotes,
          voters,
        });
      } catch (error) {
        set({ error: "Failed to vote on comment" });
        console.error("Error voting on comment:", error);
      }
    },

    flagComment: async (commentId: string) => {
      try {
        await databases.updateDocument(db, commentCollection, commentId, {
          isFlagged: true,
        });
      } catch (error) {
        set({ error: "Failed to flag comment" });
        console.error("Error flagging comment:", error);
      }
    },

    subscribe: (riskId: string) => {
      const unsubscribe = client.subscribe(
        `databases.${db}.collections.${commentCollection}.documents`,
        (response) => {
          if (
            response.events.includes("databases.*.collections.*.documents.*")
          ) {
            get().fetchComments(riskId);
          }
        }
      );
      set({ subscription: unsubscribe });
    },

    unsubscribe: () => {
      const { subscription } = get();
      if (subscription) {
        subscription();
        set({ subscription: null });
      }
    },
  }))
);
