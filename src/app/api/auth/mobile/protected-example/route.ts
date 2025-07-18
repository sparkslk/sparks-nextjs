import { NextRequest, NextResponse } from "next/server";
import { getMobileAuthFromRequest, hasRequiredRole } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/mobile/protected-example:
 *   get:
 *     summary: Example protected route for mobile
 *     description: Example of how to protect API routes for mobile app usage
 *     tags:
 *       - Mobile Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
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
 *                   example: "Access granted to protected resource"
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
 *                 data:
 *                   type: object
 *                   description: Protected data specific to user role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
    try {
        // Verify mobile authentication
        const authResult = await getMobileAuthFromRequest(request);

        if (!authResult.success || !authResult.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: authResult.error || "Authentication failed"
                },
                { status: 401 }
            );
        }

        const user = authResult.user;

        // Example: Only allow THERAPIST, MANAGER, and ADMIN roles
        const allowedRoles = ['THERAPIST', 'MANAGER', 'ADMIN'];

        if (!hasRequiredRole(user.role, allowedRoles)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Insufficient permissions. This endpoint requires THERAPIST, MANAGER, or ADMIN role."
                },
                { status: 403 }
            );
        }

        // Example protected data based on user role
        let protectedData = {};

        switch (user.role) {
            case 'ADMIN':
                // Admin can see all users count
                const userCount = await prisma.user.count();
                protectedData = {
                    message: "Admin access granted",
                    totalUsers: userCount,
                    permissions: ['read_all', 'write_all', 'delete_all']
                };
                break;

            case 'MANAGER':
                // Manager can see therapists in their organization
                const therapistCount = await prisma.therapist.count();
                protectedData = {
                    message: "Manager access granted",
                    managedTherapists: therapistCount,
                    permissions: ['read_organization', 'write_organization']
                };
                break;

            case 'THERAPIST':
                // Therapist can see their own data
                const therapistProfile = await prisma.therapist.findUnique({
                    where: { userId: user.id },
                    select: {
                        licenseNumber: true,
                        specialization: true,
                        experience: true
                    }
                });
                protectedData = {
                    message: "Therapist access granted",
                    profile: therapistProfile,
                    permissions: ['read_own', 'write_own']
                };
                break;

            default:
                protectedData = {
                    message: "Basic access granted",
                    permissions: ['read_basic']
                };
        }

        return NextResponse.json({
            success: true,
            message: "Access granted to protected resource",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            data: protectedData
        });

    } catch (error) {
        console.error("Protected route error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
