import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Get all appointments for a therapist
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get therapist profile
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        // Get all therapy sessions for this therapist
        const appointments = await prisma.therapySession.findMany({
            where: {
                therapistId: therapist.id
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        });

        return NextResponse.json({
            appointments: appointments.map(session => ({
                id: session.id,
                patientName: `${session.patient.firstName} ${session.patient.lastName}`,
                scheduledAt: session.scheduledAt,
                duration: session.duration,
                type: session.type,
                status: session.status.toLowerCase(),
                notes: session.sessionNotes,
                objectives: session.nextSessionGoals,
                createdAt: session.createdAt
            }))
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapist appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointments" },
            { status: 500 }
        );
    }
}
