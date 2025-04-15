import { create } from "zustand";
import { databases, client, storage } from "@/models/client/config";
import {
  db,
  riskCollection,
  reminderCollection,
  riskAttachmentBucket,
} from "@/models/name";
import { Risk } from "@/types/Risk";
import { toast } from "react-hot-toast";
import { Query } from "appwrite";
import {
  getUsersByDepartment,
  sendRiskNotification,
} from "@/utils/emailService";

interface CreateRiskData {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags: string[];
  file?: File;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation?: string;
  acceptance?: string;
  transfer?: string;
  avoidance?: string;
  department?: string;
  isConfidential: boolean;
  authorizedViewers: string[];
  dueDate?: Date;
}

interface RiskState {
  risk: Risk | null;
  loading: boolean;
  error: string | null;
  subscription: (() => void) | null;

  createRisk: (data: CreateRiskData) => Promise<Risk>;
  fetchRisk: (riskId: string) => Promise<void>;
  updateRisk: (riskId: string, updates: Partial<Risk>) => Promise<void>;
  closeRisk: (riskId: string, resolution: string) => Promise<void>;
  subscribeToRisk: (riskId: string) => void;
  unsubscribeFromRisk: () => void;
}

export const useRiskStore = create<RiskState>((set, get) => ({
  risk: null,
  loading: false,
  error: null,
  subscription: null,

  createRisk: async (data: CreateRiskData) => {
    set({ loading: true, error: null });
    try {
      let attachmentId: string | undefined;

      // Handle file upload if present
      if (data.file) {
        const fileResponse = await storage.createFile(
          riskAttachmentBucket,
          "unique()",
          data.file
        );
        attachmentId = fileResponse.$id;
      }

      // Prepare the risk data
      const riskData = {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        tags: data.tags,
        attachmentId,
        impact: data.impact,
        probability: data.probability,
        action: data.action,
        mitigation: data.mitigation || "",
        acceptance: data.acceptance || "",
        transfer: data.transfer || "",
        avoidance: data.avoidance || "",
        department: data.department || "general",
        isConfidential: data.isConfidential,
        authorizedViewers: data.isConfidential ? data.authorizedViewers : [],
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        status: "active",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };

      // Create the risk document
      const response = await databases.createDocument(
        db,
        riskCollection,
        "unique()",
        riskData
      );

      // Convert response to Risk type
      const risk: Risk = {
        $id: response.$id,
        title: response.title,
        content: response.content,
        authorId: response.authorId,
        authorName: response.authorName,
        tags: response.tags || [],
        attachmentId: response.attachmentId,
        impact: response.impact || "low",
        probability: response.probability || 0,
        action: response.action || "mitigate",
        mitigation: response.mitigation || "",
        acceptance: response.acceptance || "",
        transfer: response.transfer || "",
        avoidance: response.avoidance || "",
        department: response.department || "",
        isConfidential: response.isConfidential || false,
        authorizedViewers: response.authorizedViewers || [],
        created: response.created,
        updated: response.updated,
        status: response.status || "active",
        resolution: response.resolution,
        dueDate: response.dueDate,
      };

      // Send email notifications to users in the same department
      if (risk.department && !risk.isConfidential) {
        await getUsersByDepartment(risk.department);
        // Removed unused variable 'formattedUsers'
        await sendRiskNotification(risk, "created");
      }

      toast.success("Risk created successfully");
      return risk;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create risk";
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchRisk: async (riskId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await databases.getDocument(db, riskCollection, riskId);
      const risk: Risk = {
        $id: response.$id,
        title: response.title,
        content: response.content,
        authorId: response.authorId,
        authorName: response.authorName,
        tags: response.tags || [],
        attachmentId: response.attachmentId,
        impact: response.impact || "low",
        probability: response.probability || 0,
        action: response.action || "mitigate",
        mitigation: response.mitigation || "",
        acceptance: response.acceptance || "",
        transfer: response.transfer || "",
        avoidance: response.avoidance || "",
        department: response.department || "",
        isConfidential: response.isConfidential || false,
        authorizedViewers: response.authorizedViewers || [],
        created: response.created,
        updated: response.updated,
        status: response.status || "active",
        resolution: response.resolution,
        dueDate: response.dueDate,
      };
      set({ risk });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch risk";
      set({ error: message });
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },

  updateRisk: async (riskId: string, updates: Partial<Risk>) => {
    set({ loading: true, error: null });
    try {
      // Optimistic update
      const currentRisk = get().risk;
      if (currentRisk) {
        set({
          risk: {
            ...currentRisk,
            ...updates,
            updated: new Date().toISOString(),
          },
        });
      }

      const response = await databases.updateDocument(
        db,
        riskCollection,
        riskId,
        { ...updates, updated: new Date().toISOString() }
      );

      const updatedRisk: Risk = {
        $id: response.$id,
        title: response.title,
        content: response.content,
        authorId: response.authorId,
        authorName: response.authorName,
        tags: response.tags || [],
        attachmentId: response.attachmentId,
        impact: response.impact || "low",
        probability: response.probability || 0,
        action: response.action || "mitigate",
        mitigation: response.mitigation || "",
        acceptance: response.acceptance || "",
        transfer: response.transfer || "",
        avoidance: response.avoidance || "",
        department: response.department || "",
        isConfidential: response.isConfidential || false,
        authorizedViewers: response.authorizedViewers || [],
        created: response.created,
        updated: response.updated,
        status: response.status || "active",
        resolution: response.resolution,
        dueDate: response.dueDate,
      };

      set({ risk: updatedRisk });

      // Send email notifications to users in the same department for significant updates
      // Only send for significant updates, not every small change
      const significantUpdate =
        updates.title !== undefined ||
        updates.content !== undefined ||
        updates.impact !== undefined ||
        updates.probability !== undefined ||
        updates.action !== undefined;

      if (
        significantUpdate &&
        updatedRisk.department &&
        !updatedRisk.isConfidential
      ) {
        await sendRiskNotification(updatedRisk, "updated");
      }

      toast.success("Risk updated successfully");
    } catch (error) {
      // Revert optimistic update
      const message =
        error instanceof Error ? error.message : "Failed to update risk";
      set({ error: message });
      toast.error(message);
      // Refetch to ensure consistency
      get().fetchRisk(riskId);
    } finally {
      set({ loading: false });
    }
  },

  closeRisk: async (riskId: string, resolution: string) => {
    set({ loading: true, error: null });
    try {
      // Validate resolution is not empty or just a period
      const trimmedResolution = resolution?.trim() || "";
      if (
        !trimmedResolution ||
        trimmedResolution === "." ||
        /^\s*$/.test(trimmedResolution)
      ) {
        set({
          error: "Please provide a meaningful resolution when closing a risk",
        });
        toast.error(
          "Please provide a meaningful resolution when closing a risk"
        );
        set({ loading: false });
        return;
      }

      const currentRisk = get().risk;
      const now = new Date();

      const updates: Partial<Risk> = {
        status: "closed",
        updated: now.toISOString(),
        resolution: resolution,
      };

      // If risk has a future due date, update it to now since we're closing early
      if (currentRisk?.dueDate && new Date(currentRisk.dueDate) > now) {
        updates.dueDate = now.toISOString();
      }

      // First update the risk
      await get().updateRisk(riskId, updates);

      // Cancel all pending reminders for this risk
      try {
        // First get all pending reminders
        const remindersResponse = await databases.listDocuments(
          db,
          reminderCollection,
          [Query.equal("riskId", riskId), Query.equal("status", "pending")]
        );

        // Update all pending reminders to cancelled
        await Promise.all(
          remindersResponse.documents.map((reminder) =>
            databases.updateDocument(db, reminderCollection, reminder.$id, {
              status: "cancelled",
              updated: now.toISOString(),
            })
          )
        );
      } catch (error) {
        console.error("Failed to cancel reminders:", error);
        // Don't throw here as the risk is already closed
      }

      // Then create a solution
      if (currentRisk) {
        try {
          await fetch("/api/solution", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              riskId: riskId,
              solution: resolution,
              authorId: currentRisk.authorId,
            }),
          });

          // Send email notifications to users in the same department
          if (currentRisk.department && !currentRisk.isConfidential) {
            await getUsersByDepartment(currentRisk.department);
            const closedRisk = { ...currentRisk, resolution }; // Include resolution in notification
            // Removed unused variable 'formattedUsers'
            await sendRiskNotification(closedRisk, "closed");
          }
        } catch (error) {
          console.error(
            "Failed to create solution or send notifications:",
            error
          );
          // Don't throw here as the risk is already closed
        }
      }

      toast.success("Risk closed successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to close risk";
      set({ error: message });
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },

  subscribeToRisk: (riskId: string) => {
    const unsubscribe = client.subscribe(
      `databases.${db}.collections.${riskCollection}.documents.${riskId}`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          get().fetchRisk(riskId);
        }
      }
    );
    set({ subscription: unsubscribe });
  },

  unsubscribeFromRisk: () => {
    const { subscription } = get();
    if (subscription) {
      subscription();
      set({ subscription: null });
    }
  },
}));
