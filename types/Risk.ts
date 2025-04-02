export interface Risk {
  $id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags: string[];
  attachmentId?: string;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation: string;
  department: string;
  isConfidential: boolean;
  authorizedViewers: string[];
  created: string;
  updated: string;
}