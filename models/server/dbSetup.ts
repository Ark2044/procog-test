import { db } from "../name";
import createSolutionCollection from "./solution.collection";
import createCommentCollection from "./comment.collection";
import createRiskCollection from "./risk.collection";
import createVoteCollection from "./vote.collection";
import { databases } from "./config";
import createRemindersCollection from "./reminder.collection";
import createRiskAnalysisCollection from "./riskAnalysis.collection";
import createDepartmentCollection from "./department.collection";

/**
 * Checks if a collection exists in the database
 * @param collectionId The ID of the collection to check
 * @returns true if the collection exists, false otherwise
 */
export async function collectionExists(collectionId: string): Promise<boolean> {
  try {
    await databases.getCollection(db, collectionId);
    console.log(`Collection ${collectionId} already exists`);
    return true;
  } catch (error) {
    console.log(`Collection ${collectionId} does not exist yet`, error);
    return false;
  }
}

/**
 * Creates all required collections if they don't already exist
 */
async function createMissingCollections() {
  try {
    console.log("Checking and creating any missing collections...");
    await Promise.all([
      createRiskCollection(),
      createSolutionCollection(),
      createCommentCollection(),
      createVoteCollection(),
      createRemindersCollection(),
      createRiskAnalysisCollection(),
      createDepartmentCollection(),
    ]);
    console.log("All collections checked/created successfully");
  } catch (error) {
    console.error("Error creating collections:", error);
  }
}

export default async function getOrCreateDB() {
  try {
    // Check if database exists
    await databases.get(db);
    console.log("Database connection successful");

    // Even if database exists, make sure all collections exist too
    await createMissingCollections();
  } catch (error) {
    try {
      // Database doesn't exist, create it and all collections
      await databases.create(db, db);
      console.log("Database created");

      // Create all collections
      await createMissingCollections();
      console.log("Database connected and initialized");
    } catch (dbError) {
      console.error("Error creating database or collections", dbError);
    }
  }

  return databases;
}
