import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/models/client/config';
import { db, riskCollection } from '@/models/name';

// GET handler
export async function GET(request: NextRequest) {
    const { riskId } = await request.json();

    try {
        const risk = await databases.getDocument(db, riskCollection, riskId);
        return NextResponse.json(risk);
    } catch (error) {
        console.error('Error fetching risk:', error);
        return NextResponse.json(
            { error: 'Error fetching risk' },
            { status: 500 }
        );
    }
}

// PUT handler
export async function PUT(request: NextRequest) {
    const { riskId } = await request.json();

    try {
        const updatedData = await request.json();
        const updatedRisk = await databases.updateDocument(
            db,
            riskCollection,
            riskId,
            updatedData
        );
        return NextResponse.json(updatedRisk);
    } catch (error) {
        console.error('Error updating risk:', error);
        return NextResponse.json(
            { error: 'Error updating risk' },
            { status: 500 }
        );
    }
}