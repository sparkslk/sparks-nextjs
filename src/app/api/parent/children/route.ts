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
                }
            }
        });

        const children = parentGuardianRelations.map(relation => ({
            id: relation.patient.id,
            firstName: relation.patient.firstName,
            lastName: relation.patient.lastName,
            dateOfBirth: relation.patient.dateOfBirth,
            gender: relation.patient.gender,
            phone: relation.patient.phone,
            email: relation.patient.email,
            relationship: relation.relationship,
            isPrimary: relation.isPrimary,
            upcomingSessions: relation.patient.therapySessions.length,
            lastSession: relation.patient.therapySessions[0]?.scheduledAt || null,
            therapist: relation.patient.primaryTherapist ? {
                name: relation.patient.primaryTherapist.user.name,
                email: relation.patient.primaryTherapist.user.email
            } : null
        }));

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
 *               phone:
 *                 type: string
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
            phone,
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

        // Create the patient record
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
