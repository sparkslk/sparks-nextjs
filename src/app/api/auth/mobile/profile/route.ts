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
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
        // Type guard for decoded payload
        if (
            !decoded ||
            typeof decoded !== 'object' ||
            !('userId' in decoded) ||
            typeof (decoded as { userId?: unknown }).userId !== 'string'
        ) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }
        // Get user data (only valid fields for User model)
        const user = await prisma.user.findUnique({
            where: { id: (decoded as { userId: string }).userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Determine profile type (basic fallback, since related fields are not selected)
        const profileType = "NORMAL_USER";
        const hasProfile = false;

        // If you want to support profile types, fetch and check related fields here
        // For now, always return NORMAL_USER

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
