import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['THERAPIST']);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        if (!user?.therapistProfile) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        const {
            patientId,
            scheduledAt,
            duration,
            type,
            sessionNotes,
            primaryFocusAreas
        } = await request.json();

        // Validate required fields
        if (!patientId || !scheduledAt || !duration) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify the patient belongs to this therapist
        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                primaryTherapistId: user.therapistProfile.id
            }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found or not assigned to this therapist" },
                { status: 404 }
            );
        }

        // Create the therapy session
        const therapySession = await prisma.therapySession.create({
            data: {
                patientId,
                therapistId: user.therapistProfile.id,
                scheduledAt: new Date(scheduledAt),
                duration,
                type: type || "individual",
                sessionNotes: sessionNotes || null,
                primaryFocusAreas: primaryFocusAreas || []
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return NextResponse.json(
            {
                message: "Session scheduled successfully",
                session: {
                    id: therapySession.id,
                    patientName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`,
                    scheduledAt: therapySession.scheduledAt,
                    duration: therapySession.duration,
                    type: therapySession.type
                }
            },
            { status: 201 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['THERAPIST']);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        if (!user?.therapistProfile) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patientId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Build where clause
        const whereClause: Record<string, unknown> = {
            therapistId: user.therapistProfile.id
        };

        if (patientId) {
            whereClause.patientId = patientId;
        }

        if (startDate || endDate) {
            whereClause.scheduledAt = {};
            if (startDate) {
                (whereClause.scheduledAt as Record<string, unknown>).gte = new Date(startDate);
            }
            if (endDate) {
                (whereClause.scheduledAt as Record<string, unknown>).lte = new Date(endDate);
            }
        }

        // Get therapy sessions for this therapist
        const sessions = await prisma.therapySession.findMany({
            where: whereClause,
            orderBy: {
                scheduledAt: 'asc'
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        const formattedSessions = sessions.map(session => ({
            id: session.id,
            patientId: session.patientId,
            patientName: `${session.patient.firstName} ${session.patient.lastName}`,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            type: session.type,
            status: session.status,
            meetingLink: session.meetingLink, // Include the meeting link
            // Include all clinical documentation fields
            attendanceStatus: session.attendanceStatus,
            overallProgress: session.overallProgress,
            patientEngagement: session.patientEngagement,
            riskAssessment: session.riskAssessment,
            primaryFocusAreas: session.primaryFocusAreas,
            sessionNotes: session.sessionNotes,
            nextSessionGoals: session.nextSessionGoals
        }));

        return NextResponse.json(
            { sessions: formattedSessions },
            { status: 200 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
