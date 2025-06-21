import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Get all session requests for a patient
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);

        // Get patient profile
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient profile not found" },
                { status: 404 }
            );
        }

        // Get all session requests for this patient
        const sessionRequests = await prisma.therapySession.findMany({
            where: {
                patientId: patient.id
            },
            include: {
                therapist: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            requests: sessionRequests.map(request => ({
                id: request.id,
                therapist: {
                    name: request.therapist.user.name || request.therapist.user.email,
                    email: request.therapist.user.email,
                    specialization: request.therapist.specialization
                },
                scheduledAt: request.scheduledAt,
                duration: request.duration,
                type: request.type,
                status: request.status,
                notes: request.notes,
                createdAt: request.createdAt
            }))
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching session requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch session requests" },
            { status: 500 }
        );
    }
}
