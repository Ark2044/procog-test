import { ReactNode } from "react";

export interface Reminder {
  $id: string;
  title: string;
  description?: string;
  datetime: string; // ISO string
  userId: string;
  riskId: string; // Associated risk ID
  recurrence: "none" | "daily" | "weekly" | "monthly";
  status: "pending" | "completed" | "cancelled";
  created: string;
  updated: string;
  email?: string;
}

// Extended reminder with associated risk information
export interface ReminderWithRisk extends Reminder {
  reminderDate: string | number | Date;
  note: ReactNode;
  risk?: {
    title: string;
    // Add other risk fields if needed
  };
}
