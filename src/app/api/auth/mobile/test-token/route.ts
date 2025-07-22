import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/auth/mobile/test-token:
 *   post:
 *     summary: Generate test Google ID token (DEVELOPMENT ONLY)
 *     description: Generate a mock Google ID token for testing mobile auth
 *     tags:
 *       - Mobile Authentication
 *       - Development
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email for the test user
 *                 example: "test@example.com"
 *               name:
 *                 type: string
 *                 description: Name for the test user
 *                 example: "Test User"
 *     responses:
 *       200:
 *         description: Test token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idToken:
 *                   type: string
 *                   description: Mock Google ID token
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: "This endpoint is not available in production" },
            { status: 403 }
        );
    }

    try {
        const { email = "test@example.com", name = "Test User" } = await request.json();

        // Create a mock Google ID token
        const mockIdToken = jwt.sign(
            {
                iss: "https://accounts.google.com",
                sub: "123456789",
                aud: process.env.GOOGLE_CLIENT_ID,
                email: email,
                email_verified: true,
                name: name,
                picture: "https://lh3.googleusercontent.com/a/default-user",
                given_name: name.split(' ')[0],
                family_name: name.split(' ').slice(1).join(' '),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
            },
            "mock-secret-key", // This is just for testing
            { algorithm: 'HS256' }
        );

        return NextResponse.json({
            idToken: mockIdToken,
            message: "Test token generated (DEVELOPMENT ONLY)",
            email: email,
            name: name,
        });

    } catch (error) {
        console.error('Test token generation error:', error);
        return NextResponse.json(
            { error: "Failed to generate test token" },
            { status: 500 }
        );
    }
} 