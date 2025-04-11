import { create } from "zustand";
import { databases, client } from "@/models/client/config";
import { db, riskCollection, reminderCollection } from "@/models/name";
import { Risk } from "@/types/Risk";
import { toast } from "react-hot-toast";
import { Query } from "appwrite";

interface RiskState {
  risk: Risk | null;
  loading: boolean;
  error: string | null;
  subscription: (() => void) | null;

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
      };
      set({ risk: updatedRisk });
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
      if (!resolution?.trim()) {
        throw new Error("Resolution is required when closing a risk");
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
          [
            Query.equal("riskId", riskId),
            Query.equal("status", "pending")
          ]
        );

        // Update all pending reminders to cancelled
        await Promise.all(
          remindersResponse.documents.map(reminder =>
            databases.updateDocument(
              db,
              reminderCollection,
              reminder.$id,
              {
                status: "cancelled",
                updated: now.toISOString()
              }
            )
          )
        );
      } catch (error) {
        console.error('Failed to cancel reminders:', error);
        // Don't throw here as the risk is already closed
      }

      // Then create a solution
      if (currentRisk) {
        try {
          await fetch('/api/solution', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              riskId: riskId,
              solution: resolution,
              authorId: currentRisk.authorId,
            }),
          });
        } catch (error) {
          console.error('Failed to create solution:', error);
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
