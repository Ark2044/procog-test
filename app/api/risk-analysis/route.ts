import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import env from "@/app/env";

// Initialize the API client
const genAI = new GoogleGenAI({
  apiKey: env.gemini.apiKey,
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
  userId: string;
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
    // Parse the request body as JSON
    const riskData = (await request.json()) as RiskAnalysisInput;
    // Generate a riskId (you could also use a UUID package)
    const riskId = crypto.randomUUID();

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
      userId: riskData.userId,
      riskId: riskId,
      created: new Date().toISOString(),
    };

    return NextResponse.json(riskAnalysis);
  } catch (error) {
    console.error("Error generating risk analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate risk analysis" },
      { status: 500 }
    );
  }
}
