import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { $Enums } from "@prisma/client";

const UserRole = $Enums.UserRole;

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

/**
 * @swagger
 * /api/auth/mobile/signin:
 *   post:
 *     summary: Mobile user sign in
 *     description: Authenticate a user and return a JWT token for mobile app usage
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
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Sign in successful
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
 *                   example: "Sign in successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_123456"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       enum: ["NORMAL_USER", "PARENT_GUARDIAN", "THERAPIST", "MANAGER", "ADMIN"]
 *                       example: "NORMAL_USER"
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration time
 *       400:
 *         description: Bad request - missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Email and password are required"
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Email and password are required"
                },
                { status: 400 }
            );
        }

        // Find user in database
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user || !user.password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid credentials"
                },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid credentials"
                },
                { status: 401 }
            );
        }

        // Create JWT payload
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            type: 'mobile-access'
        };

        // Generate JWT token
        const token = signMobileToken(tokenPayload);

        // Calculate expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            message: "Sign in successful",
            token,
            user: userWithoutPassword,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error("Mobile signin error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
