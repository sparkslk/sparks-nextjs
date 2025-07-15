import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// JWT signing function for mobile tokens
function signMobileToken(payload: any): string {
    return jwt.sign(
        payload,
        process.env.NEXTAUTH_SECRET!,
        {
            expiresIn: '24h',
            issuer: 'sparks-mobile-api',
            audience: 'sparks-mobile-app'
        }
    );
}

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
 * /api/auth/mobile/refresh:
 *   post:
 *     summary: Refresh mobile authentication token
 *     description: Refresh an existing JWT token if it's valid but near expiration
 *     tags:
 *       - Mobile Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Current JWT token to refresh
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 token:
 *                   type: string
 *                   description: New JWT token
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
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing or invalid token
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Token is required"
                },
                { status: 400 }
            );
        }

        // Verify the current token
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

        // Fetch current user data from database to ensure user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
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

        // Create new JWT payload with updated data
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            type: 'mobile-access'
        };

        // Generate new JWT token
        const newToken = signMobileToken(tokenPayload);

        // Calculate expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        return NextResponse.json({
            success: true,
            message: "Token refreshed successfully",
            token: newToken,
            user,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error("Mobile token refresh error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
