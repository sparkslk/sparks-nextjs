import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapists:
 *   get:
 *     summary: Get all therapists
 *     description: Retrieve a list of all therapists with their details
 *     tags:
 *       - Therapists
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of therapists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Therapist ID
 *                   licenseNumber:
 *                     type: string
 *                     description: Therapist license number
 *                   specializations:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of specializations
 *                   user:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Therapist name
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Therapist email
 *                   organization:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Organization name
 *       401:
 *         description: Unauthorized
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
        await requireApiAuth(req);

        // Fetch all therapists with their details
        const therapists = await prisma.therapist.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                },
                organization: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                user: {
                    name: "asc"
                }
            }
        });

        // If no therapists found in Therapist table, create them from existing THERAPIST users
        if (therapists.length === 0) {
            console.log("No therapists found in Therapist table, checking for THERAPIST users...");

            const therapistUsers = await prisma.user.findMany({
                where: { role: 'THERAPIST' },
                include: {
                    therapistProfile: true
                }
            });

            console.log(`Found ${therapistUsers.length} THERAPIST users`);

            // Create Therapist records for users who don't have them
            for (const user of therapistUsers) {
                if (!user.therapistProfile) {
                    console.log(`Creating Therapist record for user ${user.email}`);

                    const metadata = user.metadata as Record<string, unknown> | null;
                    const specializationArray = metadata?.specialization
                        ? (Array.isArray(metadata.specialization)
                            ? metadata.specialization
                            : (metadata.specialization as string).split(',').map((s: string) => s.trim()).filter(Boolean))
                        : [];

                    await prisma.therapist.create({
                        data: {
                            userId: user.id,
                            licenseNumber: (metadata?.licenseNumber as string) || `LIC-${user.id.slice(-8)}`,
                            specialization: specializationArray,
                            experience: (metadata?.experience as number) || 0,
                            bio: (metadata?.bio as string) || '',
                        },
                    });
                }
            }

            // Re-fetch therapists after creating missing records
            const updatedTherapists = await prisma.therapist.findMany({
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    user: {
                        name: "asc"
                    }
                }
            });

            return NextResponse.json({
                therapists: updatedTherapists.map(therapist => ({
                    id: therapist.id,
                    name: therapist.user.name || therapist.user.email || "Unknown Therapist",
                    email: therapist.user.email,
                    image: therapist.user.image || null,
                    specialization: therapist.specialization,
                    experience: therapist.experience,
                    bio: therapist.bio,
                    organization: therapist.organization?.name,
                    availableSlots: [
                        "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
                    ]
                }))
            });
        }

        // Format therapists data for the frontend
        const formattedTherapists = therapists.map(therapist => ({
            id: therapist.id,
            name: therapist.user.name || therapist.user.email || "Unknown Therapist",
            email: therapist.user.email,
            image: therapist.user.image || null,
            specialization: therapist.specialization,
            experience: therapist.experience,
            bio: therapist.bio,
            organization: therapist.organization?.name,
            // For now, we'll provide sample available slots
            // In a real app, this would be calculated based on their schedule
            availableSlots: [
                "09:00",
                "10:00",
                "11:00",
                "14:00",
                "15:00",
                "16:00"
            ]
        }));

        return NextResponse.json({
            therapists: formattedTherapists
        });

    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapists:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
