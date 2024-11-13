import { Permission } from "node-appwrite";
import { riskAttachmentBucket } from "../name";
import { storage } from "./config";

export default async function getOrCreateStorage() {
    try {
        await storage.getBucket(riskAttachmentBucket);
        console.log("Storage Connected");
    } catch {
        try {
            await storage.createBucket(
                riskAttachmentBucket,
                riskAttachmentBucket,
                [
                    Permission.create("users"),
                    Permission.read("any"),
                    Permission.read("users"),
                    Permission.update("users"),
                    Permission.delete("users"),
                ],
                false,
                undefined,
                undefined,
                ["jpg", "png", "gif", "jpeg", "webp", "heic"]
            );

            console.log("Storage Created");
            console.log("Storage Connected");
        } catch (error) {
            console.error("Error creating storage:", error);
        }
    }
}