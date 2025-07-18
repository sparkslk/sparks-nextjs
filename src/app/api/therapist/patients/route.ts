import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

/**
 * @swagger
 * /api/therapist/patients:
 *   post:
 *     summary: Assign patient to therapist
 *     description: Assign a patient to the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Patients
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: ID of the patient to assign
 *                 example: "patient_123456"
 *     responses:
 *       200:
 *         description: Patient assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient assigned successfully"
 *       400:
 *         description: Bad request - missing patient ID or patient already assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not a therapist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Patient or therapist profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelation,
            medicalHistory
        } = await request.json();

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !gender) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create emergency contact object
        const emergencyContact = emergencyContactName ? {
            name: emergencyContactName,
            phone: emergencyContactPhone,
            relationship: emergencyContactRelation
        } : null;

        // Create the patient
        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender: gender as $Enums.Gender,
                phone: phone || null,
                email: email || null,
                address: address || null,
                emergencyContact: emergencyContact || undefined,
                medicalHistory: medicalHistory || null,
                primaryTherapistId: user.therapistProfile.id,
                organizationId: user.therapistProfile.organizationId
            }
        });

        return NextResponse.json(
            {
                message: "Patient created successfully",
                patient: {
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    email: patient.email
                }
            },
            { status: 201 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/therapist/patients:
 *   get:
 *     summary: Get therapist's patients
 *     description: Retrieve all patients assigned to the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Patients
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Patient ID
 *                   firstName:
 *                     type: string
 *                     description: Patient first name
 *                   lastName:
 *                     type: string
 *                     description: Patient last name
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Patient email
 *                   phone:
 *                     type: string
 *                     description: Patient phone number
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     description: Patient date of birth
 *                   gender:
 *                     type: string
 *                     description: Patient gender
 *                   therapySessions:
 *                     type: array
 *                     description: List of therapy sessions
 *                     items:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not a therapist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Therapist profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        console.log("Session user ID:", session.user.id);
        console.log("User found:", user);
        console.log("Therapist profile:", user?.therapistProfile);

        if (!user?.therapistProfile) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        // Debug: Log the therapist ID
        console.log("Therapist ID:", user.therapistProfile.id);
        
        // Get patients for this specific therapist with their therapy sessions
        const patients = await prisma.patient.findMany({
             where: {
                primaryTherapistId: user.therapistProfile.id
            },
            orderBy: {
                lastName: 'asc' // Order by last name alphabetically
            },
            include: {
                user: {
                    select: {
                        image: true
                    }
                },
                therapySessions: {
                    orderBy: { scheduledAt: 'desc' },
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        duration: true,
                        type: true
                    }
                }
            }
        });

        // Debug: Log the number of patients found
        console.log("Number of patients found:", patients.length);

        // Enhanced formatting with proper session handling
        const formattedPatients = patients.map(patient => {
            const allSessions = patient.therapySessions || [];
            const now = new Date();
            
            // Filter sessions based on scheduled time and status
            const completedSessions = allSessions.filter(session => 
                (new Date(session.scheduledAt) < now && 
                 (session.status === 'COMPLETED' || session.status === 'SCHEDULED')) ||
                session.status === 'COMPLETED'
            );
            
            const upcomingSessions = allSessions.filter(session => 
                new Date(session.scheduledAt) >= now && 
                (session.status === 'SCHEDULED' || session.status === 'APPROVED')
            );
            
            // Get the most recent completed session and next upcoming session
            const lastSession = completedSessions.length > 0 ? completedSessions[0] : null;
            const nextSession = upcomingSessions.length > 0 ? 
                upcomingSessions.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] : null;

            // Determine patient status based on session activity
            let status: "active" | "inactive" | "completed" = "inactive";
            if (nextSession) {
                status = "active";
            } else if (lastSession && new Date(lastSession.scheduledAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
                status = "active"; // Had a session within last 30 days
            } else if (completedSessions.length > 0) {
                status = "completed";
            }

            return {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
                gender: patient.gender,
                phone: patient.phone || "-",
                email: patient.email || "-",
                image: patient.user?.image || null,
                lastSession: lastSession ? lastSession.scheduledAt.toISOString().split('T')[0] : "-",
                nextSession: nextSession ? nextSession.scheduledAt.toISOString().split('T')[0] : "-",
                status: status,
                age: calculateAge(patient.dateOfBirth),
                totalSessions: allSessions.length,
                completedSessions: completedSessions.length,
                upcomingSessions: upcomingSessions.length
            };
        });

        return NextResponse.json(
            { 
                patients: formattedPatients,
                totalCount: formattedPatients.length,
                therapistId: user.therapistProfile.id
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

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
