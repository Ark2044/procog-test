import { IndexType, Permission } from "node-appwrite";
import { db, reminderCollection } from "../name"; // Assuming this is the database ID
import { databases } from "./config";

export default async function createRemindersCollection() {
  try {
    // Create the reminders collection with permissions
    await databases.createCollection(
      db,
      reminderCollection,
      reminderCollection,
      [
        Permission.read("any"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]
    );
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
      databases.createStringAttribute(
        db,
        reminderCollection,
        "title",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        reminderCollection, // fixed collection name for description
        "description",
        1000,
        false
      ),
      databases.createStringAttribute(
        db,
        reminderCollection,
        "userId",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        reminderCollection,
        "riskId",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        reminderCollection,
        "email",
        255,
        true
      ),
      // Added missing attribute: riskTitle
      databases.createStringAttribute(
        db,
        reminderCollection,
        "riskTitle",
        255,
        true
      ),
      // Use string instead of datetime for date fields
      databases.createStringAttribute(
        db,
        reminderCollection,
        "datetime",
        255,
        true
      ),
      databases.createEnumAttribute(
        db,
        reminderCollection,
        "status",
        statusEnumValues,
        true
      ),
      databases.createEnumAttribute(
        db,
        reminderCollection,
        "recurrence",
        recurrenceEnumValues,
        true
      ),
      databases.createStringAttribute(
        db,
        reminderCollection,
        "created",
        255,
        true
      ),
      databases.createStringAttribute(
        db,
        reminderCollection,
        "updated",
        255,
        true
      ),
    ]);
    console.log("Reminders Attributes created");

    // Create indexes
    await Promise.all([
      databases.createIndex(
        db,
        reminderCollection,
        "title",
        IndexType.Fulltext,
        ["title"]
      ),
      databases.createIndex(
        db,
        reminderCollection,
        "description",
        IndexType.Fulltext,
        ["description"]
      ),
      databases.createIndex(db, reminderCollection, "userId", IndexType.Key, [
        "userId",
      ]),
      databases.createIndex(db, reminderCollection, "riskId", IndexType.Key, [
        "riskId",
      ]),
      databases.createIndex(db, reminderCollection, "email", IndexType.Key, [
        "email",
      ]),
      // Added index for the new riskTitle attribute
      databases.createIndex(
        db,
        reminderCollection,
        "riskTitle",
        IndexType.Key,
        ["riskTitle"]
      ),
      databases.createIndex(db, reminderCollection, "datetime", IndexType.Key, [
        "datetime",
      ]),
      databases.createIndex(db, reminderCollection, "status", IndexType.Key, [
        "status",
      ]),
      databases.createIndex(
        db,
        reminderCollection,
        "recurrence",
        IndexType.Key,
        ["recurrence"]
      ),
      databases.createIndex(db, reminderCollection, "created", IndexType.Key, [
        "created",
      ]),
      databases.createIndex(db, reminderCollection, "updated", IndexType.Key, [
        "updated",
      ]),
    ]);
    console.log("Reminders Indexes created");
  } catch (error) {
    console.error("Error creating reminders collection or attributes:", error);
  }
}
