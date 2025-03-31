import { Models } from "appwrite";

export interface Comment extends Models.Document {
  content: string;
  authorId: string;
  riskId: string;
  authorName: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  voters: { userId: string; vote: "up" | "down" }[];
  isFlagged: boolean;
  created: string;
}

export interface CommentVote {
  userId: string;
  vote: "up" | "down";
}
