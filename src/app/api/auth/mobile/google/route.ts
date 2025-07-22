import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @swagger
 * /api/auth/mobile/google:
 *   post:
 *     summary: Mobile Google OAuth authentication
 *     description: Authenticate mobile users with Google ID token
 *     tags:
 *       - Mobile Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from mobile app
 *                 example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token for mobile app
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid ID token
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json(
                { error: "ID token is required" },
                { status: 400 }
            );
        }

        let payload: {email?: string; name?: string; picture?: string; iss?: string} | undefined;
        
        // In development, allow test tokens
        if (process.env.NODE_ENV === 'development' && idToken.startsWith('eyJ')) {
            try {
                // Try to decode as a test token first
                const decoded = jwt.verify(idToken, "mock-secret-key") as {iss?: string; email?: string; name?: string; picture?: string};
                if (decoded.iss === "https://accounts.google.com") {
                    payload = decoded;
                }
            } catch {
                // Not a test token, proceed with Google verification
            }
        }
        
        // If not a test token or production, verify with Google
        if (!payload) {
            try {
                const ticket = await client.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch {
                return NextResponse.json(
                    { error: "Invalid ID token" },
                    { status: 401 }
                );
            }
        }
        
        if (!payload) {
            return NextResponse.json(
                { error: "Invalid ID token" },
                { status: 401 }
            );
        }

        const { email, name, picture } = payload;

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: email! },
        });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: email!,
                    name: name || email!.split('@')[0],
                    image: picture,
                    role: "NORMAL_USER", // Default role
                },
            });
        }

        // Generate JWT tokens for mobile
        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            {
                userId: user.id,
                type: 'refresh',
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: '7d' }
        );

        // Store refresh token in database (optional)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                metadata: {
                    ...(typeof user.metadata === 'object' && user.metadata !== null && !Array.isArray(user.metadata) ? user.metadata : {}),
                    mobileRefreshToken: refreshToken,
                },
            },
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        });

    } catch (error) {
        console.error('Mobile Google OAuth error:', error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}
