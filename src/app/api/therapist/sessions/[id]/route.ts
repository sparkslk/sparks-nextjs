import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const sessionId = params.id;

        // Get detailed session information
        const therapySession = await prisma.therapySession.findFirst({
            where: {
                id: sessionId,
                therapistId: user.therapistProfile.id
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        dateOfBirth: true,
                        gender: true,
                        phone: true,
                        email: true,
                        medicalHistory: true,
                        // Get patient's tasks
                        tasks: {
                            orderBy: {
                                createdAt: 'desc'
                            }
                        },
                        // Get patient's treatments (medications/prescriptions)
                        treatments: {
                            where: {
                                isActive: true
                            },
                            include: {
                                treatmentPlan: {
                                    select: {
                                        title: true,
                                        description: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        },
                        // Get patient's assessments
                        assessments: {
                            orderBy: {
                                assessmentDate: 'desc'
                            },
                            take: 5 // Get last 5 assessments
                        },
                        // Get patient's treatment plans
                        treatmentPlans: {
                            where: {
                                isActive: true
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }
                }
            }
        });

        if (!therapySession) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Get all sessions for this patient to show session history
        const sessionHistory = await prisma.therapySession.findMany({
            where: {
                patientId: therapySession.patientId,
                therapistId: user.therapistProfile.id,
                id: { not: sessionId } // Exclude current session
            },
            orderBy: {
                scheduledAt: 'desc'
            },
            take: 10, // Get last 10 sessions
            select: {
                id: true,
                scheduledAt: true,
                duration: true,
                type: true,
                status: true,
                notes: true,
                patientMood: true,
                engagement: true
            }
        });

        const detailedSession = {
            id: therapySession.id,
            patientId: therapySession.patientId,
            patientName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`,
            scheduledAt: therapySession.scheduledAt,
            duration: therapySession.duration,
            type: therapySession.type,
            status: therapySession.status,
            location: therapySession.location,
            notes: therapySession.notes,
            objectives: therapySession.objectives,
            patientMood: therapySession.patientMood,
            engagement: therapySession.engagement,
            progressNotes: therapySession.progressNotes,
            patient: {
                id: therapySession.patient.id,
                firstName: therapySession.patient.firstName,
                lastName: therapySession.patient.lastName,
                dateOfBirth: therapySession.patient.dateOfBirth,
                gender: therapySession.patient.gender,
                phone: therapySession.patient.phone,
                email: therapySession.patient.email,
                medicalHistory: therapySession.patient.medicalHistory,
                tasks: therapySession.patient.tasks,
                treatments: therapySession.patient.treatments,
                assessments: therapySession.patient.assessments,
                treatmentPlans: therapySession.patient.treatmentPlans
            },
            sessionHistory
        };

        return NextResponse.json(
            { session: detailedSession },
            { status: 200 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching session details:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
