import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/models/server/config"; // Import configured Appwrite SDK
import { riskAttachmentBucket } from "@/models/name";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId || typeof attachmentId !== "string") {
        return NextResponse.json({ error: "Invalid attachment ID" }, { status: 400 });
    }

    try {
        const fileUrl = storage.getFileView(riskAttachmentBucket, attachmentId); // Specify bucket ID
        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
        console.error("Error retrieving document:", error); // Log the error for debugging
        return NextResponse.json({ error: "Error retrieving document" }, { status: 500 });
    }
}
