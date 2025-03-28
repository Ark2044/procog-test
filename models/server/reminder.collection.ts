import { IndexType, Permission } from "node-appwrite";
import { databases } from "./config";
import { db } from "../name"; // Assuming this is the database ID

export default async function createRemindersCollection() {
  try {
    // Create the reminders collection with permissions
    await databases.createCollection(db, "reminders", "Reminders", [
      Permission.read("any"),
      Permission.create("users"),
      Permission.update("users"),
      Permission.delete("users"),
    ]);
    console.log("Reminders Collection is created");

    // Define the enum values for status and recurrence
    const statusEnumValues = ["pending", "completed", "overdue", "cancelled"];
    const recurrenceEnumValues = [
      "none",
      "daily",
      "weekly",
      "monthly",
      "yearly",
    ];

    // Create attributes
    await Promise.all([
      databases.createStringAttribute(db, "reminders", "title", 255, true),
      databases.createStringAttribute(
        db,
        "reminders",
        "description",
        1000,
        false
      ),
      databases.createStringAttribute(db, "reminders", "userId", 255, true),
      databases.createStringAttribute(db, "reminders", "riskId", 255, true),
      databases.createStringAttribute(db, "reminders", "email", 255, true),
      // Use string instead of datetime for date fields
      databases.createStringAttribute(db, "reminders", "datetime", 255, true),
      databases.createEnumAttribute(
        db,
        "reminders",
        "status",
        statusEnumValues,
        true
      ),
      databases.createEnumAttribute(
        db,
        "reminders",
        "recurrence",
        recurrenceEnumValues,
        true
      ),
      databases.createStringAttribute(db, "reminders", "created", 255, true),
      databases.createStringAttribute(db, "reminders", "updated", 255, true),
    ]);
    console.log("Reminders Attributes created");

    // Create indexes
    await Promise.all([
      databases.createIndex(db, "reminders", "title", IndexType.Fulltext, [
        "title",
      ]),
      databases.createIndex(
        db,
        "reminders",
        "description",
        IndexType.Fulltext,
        ["description"]
      ),
      databases.createIndex(db, "reminders", "userId", IndexType.Key, [
        "userId",
      ]),
      databases.createIndex(db, "reminders", "riskId", IndexType.Key, [
        "riskId",
      ]),
      databases.createIndex(db, "reminders", "email", IndexType.Key, ["email"]),
      databases.createIndex(db, "reminders", "datetime", IndexType.Key, [
        "datetime",
      ]),
      databases.createIndex(db, "reminders", "status", IndexType.Key, [
        "status",
      ]),
      databases.createIndex(db, "reminders", "recurrence", IndexType.Key, [
        "recurrence",
      ]),
      databases.createIndex(db, "reminders", "created", IndexType.Key, [
        "created",
      ]),
      databases.createIndex(db, "reminders", "updated", IndexType.Key, [
        "updated",
      ]),
    ]);
    console.log("Reminders Indexes created");
  } catch (error) {
    console.error("Error creating reminders collection or attributes:", error);
  }
}
