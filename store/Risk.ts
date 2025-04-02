import { create } from "zustand";
import { databases, client } from "@/models/client/config";
import { db, riskCollection } from "@/models/name";
import { Risk } from "@/types/Risk";
import { toast } from "react-hot-toast";

interface RiskState {
  risk: Risk | null;
  loading: boolean;
  error: string | null;
  subscription: (() => void) | null;

  fetchRisk: (riskId: string) => Promise<void>;
  updateRisk: (riskId: string, updates: Partial<Risk>) => Promise<void>;
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
        department: response.department || "",
        isConfidential: response.isConfidential || false,
        authorizedViewers: response.authorizedViewers || [],
        created: response.created,
        updated: response.updated,
        
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
        department: response.department || "",
        isConfidential: response.isConfidential || false,
        authorizedViewers: response.authorizedViewers || [],
        created: response.created,
        updated: response.updated,
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
