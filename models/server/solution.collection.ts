import { Permission, IndexType } from "node-appwrite";
import { solutionCollection, db } from "../name";
import { databases } from "./config";
import { collectionExists } from "./dbSetup";

export default async function createSolutionCollection() {
  try {
    // Check if collection already exists
    const exists = await collectionExists(solutionCollection);
    if (exists) {
      return; // Skip creation if collection already exists
    }

    // Creating Collection
    await databases.createCollection(
      db,
      solutionCollection,
      solutionCollection,
      [
        Permission.create("users"),
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]
    );
    console.log("Solution Collection Created");

    // Creating Attributes
    await Promise.all([
      databases.createStringAttribute(
        db,
        solutionCollection,
        "content",
        10000,
        true
      ),
      databases.createStringAttribute(
        db,
        solutionCollection,
        "riskId",
        50,
        true
      ),
      databases.createStringAttribute(
        db,
        solutionCollection,
        "authorId",
        50,
        true
      ),
      databases.createStringAttribute(
        db,
        solutionCollection,
        "authorName",
        100,
        true
      ),
      databases.createStringAttribute(
        db,
        solutionCollection,
        "created",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        solutionCollection,
        "updated",
        255,
        true
      ),
    ]);
    console.log("Solution Attributes Created");

    // Creating Indexes
    await Promise.all([
      databases.createIndex(db, solutionCollection, "riskId", IndexType.Key, [
        "riskId",
      ]),
      databases.createIndex(db, solutionCollection, "authorId", IndexType.Key, [
        "authorId",
      ]),
      databases.createIndex(db, solutionCollection, "created", IndexType.Key, [
        "created",
      ]),
    ]);
    console.log("Solution Indexes Created");
  } catch (error) {
    console.error("Error creating solution collection:", error);
  }
}
