export interface Risk {
    $id: string;
    title: string;
    content: string;
    authorId: string;
    tags: string[];
    attachmentId?: string;
    impact: "low" | "medium" | "high";
    probability: string; // Adjust if this should be a different type
    action: "mitigate" | "accept" | "transfer" | "avoid";
    created: string; // ISO date string
    updated: string; // ISO date string
}
