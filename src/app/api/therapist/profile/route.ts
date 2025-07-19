import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/profile:
 *   get:
 *     summary: Get therapist profile
 *     description: Retrieves the authenticated therapist's profile information including user details and organization
 *     tags:
 *       - Therapist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Therapist profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Therapist unique identifier
 *                 licenseNumber:
 *                   type: string
 *                   description: Professional license number
 *                 specialization:
 *                   type: string
 *                   description: Area of specialization
 *                 experience:
 *                   type: integer
 *                   description: Years of experience
 *                 bio:
 *                   type: string
 *                   description: Professional biography
 *                 availability:
 *                   type: object
 *                   description: Availability schedule
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     image:
 *                       type: string
 *                       nullable: true
 *                 organization:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid authentication or insufficient permissions
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
// Get therapist profile information
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get therapist profile with user information
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                organization: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: therapist.id,
            licenseNumber: therapist.licenseNumber,
            specialization: therapist.specialization,
            experience: therapist.experience,
            bio: therapist.bio,
            availability: therapist.availability,
            rating: therapist.rating ? parseFloat(therapist.rating.toString()) : null,
            user: therapist.user,
            organization: therapist.organization,
            createdAt: therapist.createdAt,
            updatedAt: therapist.updatedAt
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapist profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch therapist profile" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/therapist/profile:
 *   put:
 *     summary: Update therapist profile
 *     description: Updates the authenticated therapist's profile information
 *     tags:
 *       - Therapist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 description: Professional biography
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas of specialization
 *               experience:
 *                 type: integer
 *                 description: Years of experience
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 licenseNumber:
 *                   type: string
 *                 specialization:
 *                   type: array
 *                   items:
 *                     type: string
 *                 experience:
 *                   type: integer
 *                 bio:
 *                   type: string
 *                 availability:
 *                   type: object
 *                 user:
 *                   type: object
 *                 organization:
 *                   type: object
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist profile not found
 *       500:
 *         description: Internal server error
 */
// Update therapist profile information
export async function PUT(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const body = await req.json();

        // Validate input data
        const { bio, specialization, experience } = body;

        if (typeof bio !== 'undefined' && typeof bio !== 'string') {
            return NextResponse.json(
                { error: "Bio must be a string" },
                { status: 400 }
            );
        }

        if (typeof specialization !== 'undefined' && !Array.isArray(specialization)) {
            return NextResponse.json(
                { error: "Specialization must be an array of strings" },
                { status: 400 }
            );
        }

        if (typeof experience !== 'undefined' && (typeof experience !== 'number' || experience < 0)) {
            return NextResponse.json(
                { error: "Experience must be a non-negative number" },
                { status: 400 }
            );
        }

        // Check if therapist exists
        const existingTherapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id }
        });

        if (!existingTherapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }


        // Prepare update data
        type TherapistUpdateData = {
            bio?: string;
            specialization?: string[];
            experience?: number;
        };
        const updateData: TherapistUpdateData = {};
        if (typeof bio !== 'undefined') updateData.bio = bio;
        if (typeof specialization !== 'undefined') updateData.specialization = specialization;
        if (typeof experience !== 'undefined') updateData.experience = experience;

        // Update therapist profile
        const updatedTherapist = await prisma.therapist.update({
            where: { userId: session.user.id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                organization: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });

        return NextResponse.json({
            id: updatedTherapist.id,
            licenseNumber: updatedTherapist.licenseNumber,
            specialization: updatedTherapist.specialization,
            experience: updatedTherapist.experience,
            bio: updatedTherapist.bio,
            availability: updatedTherapist.availability,
            rating: updatedTherapist.rating ? parseFloat(updatedTherapist.rating.toString()) : null,
            user: updatedTherapist.user,
            organization: updatedTherapist.organization,
            createdAt: updatedTherapist.createdAt,
            updatedAt: updatedTherapist.updatedAt
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating therapist profile:", error);
        return NextResponse.json(
            { error: "Failed to update therapist profile" },
            { status: 500 }
        );
    }
}
