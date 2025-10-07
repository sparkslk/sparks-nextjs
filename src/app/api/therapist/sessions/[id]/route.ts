import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log("GET /api/therapist/sessions/[id] - Starting request for session ID:", id);
        
        const session = await requireApiAuth(request, ['THERAPIST']);
        console.log("Authentication successful for user:", session.user.id);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        if (!user?.therapistProfile) {
            console.log("Therapist profile not found for user:", session.user.id);
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        console.log("Therapist profile found:", user.therapistProfile.id);
        const sessionId = id;

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
            take: 10 // Get last 10 sessions
        });

        const detailedSession = {
            id: therapySession.id,
            patientId: therapySession.patientId,
            patientName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`,
            scheduledAt: therapySession.scheduledAt,
            duration: therapySession.duration,
            type: therapySession.type,
            status: therapySession.status,
            // Clinical documentation fields from the database - use raw query to get actual values
            attendanceStatus: (therapySession as unknown as Record<string, unknown>).attendanceStatus || null,
            overallProgress: (therapySession as unknown as Record<string, unknown>).overallProgress || null,
            patientEngagement: (therapySession as unknown as Record<string, unknown>).patientEngagement || null,
            riskAssessment: (therapySession as unknown as Record<string, unknown>).riskAssessment || null,
            primaryFocusAreas: (therapySession as unknown as Record<string, unknown>).primaryFocusAreas || [],
            sessionNotes: (therapySession as unknown as Record<string, unknown>).sessionNotes || null,
            nextSessionGoals: (therapySession as unknown as Record<string, unknown>).nextSessionGoals || null,
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
            sessionHistory: sessionHistory.map(session => ({
                id: session.id,
                scheduledAt: session.scheduledAt,
                duration: session.duration,
                type: session.type,
                status: session.status,
                attendanceStatus: (session as unknown as Record<string, unknown>).attendanceStatus,
                overallProgress: (session as unknown as Record<string, unknown>).overallProgress,
                patientEngagement: (session as unknown as Record<string, unknown>).patientEngagement,
                riskAssessment: (session as unknown as Record<string, unknown>).riskAssessment,
                primaryFocusAreas: (session as unknown as Record<string, unknown>).primaryFocusAreas,
                sessionNotes: (session as unknown as Record<string, unknown>).sessionNotes,
                nextSessionGoals: (session as unknown as Record<string, unknown>).nextSessionGoals
            }))
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
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;
        const sessionId = id;

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

        console.log("Received update data:", {
            attendanceStatus,
            overallProgress,
            patientEngagement,
            riskAssessment,
            focusAreas,
            sessionNotes,
            nextSessionGoals,
            saveOnly
        });

        // Validate enum values
        const validAttendanceStatus = ['PRESENT', 'LATE', 'NO_SHOW', 'CANCELLED'];
        const validProgressLevels = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CONCERNING'];
        const validEngagementLevels = ['HIGH', 'MEDIUM', 'LOW', 'RESISTANT'];
        const validRiskLevels = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];

        if (!validAttendanceStatus.includes(attendanceStatus)) {
            return NextResponse.json(
                { error: `Invalid attendance status: ${attendanceStatus}` },
                { status: 400 }
            );
        }

        if (overallProgress && !validProgressLevels.includes(overallProgress)) {
            return NextResponse.json(
                { error: `Invalid progress level: ${overallProgress}` },
                { status: 400 }
            );
        }

        if (patientEngagement && !validEngagementLevels.includes(patientEngagement)) {
            return NextResponse.json(
                { error: `Invalid engagement level: ${patientEngagement}` },
                { status: 400 }
            );
        }

        if (riskAssessment && !validRiskLevels.includes(riskAssessment)) {
            return NextResponse.json(
                { error: `Invalid risk level: ${riskAssessment}` },
                { status: 400 }
            );
        }

        // Determine session status based on attendance and save mode
        let newStatus = existingSession.status;
        if (attendanceStatus === "NO_SHOW") {
            newStatus = "NO_SHOW";
        } else if (attendanceStatus === "CANCELLED") {
            newStatus = "CANCELLED";
        } else if ((attendanceStatus === "PRESENT" || attendanceStatus === "LATE") && !saveOnly) {
            newStatus = "COMPLETED";
        }

        // Update the therapy session with new documentation using Prisma's safer update method
        console.log("About to update session with data:", {
            attendanceStatus: attendanceStatus || null,
            overallProgress: overallProgress || null,
            patientEngagement: patientEngagement || null,
            riskAssessment: riskAssessment || null,
            primaryFocusAreas: focusAreas || [],
            sessionNotes: sessionNotes || null,
            nextSessionGoals: nextSessionGoals || null,
            status: newStatus
        });
        
        await prisma.therapySession.update({
            where: { id: sessionId },
            data: {
                attendanceStatus: attendanceStatus || null,
                overallProgress: overallProgress || null,
                patientEngagement: patientEngagement || null,
                riskAssessment: riskAssessment || null,
                primaryFocusAreas: focusAreas || [],
                sessionNotes: sessionNotes || null,
                nextSessionGoals: nextSessionGoals || null,
                status: newStatus,
                updatedAt: new Date()
            }
        });

        console.log("Session updated successfully with ID:", sessionId);

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

        // After updating session status to COMPLETED:
        if (newStatus === "COMPLETED") {
            // Fetch patient and parent/guardian info
            const completedSessionWithPatient = await prisma.therapySession.findUnique({
                where: { id: sessionId },
                include: {
                    patient: {
                        include: {
                            user: { select: { id: true, name: true } }
                        }
                    }
                }
            });

            const patientUserId = completedSessionWithPatient?.patient?.user?.id;
            const patientName = completedSessionWithPatient?.patient?.user?.name || 
                               `${completedSessionWithPatient?.patient?.firstName} ${completedSessionWithPatient?.patient?.lastName}`;
            const therapistUserId = user.id;

            // Find parent/guardian user
            const parentGuardian = await prisma.parentGuardian.findFirst({
                where: { patientId: completedSessionWithPatient?.patientId },
                include: { user: { select: { id: true, name: true } } }
            });

            // Notification message
            const notificationTitle = "Session Completed";
            const patientNotificationMessage = `Your session with ${user.name || "your therapist"} has been marked as completed. You can now view the session summary and feedback.`;
            const parentNotificationMessage = `Session for ${patientName} has been marked as completed by ${user.name || "the therapist"}. You can now view the session summary and feedback.`;

            // Send notification to patient
            if (patientUserId) {
                await prisma.notification.create({
                    data: {
                        senderId: therapistUserId,
                        receiverId: patientUserId,
                        type: "SYSTEM",
                        title: notificationTitle,
                        message: patientNotificationMessage,
                        isRead: false,
                        isUrgent: false
                    }
                });
            }

            // Send notification to parent/guardian
            if (parentGuardian?.user?.id) {
                await prisma.notification.create({
                    data: {
                        senderId: therapistUserId,
                        receiverId: parentGuardian.user.id,
                        type: "SYSTEM",
                        title: notificationTitle,
                        message: parentNotificationMessage,
                        isRead: false,
                        isUrgent: false
                    }
                });
            }
        }

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

        if (!sessionWithPatient) {
            return NextResponse.json(
                { error: "Session not found after update" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Session documentation saved successfully",
                session: {
                    id: sessionWithPatient.id,
                    patientName: `${sessionWithPatient.patient.firstName} ${sessionWithPatient.patient.lastName}`,
                    scheduledAt: sessionWithPatient.scheduledAt,
                    status: sessionWithPatient.status
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
        
        // More detailed error logging
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        
        // Return more specific error message if possible
        let errorMessage = "Internal server error";
        if (error instanceof Error) {
            if (error.message.includes("invalid input syntax")) {
                errorMessage = "Invalid data format provided";
            } else if (error.message.includes("column") && error.message.includes("does not exist")) {
                errorMessage = "Database schema mismatch - please contact administrator";
            } else if (error.message.includes("foreign key constraint")) {
                errorMessage = "Invalid session or therapist reference";
            }
        }
        
        return NextResponse.json(
            { error: errorMessage, details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
            
