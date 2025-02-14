export interface Risk {
    $id: string;
    title: string;
    content: string;
    authorId: string;
    tags: string[];
    attachmentId?: string;
    impact: "low" | "medium" | "high";
    probability: string;
    action: "mitigate" | "accept" | "transfer" | "avoid";
    department: string;
    isConfidential: boolean;
    authorizedViewers: string[];
    created: string;
    updated: string;
}
