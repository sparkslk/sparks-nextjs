import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/mobile/logout:
 *   post:
 *     summary: Mobile user logout
 *     description: Logout a mobile user. Since we're using stateless JWT tokens, this endpoint primarily serves to confirm logout on the client side. The mobile app should delete the stored token.
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        // Since we're using stateless JWT tokens, logout is primarily handled on the client side
        // The mobile app should delete the stored token
        // This endpoint confirms the logout action

        return NextResponse.json({
            success: true,
            message: "Logout successful. Please delete the token from your mobile app storage."
        });

    } catch (error) {
        console.error("Mobile logout error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
