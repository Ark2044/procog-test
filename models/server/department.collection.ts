import { Permission, IndexType } from "node-appwrite";
import { departmentCollection, db } from "../name";
import { databases } from "./config";
import { collectionExists } from "./dbSetup";

export default async function createDepartmentCollection() {
  try {
    // Check if collection already exists
    const exists = await collectionExists(departmentCollection);
    if (exists) {
      return; // Skip creation if collection already exists
    }

    await databases.createCollection(
      db,
      departmentCollection,
      departmentCollection,
      [
        Permission.read("any"),
        Permission.create("team:admin"),
        Permission.update("team:admin"),
        Permission.delete("team:admin"),
      ]
    );

    // Create attributes for department collection
    await databases.createStringAttribute(
      db,
      departmentCollection,
      "name",
      100,
      true,
      undefined,
      false
    );

    await databases.createBooleanAttribute(
      db,
      departmentCollection,
      "isDefault",
      false
    );

    // Create indexes
    await databases.createIndex(
      db,
      departmentCollection,
      "name_unique",
      IndexType.Unique,
      ["name"]
    );

    console.log("Department collection created");
  } catch (error) {
    console.error("Error creating department collection:", error);
    throw error;
  }
}
