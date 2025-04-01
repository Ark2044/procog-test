import { create } from "zustand";
import { databases, client } from "@/models/client/config";
import { Comment } from "@/types/Comment";
import { commentCollection, db } from "@/models/name";
import { ID, Query } from "appwrite";
import { toast } from "react-hot-toast";

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  subscription: (() => void) | null;
  hasMore: boolean;
  page: number;
  pageSize: number;

  fetchComments: (riskId: string, reset?: boolean) => Promise<void>;
  loadMoreComments: (riskId: string) => Promise<void>;
  addComment: (comment: Partial<Comment>) => Promise<void>;
  updateComment: (commentId: string, updates: Partial<Comment>) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  voteComment: (commentId: string, userId: string, voteType: "up" | "down") => Promise<void>;
  flagComment: (commentId: string) => Promise<void>;
  subscribe: (riskId: string) => void;
  unsubscribe: () => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  error: null,
  subscription: null,
  hasMore: true,
  page: 0,
  pageSize: 10,

  fetchComments: async (riskId: string, reset = false) => {
    if (reset) {
      set({ comments: [], page: 0, hasMore: true });
    }
    
    set({ loading: true, error: null });
    try {
      const response = await databases.listDocuments(
        db,
        commentCollection,
        [
          Query.equal("riskId", riskId),
          Query.orderDesc("created"),
          Query.limit(get().pageSize),
          Query.offset(reset ? 0 : get().page * get().pageSize)
        ]
      );

      set((state) => ({
        comments: reset ? response.documents as Comment[] : [...state.comments, ...(response.documents as Comment[])],
        hasMore: response.documents.length === get().pageSize,
        page: reset ? 1 : state.page + 1
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch comments";
      set({ error: message });
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },

  loadMoreComments: async (riskId: string) => {
    if (!get().hasMore || get().loading) return;
    await get().fetchComments(riskId);
  },

  addComment: async (comment: Partial<Comment>) => {
    try {
      const response = await databases.createDocument(
        db,
        commentCollection,
        ID.unique(),
        {
          ...comment,
          upvotes: 0,
          downvotes: 0,
          voters: [],
          isFlagged: false,
          created: new Date().toISOString()
        }
      );

      set((state) => ({
        comments: [response as Comment, ...state.comments]
      }));

      toast.success("Comment added successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add comment";
      toast.error(message);
      throw error;
    }
  },

  updateComment: async (commentId: string, updates: Partial<Comment>) => {
    try {
      set((state) => ({
        comments: state.comments.map(c => 
          c.$id === commentId ? { ...c, ...updates } : c
        )
      }));

      await databases.updateDocument(
        db,
        commentCollection,
        commentId,
        updates
      );

      toast.success("Comment updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update comment";
      toast.error(message);
      get().fetchComments(get().comments[0].riskId, true);
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      await databases.deleteDocument(db, commentCollection, commentId);
      set((state) => ({
        comments: state.comments.filter(c => c.$id !== commentId)
      }));
      toast.success("Comment deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete comment";
      toast.error(message);
    }
  },

  voteComment: async (commentId: string, userId: string, voteType: "up" | "down") => {
    try {
      const comment = get().comments.find(c => c.$id === commentId);
      if (!comment) return;

      const existingVote = comment.voters.find(v => v.userId === userId);
      let upvotes = comment.upvotes;
      let downvotes = comment.downvotes;
      let voters = [...comment.voters];

      if (existingVote) {
        if (existingVote.vote === voteType) {
          voters = voters.filter(v => v.userId !== userId);
          if (voteType === "up") upvotes--;
          else downvotes--;
        } else {
          voters = voters.map(v =>
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

      set((state) => ({
        comments: state.comments.map(c =>
          c.$id === commentId ? { ...c, upvotes, downvotes, voters } : c
        )
      }));

      await databases.updateDocument(db, commentCollection, commentId, {
        upvotes,
        downvotes,
        voters
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to vote";
      toast.error(message);
      get().fetchComments(get().comments[0].riskId, true);
    }
  },

  flagComment: async (commentId: string) => {
    try {
      await databases.updateDocument(db, commentCollection, commentId, {
        isFlagged: true
      });
      set((state) => ({
        comments: state.comments.map(c =>
          c.$id === commentId ? { ...c, isFlagged: true } : c
        )
      }));
      toast.success("Comment flagged for review");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to flag comment";
      toast.error(message);
    }
  },

  subscribe: (riskId: string) => {
    const unsubscribe = client.subscribe(
      `databases.${db}.collections.${commentCollection}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*")) {
          get().fetchComments(riskId, true);
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
  }
}));
