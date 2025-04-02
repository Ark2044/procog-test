import { Models } from "appwrite";

export interface Solution extends Models.Document {
  content: string;
  riskId: string;
  authorId: string;
  authorName: string;
  created: string;
  updated: string;
}

// Extended solution with risk information
export interface SolutionWithRisk extends Solution {
  risk?: {
    title: string;
    // Add other risk fields needed for display
  };
}
