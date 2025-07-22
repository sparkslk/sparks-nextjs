import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/mobile/refresh:
 *   post:
 *     summary: Refresh mobile access token
 *     description: Refresh expired access token using refresh token
 *     tags:
 *       - Mobile Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token from previous authentication
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = await request.json();

        if (!refreshToken) {
            return NextResponse.json(
                { error: "Refresh token is required" },
                { status: 400 }
            );
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.NEXTAUTH_SECRET!) as any;

        if (!decoded.userId || decoded.type !== 'refresh') {
            return NextResponse.json(
                { error: "Invalid refresh token" },
                { status: 401 }
            );
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                metadata: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify stored refresh token matches
        const storedToken = (user.metadata as any)?.mobileRefreshToken;
        if (storedToken !== refreshToken) {
            return NextResponse.json(
                { error: "Invalid refresh token" },
                { status: 401 }
            );
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: '1h' }
        );

        const newRefreshToken = jwt.sign(
            {
                userId: user.id,
                type: 'refresh',
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: '7d' }
        );

        // Update stored refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                metadata: {
                    ...user.metadata,
                    mobileRefreshToken: newRefreshToken,
                },
            },
        });

        return NextResponse.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid refresh token" },
                { status: 401 }
            );
        }

        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 