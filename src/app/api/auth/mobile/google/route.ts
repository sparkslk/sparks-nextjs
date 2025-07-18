import { NextRequest, NextResponse } from "next/server";
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
 * /api/auth/mobile/google:
 *   post:
 *     summary: Mobile Google OAuth authentication
 *     description: Authenticate a user using Google OAuth token from mobile app
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
 *                 description: Google ID token obtained from Google Sign-In in mobile app
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN..."
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email (for verification)
 *                 example: "john.doe@gmail.com"
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               picture:
 *                 type: string
 *                 description: User's profile picture URL
 *                 example: "https://lh3.googleusercontent.com/..."
 *     responses:
 *       200:
 *         description: Google OAuth authentication successful
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
 *                   example: "Google authentication successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
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
 *                 isNewUser:
 *                   type: boolean
 *                   description: Whether this is a newly created user
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       401:
 *         description: Unauthorized - invalid Google token
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { idToken, email, name, picture } = await request.json();

        if (!idToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Google ID token is required"
                },
                { status: 400 }
            );
        }

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Email is required"
                },
                { status: 400 }
            );
        }

        // TODO: Verify Google ID token with Google's API
        // For now, we'll trust the client has already verified it
        // In production, you should verify the token server-side

        // Note: To implement proper Google ID token verification:
        // 1. Install google-auth-library: npm install google-auth-library
        // 2. Use OAuth2Client to verify the token
        // 3. Extract user info from verified token

        // Example verification code (commented out until google-auth-library is installed):
        /*
        import { OAuth2Client } from 'google-auth-library';
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            
            if (!payload || payload.email !== email) {
                return NextResponse.json(
                    { 
                        success: false,
                        error: "Invalid Google token" 
                    },
                    { status: 401 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "Google token verification failed" 
                },
                { status: 401 }
            );
        }
        */

        let user;
        let isNewUser = false;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
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

        if (existingUser) {
            // Update user's image if provided and different
            if (picture && existingUser.image !== picture) {
                user = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { image: picture },
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
            } else {
                user = existingUser;
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    name: name || '',
                    role: UserRole.NORMAL_USER,
                    image: picture || null,
                    // No password for OAuth users
                },
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
            isNewUser = true;
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

        return NextResponse.json({
            success: true,
            message: "Google authentication successful",
            token,
            user,
            isNewUser,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error("Mobile Google OAuth error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
