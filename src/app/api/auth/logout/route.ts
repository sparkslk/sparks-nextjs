import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear user session and authentication cookies
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successfully logged out
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
 *                   example: "Logged out successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Logout failed"
 *                 success:
 *                   type: boolean
 *                   example: false
 */
export async function POST(request: NextRequest) {
    try {
        // Get the current session for logging purposes
        const session = await getServerSession(authOptions);

        if (session) {
            console.log(`Logging out user: ${session.user?.email}`);
        }

        // Clear all NextAuth cookies
        const nextAuthCookies = [
            'next-auth.session-token',
            'next-auth.csrf-token',
            'next-auth.callback-url',
            'next-auth.state',
            '__Secure-next-auth.session-token', // For HTTPS
            '__Host-next-auth.csrf-token', // For HTTPS
        ];

        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        // Clear each cookie
        nextAuthCookies.forEach(cookieName => {
            response.cookies.set({
                name: cookieName,
                value: '',
                expires: new Date(0),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        });

        // Also clear any custom session storage
        response.cookies.set({
            name: 'sparks-session',
            value: '',
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed', success: false },
            { status: 500 }
        );
    }
}

// Also handle GET requests for flexibility
export async function GET(request: NextRequest) {
    return POST(request);
}
