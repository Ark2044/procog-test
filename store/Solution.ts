import { create } from "zustand";
import { databases, client } from "@/models/client/config";
import { db, solutionCollection, riskCollection } from "@/models/name";
import { Solution, SolutionWithRisk } from "@/types/Solution";
import { ID, Query } from "appwrite";
import { toast } from "react-hot-toast";

interface SolutionState {
  solutions: SolutionWithRisk[];
  loading: boolean;
  error: string | null;
  subscription: (() => void) | null;

  fetchSolutions: (riskId: string) => Promise<void>;
  addSolution: (
    solution: Omit<Solution, "$id" | "created" | "updated">
  ) => Promise<void>;
  updateSolution: (
    solutionId: string,
    updates: Partial<Solution>
  ) => Promise<void>;
  deleteSolution: (solutionId: string) => Promise<void>;
  subscribe: (riskId: string) => void;
  unsubscribe: () => void;
}

export const useSolutionStore = create<SolutionState>((set, get) => ({
  solutions: [],
  loading: false,
  error: null,
  subscription: null,

  fetchSolutions: async (riskId: string) => {
    set({ loading: true, error: null });

    try {
      // Fetch solutions for this risk
      const response = await databases.listDocuments(db, solutionCollection, [
        Query.equal("riskId", riskId),
        Query.orderDesc("created"),
      ]);

      const solutions = response.documents as Solution[];

      // Fetch the risk once for all solutions
      let riskTitle = "";
      try {
        const risk = await databases.getDocument(db, riskCollection, riskId);
        riskTitle = risk.title;
      } catch (error) {
        console.error(`Error fetching risk ${riskId}:`, error);
      }

      // Add risk data to solutions
      const solutionsWithRisk = solutions.map((solution) => ({
        ...solution,
        risk: { title: riskTitle },
      }));

      set({
        solutions: solutionsWithRisk,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch solutions";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  addSolution: async (solution) => {
    set({ loading: true, error: null });

    try {
      // Current timestamp
      const now = new Date().toISOString();

      // Create solution document
      const response = await databases.createDocument(
        db,
        solutionCollection,
        ID.unique(),
        {
          ...solution,
          created: now,
          updated: now,
        }
      );

      // Get risk title
      let riskTitle = "";
      try {
        const risk = await databases.getDocument(
          db,
          riskCollection,
          solution.riskId
        );
        riskTitle = risk.title;
      } catch (error) {
        console.error(`Error fetching risk ${solution.riskId}:`, error);
      }

      // Update local state
      set((state) => ({
        solutions: [
          {
            ...(response as Solution),
            risk: { title: riskTitle },
          },
          ...state.solutions,
        ],
        loading: false,
      }));

      toast.success("Solution added successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add solution";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  updateSolution: async (solutionId, updates) => {
    set({ loading: true, error: null });

    try {
      // Add updated timestamp
      const updatesWithTimestamp = {
        ...updates,
        updated: new Date().toISOString(),
      };

      // Optimistic update
      set((state) => ({
        solutions: state.solutions.map((s) =>
          s.$id === solutionId ? { ...s, ...updatesWithTimestamp } : s
        ),
      }));

      // Update in database
      await databases.updateDocument(
        db,
        solutionCollection,
        solutionId,
        updatesWithTimestamp
      );

      toast.success("Solution updated successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update solution";
      set({ error: message, loading: false });
      toast.error(message);

      // Refresh to ensure consistency
      const riskId = get().solutions.find((s) => s.$id === solutionId)?.riskId;
      if (riskId) {
        get().fetchSolutions(riskId);
      }
    } finally {
      set({ loading: false });
    }
  },

  deleteSolution: async (solutionId) => {
    set({ loading: true, error: null });

    try {
      // Optimistic update
      set((state) => ({
        solutions: state.solutions.filter((s) => s.$id !== solutionId),
      }));

      // Delete from database
      await databases.deleteDocument(db, solutionCollection, solutionId);

      toast.success("Solution deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete solution";
      set({ error: message, loading: false });
      toast.error(message);

      // Refresh to ensure consistency
      const riskId = get().solutions.find((s) => s.$id === solutionId)?.riskId;
      if (riskId) {
        get().fetchSolutions(riskId);
      }
    } finally {
      set({ loading: false });
    }
  },

  subscribe: (riskId) => {
    const unsubscribe = client.subscribe(
      `databases.${db}.collections.${solutionCollection}.documents`,
      (response) => {
        if (
          response.events.includes("databases.*.collections.*.documents.*") &&
          (response.payload as { riskId: string }).riskId === riskId
        ) {
          get().fetchSolutions(riskId);
        }
      }
    );
    set({ subscription: unsubscribe });
  },

  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      subscription();
      set({ subscription: null });
    }
  },
}));
