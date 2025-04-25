import { Permission, IndexType } from "node-appwrite";
import { commentCollection, db } from "../name";
import { databases } from "./config";
import { collectionExists } from "./dbSetup";

export default async function createCommentCollection() {
  try {
    // Check if collection already exists
    const exists = await collectionExists(commentCollection);
    if (exists) {
      return; // Skip creation if collection already exists
    }

    // Creating Collection
    await databases.createCollection(db, commentCollection, commentCollection, [
      Permission.create("users"), // Users can create comments
      Permission.read("any"), // Anyone can read comments
      Permission.read("users"), // Users can read comments
      Permission.update("users"), // Users can update comments
      Permission.delete("users"), // Users can delete comments
    ]);
    console.log("Comment Collection Created");

    // Creating Attributes
    await Promise.all([
      databases.createStringAttribute(
        db,
        commentCollection,
        "content",
        10000,
        true
      ), // Comment text
      databases.createStringAttribute(
        db,
        commentCollection,
        "authorId",
        50,
        true
      ), // Author's user ID
      databases.createStringAttribute(
        db,
        commentCollection,
        "authorName",
        100,
        true
      ), // Author's name (NEW)
      databases.createStringAttribute(
        db,
        commentCollection,
        "riskId",
        50,
        true
      ), // Associated risk ID
      databases.createStringAttribute(
        db,
        commentCollection,
        "parentId",
        50,
        false
      ), // Parent comment ID (optional)
      databases.createStringAttribute(
        db,
        commentCollection,
        "replyToName",
        100,
        false
      ), // Name of user being replied to (optional)
      databases.createStringAttribute(
        db,
        commentCollection,
        "replyToContent",
        1000,
        false
      ), // Content snippet of the comment being replied to (optional)
      databases.createIntegerAttribute(
        db,
        commentCollection,
        "upvotes",
        true,
        0
      ), // Upvote count
      databases.createIntegerAttribute(
        db,
        commentCollection,
        "downvotes",
        true,
        0
      ), // Downvote count
      databases.createBooleanAttribute(
        db,
        commentCollection,
        "isFlagged",
        true
      ), // Flagged status
      databases.createDatetimeAttribute(db, commentCollection, "created", true), // Creation timestamp
      databases.createStringAttribute(
        db,
        commentCollection,
        "mentions",
        1000,
        false,
        undefined,
        true,
        true
      ), // Mentions (array)
      databases.createStringAttribute(
        db,
        commentCollection,
        "voters",
        10000,
        false,
        undefined,
        true,
        true
      ), // Voters (array)
    ]);
    console.log("Comment Attributes Created");

    // Creating Indexes
    await Promise.all([
      databases.createIndex(db, commentCollection, "riskId", IndexType.Key, [
        "riskId",
      ]), // Index for filtering by riskId
      databases.createIndex(db, commentCollection, "parentId", IndexType.Key, [
        "parentId",
      ]), // Index for threading
      databases.createIndex(db, commentCollection, "authorId", IndexType.Key, [
        "authorId",
      ]), // Index for filtering by author
      databases.createIndex(db, commentCollection, "created", IndexType.Key, [
        "created",
      ]), // Index for sorting by creation time
    ]);
    console.log("Comment Indexes Created");
  } catch (error) {
    console.error("Error creating comment collection:", error);
  }
}
