import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags:
 *       - Profile
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Patient ID
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: User's full name
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address
 *                 primaryTherapist:
 *                   type: object
 *                   nullable: true
 *                   description: Assigned primary therapist
 *                 therapySessions:
 *                   type: array
 *                   description: List of therapy sessions
 *                   items:
 *                     type: object
 *                 treatmentPlans:
 *                   type: array
 *                   description: List of treatment plans
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profile not found
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
        const session = await requireApiAuth(req);

        // Handle different user roles appropriately
        const userRole = session.user.role;

        // For NORMAL_USER, check for patient profile
        if (userRole === 'NORMAL_USER') {
            // Get patient profile with sessions and treatment plans
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    primaryTherapist: {
                        include: {
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    therapySessions: {
                        include: {
                            therapist: {
                                include: {
                                    user: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        },
                        orderBy: {
                            scheduledAt: 'desc'
                        }
                    },
                    treatmentPlans: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });

            if (!patient) {
                return NextResponse.json({ profile: null });
            }

            // Process sessions data
            const now = new Date();
            const upcomingSessions = patient.therapySessions
                .filter(session => new Date(session.scheduledAt) >= now && session.status === 'SCHEDULED')
                .map(session => ({
                    id: session.id,
                    scheduledAt: session.scheduledAt.toISOString(),
                    duration: session.duration,
                    type: session.type,
                    status: session.status,
                    therapistName: session.therapist.user.name || 'Unknown Therapist',
                    sessionNotes: session.sessionNotes,
                    sessionType: session.sessionType,
                    meetingLink: session.meetingLink
                }));

            const recentSessions = patient.therapySessions
                .filter(session => new Date(session.scheduledAt) < now || session.status !== 'SCHEDULED')
                .slice(0, 10) // Limit to 10 most recent
                .map(session => ({
                    id: session.id,
                    scheduledAt: session.scheduledAt.toISOString(),
                    duration: session.duration,
                    type: session.type,
                    status: session.status,
                    therapistName: session.therapist.user.name || 'Unknown Therapist',
                    sessionNotes: session.sessionNotes,
                    sessionType: session.sessionType,
                    meetingLink: session.meetingLink
                }));

            return NextResponse.json({
                profile: {
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    phone: patient.phone,
                    email: patient.email,
                    address: patient.address,
                    dateOfBirth: patient.dateOfBirth,
                    gender: patient.gender,
                    emergencyContact: patient.emergencyContact,
                    medicalHistory: patient.medicalHistory,
                    therapist: patient.primaryTherapist ? {
                        id: patient.primaryTherapist.id,
                        name: patient.primaryTherapist.user.name,
                        specialization: patient.primaryTherapist.specialization
                    } : null,
                    upcomingSessions,
                    recentSessions,
                    treatmentPlans: patient.treatmentPlans.map(plan => ({
                        id: plan.id,
                        title: plan.title,
                        goals: plan.goals,
                        startDate: plan.startDate.toISOString(),
                        isActive: plan.isActive
                    }))
                }
            });
        }

        // For PARENT_GUARDIAN, check for parent-guardian relationships
        if (userRole === 'PARENT_GUARDIAN') {
            const parentGuardianRelations = await prisma.parentGuardian.findMany({
                where: { userId: session.user.id },
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });

            // Parent profile exists if they have any children registered
            return NextResponse.json({
                profile: {
                    id: session.user.id,
                    userType: 'PARENT_GUARDIAN',
                    children: parentGuardianRelations.map(relation => ({
                        id: relation.patient.id,
                        firstName: relation.patient.firstName,
                        lastName: relation.patient.lastName,
                        relationship: relation.relationship,
                        isPrimary: relation.isPrimary
                    })),
                    hasProfile: parentGuardianRelations.length > 0
                }
            });
        }

        // For THERAPIST, check for therapist profile
        if (userRole === 'THERAPIST') {
            const therapist = await prisma.therapist.findUnique({
                where: { userId: session.user.id },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!therapist) {
                return NextResponse.json({ profile: null });
            }

            return NextResponse.json({
                profile: {
                    id: therapist.id,
                    userType: 'THERAPIST',
                    licenseNumber: therapist.licenseNumber,
                    specialization: therapist.specialization,
                    hasProfile: true
                }
            });
        }

        // For other roles (MANAGER, ADMIN), return basic profile info
        return NextResponse.json({
            profile: {
                id: session.user.id,
                userType: userRole,
                hasProfile: true // These roles don't need additional profiles
            }
        });

    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create user profile
 *     description: Create a patient profile for the authenticated user
 *     tags:
 *       - Profile
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *               - email
 *               - dateOfBirth
 *               - gender
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Last name
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john.doe@example.com"
 *               address:
 *                 type: string
 *                 description: Home address
 *                 example: "123 Main St, City, State"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]
 *                 description: Gender
 *                 example: "MALE"
 *               emergencyContact:
 *                 type: object
 *                 description: Emergency contact information
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   relationship:
 *                     type: string
 *                     example: "Spouse"
 *                   phone:
 *                     type: string
 *                     example: "+1234567891"
 *               medicalHistory:
 *                 type: object
 *                 description: Medical history information
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile created successfully"
 *                 profileId:
 *                   type: string
 *                   example: "profile_123456"
 *       400:
 *         description: Bad request - missing or invalid fields
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
 *       409:
 *         description: Conflict - profile already exists
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
        const session = await requireApiAuth(request);

        const data = await request.json();
        console.log("Profile creation data received:", data);

        const {
            firstName,
            lastName,
            phone,
            email,
            address,
            dateOfBirth,
            gender,
            emergencyContact,
            medicalHistory
        } = data;

        // Check if patient profile already exists
        const existingPatient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (existingPatient) {
            return NextResponse.json(
                { error: "Profile already exists" },
                { status: 400 }
            );
        }

        // Create patient profile
        const patient = await prisma.patient.create({
            data: {
                userId: session.user.id,
                firstName,
                lastName,
                phone,
                email,
                address,
                dateOfBirth: new Date(dateOfBirth),
                gender: gender || "OTHER",
                emergencyContact: emergencyContact || undefined,
                medicalHistory
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            message: "Profile created successfully",
            profile: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phone: patient.phone,
                email: patient.email,
                address: patient.address,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                emergencyContact: patient.emergencyContact,
                medicalHistory: patient.medicalHistory
            }
        });
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating patient profile:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}
