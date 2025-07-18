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
