import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/mobile/logout:
 *   post:
 *     summary: Mobile logout
 *     description: Logout mobile user and invalidate tokens
 *     tags:
 *       - Mobile Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
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

        // Clear refresh token from user metadata (optional)
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                metadata: {
                    mobileRefreshToken: null,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        console.error('Mobile logout error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
