import { NextRequest, NextResponse } from "next/server";
import { storage, databases, users } from "@/models/server/config";
import { db, riskCollection } from "@/models/name";
import { validateString } from "@/lib/validation";
import { handleApiError, validateRequestBody } from "@/lib/apiUtils";
import { hasRiskPermission } from "@/lib/permissions";
import { sendRiskNotification } from "@/utils/emailService";
import { Risk } from "@/types/Risk";

export async function GET(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  const { riskId } = params;

  if (!riskId) {
    return NextResponse.json({ error: "Risk ID is required" }, { status: 400 });
  }

  try {
    const risk = await databases.getDocument(db, riskCollection, riskId);
    return NextResponse.json(risk);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  const { riskId } = params;

  if (!riskId) {
    return NextResponse.json({ error: "Risk ID is required" }, { status: 400 });
  }

  try {
    const body = await validateRequestBody(request);

    // Enhanced validation using validateString for title and content
    if (body.title !== undefined) {
      const titleValidation = validateString(body.title as string, "Title", {
        required: true,
        minLength: 3,
        maxLength: 100,
      });

      if (!titleValidation.isValid) {
        return NextResponse.json(
          { error: titleValidation.error },
          { status: 400 }
        );
      }
    }

    if (body.content !== undefined) {
      const contentValidation = validateString(
        body.content as string,
        "Content",
        {
          required: true,
          minLength: 10,
          maxLength: 1000,
        }
      );

      if (!contentValidation.isValid) {
        return NextResponse.json(
          { error: contentValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate mandatory fields when closing a risk
    if (
      body.status === "closed" &&
      (!body.resolution || (body.resolution as string).trim() === "")
    ) {
      return NextResponse.json(
        { error: "Resolution is required when closing a risk" },
        { status: 400 }
      );
    }

    // Action-specific validation
    if (body.action) {
      switch (body.action) {
        case "mitigate":
          if (!body.mitigation || (body.mitigation as string).trim() === "") {
            return NextResponse.json(
              { error: "Mitigation strategy is required for mitigate action" },
              { status: 400 }
            );
          }
          break;
        case "accept":
          if (!body.acceptance || (body.acceptance as string).trim() === "") {
            return NextResponse.json(
              { error: "Acceptance rationale is required for accept action" },
              { status: 400 }
            );
          }
          break;
        case "transfer":
          if (!body.transfer || (body.transfer as string).trim() === "") {
            return NextResponse.json(
              { error: "Transfer strategy is required for transfer action" },
              { status: 400 }
            );
          }
          break;
        case "avoid":
          if (!body.avoidance || (body.avoidance as string).trim() === "") {
            return NextResponse.json(
              { error: "Avoidance strategy is required for avoid action" },
              { status: 400 }
            );
          }
          break;
      }
    }

    // Permission check
    if (body.userId) {
      try {
        // Get the user from the database
        const userObj = await users.get(body.userId as string);

        // Add required UserPrefs properties
        const userWithPrefs = {
          ...userObj,
          prefs: {
            ...userObj.prefs,
            role: userObj.prefs?.role || "user",
            department: userObj.prefs?.department || "",
            reputation: userObj.prefs?.reputation || 0,
          },
        };

        const hasPermission = await hasRiskPermission(
          userWithPrefs,
          riskId,
          "update"
        );
        if (!hasPermission) {
          return NextResponse.json(
            { error: "Permission denied" },
            { status: 403 }
          );
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        return NextResponse.json(
          { error: "Failed to validate permissions" },
          { status: 500 }
        );
      }
    }

    // Check if a notification should be sent
    const originalRisk = await databases.getDocument(
      db,
      riskCollection,
      riskId
    );
    const statusChanged = body.status && body.status !== originalRisk.status;
    const isClosingRisk =
      body.status === "closed" && originalRisk.status !== "closed";

    // Prepare update data with trimmed values
    const updateData = {
      ...body,
      title: body.title ? (body.title as string).trim() : undefined,
      content: body.content ? (body.content as string).trim() : undefined,
      mitigation: body.mitigation
        ? (body.mitigation as string).trim()
        : undefined,
      acceptance: body.acceptance
        ? (body.acceptance as string).trim()
        : undefined,
      transfer: body.transfer ? (body.transfer as string).trim() : undefined,
      avoidance: body.avoidance ? (body.avoidance as string).trim() : undefined,
      resolution: body.resolution
        ? (body.resolution as string).trim()
        : undefined,
      updated: new Date().toISOString(),
    };

    // Update the risk
    const updatedRisk = await databases.updateDocument(
      db,
      riskCollection,
      riskId,
      updateData
    );

    // Convert Document to Risk type for sendRiskNotification
    const riskData: Risk = {
      $id: updatedRisk.$id,
      title: updatedRisk.title,
      content: updatedRisk.content,
      authorId: updatedRisk.authorId,
      authorName: updatedRisk.authorName,
      tags: updatedRisk.tags || [],
      impact: updatedRisk.impact,
      probability: updatedRisk.probability,
      action: updatedRisk.action,
      mitigation: updatedRisk.mitigation || "",
      acceptance: updatedRisk.acceptance,
      transfer: updatedRisk.transfer,
      avoidance: updatedRisk.avoidance,
      department: updatedRisk.department,
      isConfidential: updatedRisk.isConfidential,
      authorizedViewers: updatedRisk.authorizedViewers || [],
      created: updatedRisk.created,
      updated: updatedRisk.updated,
      status: updatedRisk.status,
      resolution: updatedRisk.resolution,
      dueDate: updatedRisk.dueDate,
      attachmentId: updatedRisk.attachmentId,
    };

    // Send notification if status changed
    if (statusChanged) {
      if (isClosingRisk) {
        await sendRiskNotification(riskData, "closed");
      } else {
        await sendRiskNotification(riskData, "updated");
      }
    }

    return NextResponse.json(updatedRisk);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  const { riskId } = params;

  if (!riskId) {
    return NextResponse.json({ error: "Risk ID is required" }, { status: 400 });
  }

  try {
    // Get risk details to check for attachments
    const risk = await databases.getDocument(db, riskCollection, riskId);

    // Delete the risk document
    await databases.deleteDocument(db, riskCollection, riskId);

    // Delete associated attachment if it exists
    if (risk.attachmentId) {
      try {
        await storage.deleteFile(db, risk.attachmentId);
      } catch (error) {
        console.error("Failed to delete attachment:", error);
        // Continue execution even if attachment deletion fails
      }
    }

    return NextResponse.json(
      { message: "Risk deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
