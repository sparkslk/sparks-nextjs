import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        await requireApiAuth(request, ['PARENT_GUARDIAN']);
        const { patientId } = await request.json();

        if (!patientId) {
            return NextResponse.json(
                { error: "Patient ID is required" },
                { status: 400 }
            );
        }

        // Check if the patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        // Update the patient's connection status to true
        await prisma.patient.update({
            where: {
                id: patientId
            },
            data: {
                parentConnectionStatus: true
            }
        });

        return NextResponse.json({
            message: "Successfully reconnected with child"
        });

    } catch (error) {
        console.error("Error reconnecting with child:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}