import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is a therapist
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { therapistProfile: true }
        });

        if (!user || user.role !== "THERAPIST" || !user.therapistProfile) {
            return NextResponse.json(
                { error: "Only therapists can create sessions" },
                { status: 403 }
            );
        }

        const {
            patientId,
            scheduledAt,
            duration,
            type,
            location,
            notes,
            objectives
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
                location: location || null,
                notes: notes || null,
                objectives: objectives || []
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
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is a therapist
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { therapistProfile: true }
        });

        if (!user || user.role !== "THERAPIST" || !user.therapistProfile) {
            return NextResponse.json(
                { error: "Only therapists can view sessions" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patientId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Build where clause
        const whereClause: any = {
            therapistId: user.therapistProfile.id
        };

        if (patientId) {
            whereClause.patientId = patientId;
        }

        if (startDate || endDate) {
            whereClause.scheduledAt = {};
            if (startDate) {
                whereClause.scheduledAt.gte = new Date(startDate);
            }
            if (endDate) {
                whereClause.scheduledAt.lte = new Date(endDate);
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
            patientName: `${session.patient.firstName} ${session.patient.lastName}`,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            type: session.type,
            status: session.status,
            location: session.location,
            notes: session.notes,
            objectives: session.objectives
        }));

        return NextResponse.json(
            { sessions: formattedSessions },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
