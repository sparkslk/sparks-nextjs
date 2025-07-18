import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// JWT verification function
function verifyMobileToken(token: string): any {
    try {
        return jwt.verify(token, process.env.NEXTAUTH_SECRET!, {
            issuer: 'sparks-mobile-api',
            audience: 'sparks-mobile-app'
        });
    } catch (error) {
        return null;
    }
}

/**
 * @swagger
 * /api/auth/mobile/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the current user's profile information using JWT token
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
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     metadata:
 *                       type: object
 *                       description: Role-specific metadata
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Authorization token required"
                },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the token
        const decoded = verifyMobileToken(token);

        if (!decoded || decoded.type !== 'mobile-access') {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid or expired token"
                },
                { status: 401 }
            );
        }

        // Fetch user data from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                metadata: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User not found"
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Mobile profile error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
