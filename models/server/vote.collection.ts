import { Permission, IndexType } from "node-appwrite";
import { db, voteCollection } from "../name";
import { databases } from "./config";
import { collectionExists } from "./dbSetup";

export default async function createVoteCollection() {
  try {
    // Check if collection already exists
    const exists = await collectionExists(voteCollection);
    if (exists) {
      return; // Skip creation if collection already exists
    }

    // Creating Collection
    await databases.createCollection(db, voteCollection, voteCollection, [
      Permission.create("users"),
      Permission.read("any"),
      Permission.read("users"),
      Permission.update("users"),
      Permission.delete("users"),
    ]);
    console.log("Vote Collection Created");

    // Creating Attributes
    await Promise.all([
      databases.createEnumAttribute(
        db,
        voteCollection,
        "type",
        ["question", "answer"],
        true
      ),
      databases.createStringAttribute(db, voteCollection, "typeId", 50, true),
      databases.createEnumAttribute(
        db,
        voteCollection,
        "voteStatus",
        ["upvoted", "downvoted"],
        true
      ),
      databases.createStringAttribute(
        db,
        voteCollection,
        "votedById",
        50,
        true
      ),
    ]);
    console.log("Vote Attributes Created");

    // Creating Indexes for faster lookups
    await Promise.all([
      databases.createIndex(db, voteCollection, "type_typeId", IndexType.Key, [
        "type",
        "typeId",
      ]),
      databases.createIndex(db, voteCollection, "votedById", IndexType.Key, [
        "votedById",
      ]),
      databases.createIndex(db, voteCollection, "combo", IndexType.Key, [
        "type",
        "typeId",
        "votedById",
      ]),
    ]);
    console.log("Vote Indexes Created");
  } catch (error) {
    console.error("Error creating vote collection:", error);
  }
}
