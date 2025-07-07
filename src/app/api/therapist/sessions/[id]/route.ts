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
            // Clinical documentation fields from the schema (using type assertion for now)
            attendanceStatus: (therapySession as any).attendanceStatus,
            overallProgress: (therapySession as any).overallProgress,
            patientEngagement: (therapySession as any).patientEngagement,
            riskAssessment: (therapySession as any).riskAssessment,
            primaryFocusAreas: (therapySession as any).primaryFocusAreas,
            sessionNotes: (therapySession as any).sessionNotes,
            nextSessionGoals: (therapySession as any).nextSessionGoals,
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

export async function PUT(
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

        // Verify the session belongs to this therapist
        const existingSession = await prisma.therapySession.findFirst({
            where: {
                id: sessionId,
                therapistId: user.therapistProfile.id
            }
        });

        if (!existingSession) {
            return NextResponse.json(
                { error: "Session not found or not authorized" },
                { status: 404 }
            );
        }

        const {
            attendanceStatus,
            overallProgress,
            patientEngagement,
            riskAssessment,
            focusAreas,
            sessionNotes,
            nextSessionGoals,
            saveOnly
        } = await request.json();

        // Update the therapy session with new documentation
        const updatedSession = await prisma.therapySession.update({
            where: { id: sessionId },
            data: {
                // Clinical documentation fields
                ...(attendanceStatus && { attendanceStatus: attendanceStatus as any }),
                ...(overallProgress && { overallProgress: overallProgress as any }),
                ...(patientEngagement && { patientEngagement: patientEngagement as any }),
                ...(riskAssessment && { riskAssessment: riskAssessment as any }),
                primaryFocusAreas: focusAreas || [],
                ...(sessionNotes && { sessionNotes: sessionNotes }),
                ...(nextSessionGoals && { nextSessionGoals: nextSessionGoals }),
                // Only update status if not saving only
                ...(!saveOnly && {
                    // Update status based on attendance if needed
                    ...(attendanceStatus === "NO_SHOW" && { status: "NO_SHOW" }),
                    ...(attendanceStatus === "CANCELLED" && { status: "CANCELLED" }),
                    // Mark as completed if session is documented and attendance was present or late
                    ...((attendanceStatus === "PRESENT" || attendanceStatus === "LATE") && { status: "COMPLETED" })
                }),
                updatedAt: new Date()
            }
        });

        // Create a session assessment record for clinical documentation
        await prisma.assessment.create({
            data: {
                patientId: existingSession.patientId,
                therapistId: user.therapistProfile.id,
                assessmentDate: new Date(),
                type: "PROGRESS",
                title: "Session Documentation",
                description: `Session documentation from ${new Date().toLocaleDateString()}`,
                // Store clinical assessment data as JSON in questions field
                questions: JSON.stringify({
                    attendanceStatus,
                    overallProgress,
                    patientEngagement,
                    riskAssessment,
                    focusAreas,
                    sessionNotes,
                    nextSessionGoals,
                    sessionId: sessionId
                }),
                // Store responses as empty for this type of assessment
                responses: JSON.stringify({
                    documented: true,
                    documentedAt: new Date().toISOString()
                })
            }
        });

        // Get updated session with patient info for response
        const sessionWithPatient = await prisma.therapySession.findUnique({
            where: { id: sessionId },
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
                message: saveOnly ? "Session documentation saved successfully" : "Session documented and marked as completed",
                session: {
                    id: sessionWithPatient!.id,
                    patientName: `${sessionWithPatient!.patient.firstName} ${sessionWithPatient!.patient.lastName}`,
                    scheduledAt: sessionWithPatient!.scheduledAt,
                    status: sessionWithPatient!.status,
                    // Include clinical documentation fields in response
                    attendanceStatus: (sessionWithPatient as any).attendanceStatus,
                    overallProgress: (sessionWithPatient as any).overallProgress,
                    patientEngagement: (sessionWithPatient as any).patientEngagement,
                    riskAssessment: (sessionWithPatient as any).riskAssessment,
                    primaryFocusAreas: (sessionWithPatient as any).primaryFocusAreas,
                    sessionNotes: (sessionWithPatient as any).sessionNotes,
                    nextSessionGoals: (sessionWithPatient as any).nextSessionGoals
                }
            },
            { status: 200 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
