import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/parent/children/connect:
 *   post:
 *     summary: Connect to a child using patient ID
 *     description: Associate an existing patient with the authenticated parent/guardian using the patient's ID
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
 *               - patientId
 *               - relationship
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: The unique ID of the patient to connect to
 *               relationship:
 *                 type: string
 *                 description: Relationship to the patient (e.g., "father", "mother", "guardian")
 *               isPrimary:
 *                 type: boolean
 *                 description: Whether this parent is the primary guardian
 *                 default: false
 *     responses:
 *       200:
 *         description: Successfully connected to child
 *       400:
 *         description: Invalid patient ID or relationship already exists
 *       404:
 *         description: Patient not found
 */
export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['PARENT_GUARDIAN']);

        const {
            patientId,
            relationship,
            isPrimary = false
        } = await request.json();

        // Validate required fields
        if (!patientId || !relationship) {
            return NextResponse.json(
                { error: "Patient ID and relationship are required" },
                { status: 400 }
            );
        }

        // Check if the patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                parentGuardians: {
                    select: {
                        userId: true,
                        relationship: true
                    }
                }
            }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found with the provided ID" },
                { status: 404 }
            );
        }

        // Check if this parent is already connected to this patient
        const existingRelation = patient.parentGuardians.find(
            pg => pg.userId === session.user.id
        );

        if (existingRelation) {
            return NextResponse.json(
                { error: "You are already connected to this patient" },
                { status: 400 }
            );
        }

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

        // Get user info for response
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true }
        });

        return NextResponse.json({
            message: "Successfully connected to child",
            connection: {
                patient: {
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    dateOfBirth: patient.dateOfBirth
                },
                parent: {
                    name: user?.name,
                    email: user?.email
                },
                relationship: parentGuardianRelation.relationship,
                isPrimary: parentGuardianRelation.isPrimary,
                connectedAt: parentGuardianRelation.createdAt
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error connecting to child:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
