import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/mobile/profile:
 *   get:
 *     summary: Get mobile user profile
 *     description: Retrieve user profile information using JWT token
 *     tags:
 *       - Mobile Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     image:
 *                       type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     hasProfile:
 *                       type: boolean
 *                     profileType:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { error: "Authorization token required" },
                { status: 401 }
            );
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {userId?: string};

        if (!decoded.userId) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                patientProfile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                therapistProfile: {
                    select: {
                        id: true,
                        licenseNumber: true,
                        specialization: true,
                    }
                },
                parentGuardianRel: {
                    select: {
                        id: true,
                        relationship: true,
                    }
                },
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Determine profile type
        let profileType = "NORMAL_USER";
        let hasProfile = false;

        if (user.patientProfile) {
            profileType = "PATIENT";
            hasProfile = true;
        } else if (user.therapistProfile) {
            profileType = "THERAPIST";
            hasProfile = true;
        } else if (user.parentGuardianRel.length > 0) {
            profileType = "PARENT_GUARDIAN";
            hasProfile = true;
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
            },
            profile: {
                hasProfile,
                profileType,
            },
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        console.error('Mobile profile error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
