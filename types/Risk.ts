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
  acceptance?: string; // Strategy for accept action
  transfer?: string; // Strategy for transfer action
  avoidance?: string; // Strategy for avoid action
  department: string;
  isConfidential: boolean;
  authorizedViewers: string[];
  dueDate?: string;
  created: string;
  updated: string;
  status: "active" | "closed" | "resolved";
  resolution?: string;
}
