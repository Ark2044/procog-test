import { create } from "zustand";
import { databases } from "@/models/client/config";
import { db, riskAnalysisCollection } from "@/models/name";
import { toast } from "react-hot-toast";
import { Query } from "appwrite";

interface GeminiRiskAnalysis {
  summary: string;
  keyConcerns: string[];
  recommendations: string[];
  similarRisks?: string[];
  userId: string;
  riskId: string;
  created: string;
}

// Extend the base RiskAnalysis type to include the $id field
interface RiskAnalysis extends GeminiRiskAnalysis {
  $id?: string;
}

interface RiskAnalysisState {
  analyses: Record<string, RiskAnalysis>;
  currentAnalysis: RiskAnalysis | null;
  loading: boolean;
  error: string | null;

  generateAnalysis: (riskId: string, userId: string) => Promise<RiskAnalysis>;
  getAnalysisForRisk: (
    riskId: string,
    userId: string
  ) => Promise<RiskAnalysis | null>;
  clearCurrentAnalysis: () => void;
}

export const useRiskAnalysisStore = create<RiskAnalysisState>((set, get) => ({
  analyses: {},
  currentAnalysis: null,
  loading: false,
  error: null,

  generateAnalysis: async (riskId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      // First fetch the risk data
      const riskResponse = await databases.getDocument(db, "risks", riskId);
      const risk = {
        title: riskResponse.title,
        content: riskResponse.content,
        impact: riskResponse.impact,
        probability: riskResponse.probability,
        action: riskResponse.action,
        mitigation: riskResponse.mitigation || "",
        acceptance: riskResponse.acceptance || "",
        transfer: riskResponse.transfer || "",
        avoidance: riskResponse.avoidance || "",
        userId: userId,
      };

      // Call the Next.js API route that wraps your Gemini integration
      const res = await fetch("/api/risk-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(risk),
      });

      if (!res.ok) {
        throw new Error("Failed to generate risk analysis");
      }

      const analysis: GeminiRiskAnalysis = await res.json();

      // Store the analysis in the database
      const analysisResponse = await databases.createDocument(
        db,
        riskAnalysisCollection,
        "unique()",
        {
          riskId,
          userId,
          summary: analysis.summary,
          keyConcerns: analysis.keyConcerns,
          recommendations: analysis.recommendations,
          created: new Date().toISOString(),
        }
      );

      // Update local state
      const newAnalysis: RiskAnalysis = {
        ...analysis,
        $id: analysisResponse.$id,
      };

      set((state) => ({
        analyses: {
          ...state.analyses,
          [riskId]: newAnalysis,
        },
        currentAnalysis: newAnalysis,
      }));

      toast.success("Risk analysis generated");
      return newAnalysis;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate analysis";
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getAnalysisForRisk: async (riskId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      // Check if we already have it in state
      if (get().analyses[riskId]) {
        set({ currentAnalysis: get().analyses[riskId] });
        return get().analyses[riskId];
      }

      // Use Appwrite's Query helper for properly formatted queries
      const response = await databases.listDocuments(
        db,
        riskAnalysisCollection,
        [Query.equal("riskId", riskId), Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        const analysis: RiskAnalysis = {
          $id: doc.$id,
          riskId: doc.riskId,
          userId: doc.userId,
          summary: doc.summary,
          keyConcerns: doc.keyConcerns,
          recommendations: doc.recommendations,
          created: doc.created,
        };

        // Update state
        set((state) => ({
          analyses: {
            ...state.analyses,
            [riskId]: analysis,
          },
          currentAnalysis: analysis,
        }));

        return analysis;
      }

      return null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch analysis";
      set({ error: message });
      toast.error(message);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  clearCurrentAnalysis: () => {
    set({ currentAnalysis: null });
  },
}));
