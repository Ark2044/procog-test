import { IndexType, Permission } from 'node-appwrite';
import { db, riskCollection } from '../name';
import { databases } from './config';

export default async function createRiskCollection() {
    try {
        // Create the risk collection with permissions
        await databases.createCollection(db, riskCollection, riskCollection, [
            Permission.read("any"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]);
        console.log("Risk Collection is created");

        // Define the enum values for action and impact
        const actionEnumValues = ["mitigate", "accept", "transfer", "avoid"];
        const impactEnumValues = ["low", "medium", "high"];

        // Create attributes
        await Promise.all([
            databases.createStringAttribute(db, riskCollection, "title", 100, true),
            databases.createStringAttribute(db, riskCollection, "content", 1000, true),
            databases.createStringAttribute(db, riskCollection, "authorId", 100, true),
            databases.createStringAttribute(db, riskCollection, "tags", 1000, true, undefined, true, true),
            databases.createStringAttribute(db, riskCollection, "attachmentId", 100, false),
            databases.createEnumAttribute(db, riskCollection, "impact", impactEnumValues, true),
            databases.createIntegerAttribute(db, riskCollection, "probability", true, 0, 5, 1),
            databases.createEnumAttribute(db, riskCollection, "action", actionEnumValues, true),
            databases.createStringAttribute(db, riskCollection, "mitigation", 1000, false),
            databases.createDatetimeAttribute(db, riskCollection, "created", true),
            databases.createDatetimeAttribute(db, riskCollection, "updated", true),
        ]);
        console.log("Risk Attributes created");

        // Create indexes for full-text search on title and content, and key indexes for dates
        await Promise.all([
            databases.createIndex(db, riskCollection, 'title', IndexType.Fulltext, ['title']),
            databases.createIndex(db, riskCollection, 'content', IndexType.Fulltext, ['content']),
            databases.createIndex(db, riskCollection, 'impact', IndexType.Key, ['impact']),
            databases.createIndex(db, riskCollection, 'probability', IndexType.Key, ['probability']),
            databases.createIndex(db, riskCollection, 'action', IndexType.Key, ['action']),
            databases.createIndex(db, riskCollection, 'mitigation', IndexType.Key, ['mitigation']),
            databases.createIndex(db, riskCollection, 'created', IndexType.Key, ['created']),
            databases.createIndex(db, riskCollection, 'updated', IndexType.Key, ['updated']),
        ]);
        console.log("Indexes created");
    } catch (error) {
        console.error("Error creating risk collection or attributes:", error);
    }
}
