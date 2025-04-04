import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { databases } from "@/models/client/config";
import { db, riskAnalysisCollection } from "@/models/name";
import { ID } from "appwrite";
import { getCurrentUser } from "@/lib/serverAuth";
import { checkAnalysisRateLimit } from "@/lib/rateLimit";

// Initialize the API client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

interface RiskAnalysisInput {
  title: string;
  content: string;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation?: string;
  acceptance?: string;
  transfer?: string;
  avoidance?: string;
  riskId: string;
}

export interface RiskAnalysis {
  summary: string;
  keyConcerns: string[];
  recommendations: string[];
  similarRisks?: string[];
  userId: string;
  riskId: string;
  created: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const underLimit = await checkAnalysisRateLimit(user.$id);
    if (!underLimit) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait before requesting another analysis.",
        },
        { status: 429 }
      );
    }

    // Parse the request body as JSON
    const riskData = (await request.json()) as RiskAnalysisInput;

    // Validate required fields
    if (!riskData.riskId) {
      return NextResponse.json(
        { error: "Risk ID is required" },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = `
      Analyze this risk assessment with the following details:
      
      Title: ${riskData.title}
      
      Description: ${riskData.content}
      
      Impact: ${riskData.impact}
      
      Probability: ${riskData.probability * 20}%
      
      Action Strategy: ${riskData.action}
      
      ${
        riskData.action === "mitigate" && riskData.mitigation
          ? `Mitigation Strategy: ${riskData.mitigation}`
          : ""
      }
      ${
        riskData.action === "accept" && riskData.acceptance
          ? `Acceptance Rationale: ${riskData.acceptance}`
          : ""
      }
      ${
        riskData.action === "transfer" && riskData.transfer
          ? `Transfer Mechanism: ${riskData.transfer}`
          : ""
      }
      ${
        riskData.action === "avoid" && riskData.avoidance
          ? `Avoidance Approach: ${riskData.avoidance}`
          : ""
      }
      
      Please provide:
      1. A concise summary of the risk (2-3 sentences)
      2. 3-5 key concerns based on the details above
      3. 3-5 specific recommendations to better manage this risk
      
      Format your response as JSON with the following structure:
      {
        "summary": "Summary text here",
        "keyConcerns": ["Concern 1", "Concern 2", ...],
        "recommendations": ["Recommendation 1", "Recommendation 2", ...]
      }
    `;

    // Call the Gemini API to generate the risk analysis
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const responseText = result.text;

    // Validate and parse the response as JSON
    if (!responseText) {
      throw new Error("Gemini response is undefined");
    }
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response as JSON");
    }
    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Build the final risk analysis object
    const riskAnalysis: RiskAnalysis = {
      summary: parsedResponse.summary,
      keyConcerns: parsedResponse.keyConcerns,
      recommendations: parsedResponse.recommendations,
      userId: user.$id,
      riskId: riskData.riskId,
      created: new Date().toISOString(),
    };

    // Save to database
    const savedAnalysis = await databases.createDocument(
      db,
      riskAnalysisCollection,
      ID.unique(),
      riskAnalysis
    );

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("Error generating risk analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate risk analysis" },
      { status: 500 }
    );
  }
}
