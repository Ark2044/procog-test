export interface Reminder {
    $id: string;
    title: string;
    description?: string;
    datetime: string; // ISO string
    userId: string;
    riskId: string; // Associated risk ID
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
    status: 'pending' | 'completed' | 'cancelled';
    email: string;
    created: string;
    updated: string;
}