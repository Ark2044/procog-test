import { db } from "../name";
import createSolutionCollection from "./solution.collection";
import createCommentCollection from "./comment.collection";
import createRiskCollection from "./risk.collection";
import createVoteCollection from "./vote.collection";
import { databases } from "./config";
import createRemindersCollection from "./reminder.collection";

export default async function getOrCreateDB() {
  try {
    await databases.get(db);
    console.log("Database connection successful");
  } catch {
    try {
      await databases.create(db, db);
      console.log("database created");
      //create collections
      await Promise.all([
        createRiskCollection(),
        createSolutionCollection(),
        createCommentCollection(),
        createVoteCollection(),
        createRemindersCollection(),
      ]);
      console.log("Collections created");
      console.log("Database connected");
    } catch (error) {
      console.log("Error creating databases or collections", error);
    }
  }

  return databases;
}
