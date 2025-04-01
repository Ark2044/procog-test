import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/client/config";
import { db, riskCollection } from "@/models/name";
import {
  handleApiError,
  createSuccessResponse,
  validateRequestBody,
} from "@/lib/apiUtils";
import { hasRiskPermission } from "@/lib/permissions";
import {
  RiskDetailValidationInput,
  validateRiskDetail,
} from "@/lib/validation";
import { useAuthStore } from "@/store/Auth";

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  try {
    const user = useAuthStore.getState().user;
    const hasPermission = await hasRiskPermission(user, params.riskId, "read");

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const risk = await databases.getDocument(db, riskCollection, params.riskId);
    return createSuccessResponse(risk);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  try {
    const user = useAuthStore.getState().user;
    const hasPermission = await hasRiskPermission(
      user,
      params.riskId,
      "update"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Unauthorized to update this risk" },
        { status: 403 }
      );
    }

    const updatedData = (await validateRequestBody(
      request
    )) as RiskDetailValidationInput;
    const validation = validateRiskDetail(updatedData);

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Add metadata
    const updatePayload = {
      ...updatedData,
      updated: new Date().toISOString(),
    };

    const updatedRisk = await databases.updateDocument(
      db,
      riskCollection,
      params.riskId,
      updatePayload
    );

    return createSuccessResponse(updatedRisk);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  try {
    const user = await useAuthStore.getState().user;
    const hasPermission = await hasRiskPermission(
      user,
      params.riskId,
      "delete"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Unauthorized to delete this risk" },
        { status: 403 }
      );
    }

    await databases.deleteDocument(db, riskCollection, params.riskId);
    return createSuccessResponse({ message: "Risk deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
