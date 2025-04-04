import { IndexType, Permission } from "node-appwrite";
import { db, riskAnalysisCollection } from "../name";
import { databases } from "./config";

export default async function createRiskAnalysisCollection() {
  try {
    // Create the risk analysis collection with permissions
    await databases.createCollection(
      db,
      riskAnalysisCollection,
      riskAnalysisCollection,
      [
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]
    );
    console.log("Risk Analysis Collection is created");

    // Create attributes
    await Promise.all([
      databases.createStringAttribute(
        db,
        riskAnalysisCollection,
        "riskId",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        riskAnalysisCollection,
        "userId",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        riskAnalysisCollection,
        "summary",
        2000,
        true
      ),
      databases.createStringAttribute(
        db,
        riskAnalysisCollection,
        "keyConcerns",
        10000,
        true,
        undefined,
        true,
        true
      ),
      databases.createStringAttribute(
        db,
        riskAnalysisCollection,
        "recommendations",
        10000,
        true,
        undefined,
        true,
        true
      ),
      databases.createStringAttribute(
        db,
        riskAnalysisCollection,
        "created",
        255,
        true
      ),
    ]);
    console.log("Risk Analysis Attributes created");

    // Create indexes
    await Promise.all([
      databases.createIndex(
        db,
        riskAnalysisCollection,
        "riskId",
        IndexType.Key,
        ["riskId"]
      ),
      databases.createIndex(
        db,
        riskAnalysisCollection,
        "userId",
        IndexType.Key,
        ["userId"]
      ),
      databases.createIndex(
        db,
        riskAnalysisCollection,
        "user_risk_combo",
        IndexType.Key,
        ["userId", "riskId"]
      ),
      databases.createIndex(
        db,
        riskAnalysisCollection,
        "created",
        IndexType.Key,
        ["created"]
      ),
    ]);
    console.log("Risk Analysis Indexes created");
  } catch (error) {
    console.error(
      "Error creating risk analysis collection or attributes:",
      error
    );
  }
}
