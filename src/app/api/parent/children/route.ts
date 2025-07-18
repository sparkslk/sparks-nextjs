import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

/**
 * @swagger
 * /api/parent/children:
 *   get:
 *     summary: Get parent's children
 *     description: Retrieve all children associated with the authenticated parent/guardian
 *     tags:
 *       - Parent
 *       - Children
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Children retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 children:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       dateOfBirth:
 *                         type: string
 *                         format: date
 *                       relationship:
 *                         type: string
 *                       isPrimary:
 *                         type: boolean
 *                       upcomingSessions:
 *                         type: number
 *                       lastSession:
 *                         type: string
 *                         nullable: true
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['PARENT_GUARDIAN']);

        // Get all children that this parent/guardian is responsible for
        const parentGuardianRelations = await prisma.parentGuardian.findMany({
            where: { userId: session.user.id },
            include: {
                patient: {
                    include: {
                        therapySessions: {
                            where: {
                                scheduledAt: {
                                    gte: new Date()
                                }
                            },
                            orderBy: { scheduledAt: 'desc' }
                        },
                        primaryTherapist: {
                            select: {
                                id: true,
                                userId: true,
                                organizationId: true,
                                specialization: true,
                                licenseNumber: true,
                                experience: true,
                                bio: true,
                                availability: true,
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Use a single 'now' variable for the whole function
        const now = new Date();

        const children = await Promise.all(
            parentGuardianRelations.map(async (relation) => {
                // Calculate progress percentage as tasks completed for the current month
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                const allTasksThisMonth = await prisma.task.findMany({
                    where: {
                        patientId: relation.patient.id,
                        dueDate: {
                            gte: startOfMonth,
                            lte: endOfMonth
                        }
                    }
                });
                const completedTasksThisMonth = allTasksThisMonth.filter(task => task.status === 'COMPLETED');
                const progressPercentage = allTasksThisMonth.length > 0 ? Math.round((completedTasksThisMonth.length / allTasksThisMonth.length) * 100) : 0;

                // Fetch patient user image if userId exists
                let patientImage = null;
                if (relation.patient.userId) {
                    const patientUser = await prisma.user.findUnique({
                        where: { id: relation.patient.userId },
                        select: { image: true }
                    });
                    patientImage = patientUser?.image || null;
                }

                return {
                    id: relation.patient.id,
                    firstName: relation.patient.firstName,
                    lastName: relation.patient.lastName,
                    dateOfBirth: relation.patient.dateOfBirth,
                    gender: relation.patient.gender,
                    email: relation.patient.email,
                    relationship: relation.relationship,
                    isPrimary: relation.isPrimary,
                    upcomingSessions: relation.patient.therapySessions.length,
                    lastSession: relation.patient.therapySessions[0]?.scheduledAt
  ? (() => {
      const d = new Date(relation.patient.therapySessions[0].scheduledAt);
      const utc = new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
      );
      return utc.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Colombo'
      });
    })()
  : null,
                    nextSessionId: relation.patient.therapySessions[0]?.id || null,
                    nextSessionType: relation.patient.therapySessions[0]?.type || null,
                    nextSessionStatus: relation.patient.therapySessions[0]?.status || null,
                    therapist: relation.patient.primaryTherapist ? {
                        id: relation.patient.primaryTherapist.id,
                        userId: relation.patient.primaryTherapist.userId,
                        name: relation.patient.primaryTherapist.user.name,
                        email: relation.patient.primaryTherapist.user.email,
                        specialization: relation.patient.primaryTherapist.specialization,
                        licenseNumber: relation.patient.primaryTherapist.licenseNumber,
                        experience: relation.patient.primaryTherapist.experience || 0,
                        bio: relation.patient.primaryTherapist.bio,
                        rating: 4.5, // Default rating since not in schema
                        availability: relation.patient.primaryTherapist.availability,
                        organizationId: relation.patient.primaryTherapist.organizationId
                    } : null,
                    progressPercentage,
                    image: patientImage
                };
            })
        );

        return NextResponse.json({ children });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching children:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/parent/children:
 *   post:
 *     summary: Add a new child
 *     description: Create a new patient record and associate it with the authenticated parent/guardian
 *     tags:
 *       - Parent
 *       - Children
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
 *               - dateOfBirth
 *               - gender
 *               - relationship
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]
 *
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               relationship:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *               emergencyContact:
 *                 type: object
 *               medicalHistory:
 *                 type: string
 */
export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['PARENT_GUARDIAN']);

        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            email,
            address,
            relationship,
            isPrimary = false,
            emergencyContact,
            medicalHistory
        } = await request.json();

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !relationship) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate gender enum
        if (!Object.values($Enums.Gender).includes(gender)) {
            return NextResponse.json(
                { error: "Invalid gender value" },
                { status: 400 }
            );
        }

        // Create a User record for the child if email is provided
        let childUser = null;
        if (email) {
            // Check if user already exists
            childUser = await prisma.user.findUnique({ where: { email } });
            if (!childUser) {
                childUser = await prisma.user.create({
                    data: {
                        email,
                        name: `${firstName} ${lastName}`.trim(),
                        role: "NORMAL_USER"
                    }
                });
            }
        }

        // Create the patient record
        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender: gender as $Enums.Gender,
                email: email || null,
                address: address || null,
                emergencyContact: emergencyContact || undefined,
                medicalHistory: medicalHistory || null,
                // Link to user if created
                ...(childUser ? { userId: childUser.id } : {}),
                // Note: primaryTherapistId will be set later when a therapist is assigned
            }
        });

        // Create the parent-guardian relationship
        const parentGuardianRelation = await prisma.parentGuardian.create({
            data: {
                userId: session.user.id,
                patientId: patient.id,
                relationship,
                isPrimary,
                canMakeDecisions: true // Default to true for parents
            }
        });

        return NextResponse.json({
            message: "Child added successfully",
            child: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth,
                relationship: parentGuardianRelation.relationship,
                isPrimary: parentGuardianRelation.isPrimary
            }
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error adding child:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
