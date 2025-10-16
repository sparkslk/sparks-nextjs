import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/patients/{id}:
 *   get:
 *     summary: Get patient details by ID
 *     description: Retrieve detailed information for a specific patient assigned to the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Patients
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     address:
 *                       type: string
 *                     emergencyContact:
 *                       type: object
 *                     medicalHistory:
 *                       type: string
 *                     age:
 *                       type: number
 *                     status:
 *                       type: string
 *                     therapySessions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a therapist
 *       404:
 *         description: Patient not found or not assigned to therapist
 *       500:
 *         description: Internal server error
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(request, ['THERAPIST']);
        const { id } = await params;
        
        console.log("Patient details request - Patient ID:", id);
        console.log("Patient details request - User ID:", session.user.id);

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

        // Get the specific patient with detailed information
        const patient = await prisma.patient.findFirst({
            where: {
                id: id,
                primaryTherapistId: user.therapistProfile.id
            },
            include: {
                user: {
                    select: {
                        image: true
                    }
                },
                therapySessions: {
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
                    orderBy: { scheduledAt: 'desc' }
                },
                primaryTherapist: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found or not assigned to your care" },
                { status: 404 }
            );
        }

        // Calculate age
        function calculateAge(dateOfBirth: Date): number {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }

        // Determine patient status
        const now = new Date();
        const recentSessions = patient.therapySessions.filter(session =>
            new Date(session.scheduledAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        const upcomingSessions = patient.therapySessions.filter(session =>
            new Date(session.scheduledAt) >= now &&
            (session.status === 'SCHEDULED' || session.status === 'APPROVED')
        );

        let status: "Active" | "Inactive" | "Completed" = "Inactive";
        if (upcomingSessions.length > 0) {
            status = "Active";
        } else if (recentSessions.length > 0) {
            status = "Active";
        } else if (patient.therapySessions.length > 0) {
            status = "Completed";
        }

        // Format the response
        const formattedPatient = {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            initials: `${patient.firstName[0]}${patient.lastName[0]}`,
            image: patient.user?.image || null,
            dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
            age: calculateAge(patient.dateOfBirth),
            gender: patient.gender,
            phone: patient.phone || "-",
            email: patient.email || "-",
            address: patient.address || "-",
            emergencyContact: patient.emergencyContact || {
                name: "-",
                phone: "-",
                relation: "-"
            },
            medicalHistory: patient.medicalHistory || "-",
            registeredDate: patient.createdAt.toISOString().split('T')[0],
            treatmentStarted: patient.therapySessions.length > 0 ? 
                patient.therapySessions[patient.therapySessions.length - 1].scheduledAt.toISOString().split('T')[0] : 
                patient.createdAt.toISOString().split('T')[0],
            status: status,
            lastSession: patient.therapySessions.length > 0 ? 
                patient.therapySessions.find(s => new Date(s.scheduledAt) < now)?.scheduledAt.toISOString().split('T')[0] || "-" : 
                "-",
            nextSession: upcomingSessions.length > 0 ? 
                upcomingSessions[0].scheduledAt.toISOString().split('T')[0] : 
                "-",
            therapySessions: patient.therapySessions.map(session => ({
                id: session.id,
                date: session.scheduledAt.toISOString().split('T')[0],
                scheduledAt: session.scheduledAt.toISOString(),
                status: session.status,
                duration: session.duration || 60,
                type: session.type,
                therapistName: (session as {therapist?: {user?: {name?: string}}}).therapist?.user?.name || "Unknown Therapist",
                // Include all clinical documentation fields from the session details API
                attendanceStatus: (session as unknown as Record<string, unknown>).attendanceStatus || null,
                overallProgress: (session as unknown as Record<string, unknown>).overallProgress || null,
                patientEngagement: (session as unknown as Record<string, unknown>).patientEngagement || null,
                riskAssessment: (session as unknown as Record<string, unknown>).riskAssessment || null,
                primaryFocusAreas: (session as unknown as Record<string, unknown>).primaryFocusAreas || "[]",
                sessionNotes: (session as unknown as Record<string, unknown>).sessionNotes || null,
                nextSessionGoals: (session as unknown as Record<string, unknown>).nextSessionGoals || null,
                // Legacy fields for compatibility
                notes: (session as unknown as Record<string, unknown>).progressNotes || (session as unknown as Record<string, unknown>).sessionNotes || "-",
                objectives: "-", // This field doesn't exist in current schema
                patientMood: "-", // This field doesn't exist in current schema
                engagement: "-", // This field doesn't exist in current schema
                progressNotes: (session as unknown as Record<string, unknown>).progressNotes || "-"
            }))
        };

        return NextResponse.json(
            { patient: formattedPatient },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching patient details:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
