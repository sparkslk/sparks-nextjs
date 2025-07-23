import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/mobile/credentials:
 *   post:
 *     summary: Mobile credentials authentication
 *     description: Authenticate mobile users with email and password
 *     tags:
 *       - Mobile Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "securePassword123"
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
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        let email: string | undefined;
        let password: string | undefined;

        // Try to parse as JSON first
        try {
            const body = await request.json();
            email = body?.email;
            password = body?.password;
        } catch (error: unknown) {
            // Log the error for debugging purposes
            console.warn('Failed to parse JSON body:', error);
            // If JSON parsing fails, try to parse as form-urlencoded
            const text = await request.text();
            if (text?.includes('=')) {
                const params = new URLSearchParams(text);
                email = params.get('email') || undefined;
                password = params.get('password') || undefined;
            }
        }

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
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
                    ...((typeof user.metadata === 'object' && user.metadata !== null) ? user.metadata : {}),
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
        console.error('Mobile credentials auth error:', error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}