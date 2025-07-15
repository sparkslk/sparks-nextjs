import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/mobile/test:
 *   get:
 *     summary: Test mobile authentication endpoints
 *     description: Simple endpoint to test if mobile auth system is working
 *     tags:
 *       - Mobile Authentication
 *     responses:
 *       200:
 *         description: Mobile auth system is working
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
 *                   example: "Mobile authentication system is working"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     signup:
 *                       type: string
 *                       example: "POST /api/auth/mobile/signup"
 *                     signin:
 *                       type: string
 *                       example: "POST /api/auth/mobile/signin"
 *                     google:
 *                       type: string
 *                       example: "POST /api/auth/mobile/google"
 *                     profile:
 *                       type: string
 *                       example: "GET /api/auth/mobile/profile"
 *                     refresh:
 *                       type: string
 *                       example: "POST /api/auth/mobile/refresh"
 *                     logout:
 *                       type: string
 *                       example: "POST /api/auth/mobile/logout"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: "Mobile authentication system is working",
        endpoints: {
            signup: "POST /api/auth/mobile/signup",
            signin: "POST /api/auth/mobile/signin",
            google: "POST /api/auth/mobile/google",
            profile: "GET /api/auth/mobile/profile",
            refresh: "POST /api/auth/mobile/refresh",
            logout: "POST /api/auth/mobile/logout",
            protectedExample: "GET /api/auth/mobile/protected-example"
        },
        documentation: "See MOBILE_AUTH_GUIDE.md for complete usage instructions",
        timestamp: new Date().toISOString()
    });
}
