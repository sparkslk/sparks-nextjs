import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export interface MobileAuthUser {
    id: string;
    email: string | null;
    name: string | null;
    role: string;
    iat: number;
    exp: number;
}

export interface MobileAuthResult {
    success: boolean;
    user?: MobileAuthUser;
    error?: string;
}

/**
 * Utility function to verify mobile JWT tokens
 * @param token - The JWT token to verify
 * @returns Promise with auth result
 */
export async function verifyMobileAuth(token: string): Promise<MobileAuthResult> {
    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!, {
            issuer: 'sparks-mobile-api',
            audience: 'sparks-mobile-app'
        }) as any;

        if (!decoded || decoded.type !== 'mobile-access') {
            return {
                success: false,
                error: "Invalid token type"
            };
        }

        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        if (!user) {
            return {
                success: false,
                error: "User not found"
            };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                iat: decoded.iat,
                exp: decoded.exp
            }
        };

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return {
                success: false,
                error: "Token expired"
            };
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return {
                success: false,
                error: "Invalid token"
            };
        }

        return {
            success: false,
            error: "Authentication failed"
        };
    }
}

/**
 * Middleware function to extract and verify mobile auth from request headers
 * @param request - NextRequest object
 * @returns Promise with auth result
 */
export async function getMobileAuthFromRequest(request: NextRequest): Promise<MobileAuthResult> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return {
                success: false,
                error: "Authorization header missing"
            };
        }

        if (!authHeader.startsWith('Bearer ')) {
            return {
                success: false,
                error: "Invalid authorization format. Use: Bearer <token>"
            };
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return {
                success: false,
                error: "Token missing"
            };
        }

        return await verifyMobileAuth(token);

    } catch (error) {
        return {
            success: false,
            error: "Authentication failed"
        };
    }
}

/**
 * Check if user has required role
 * @param userRole - User's current role
 * @param requiredRoles - Array of allowed roles
 * @returns boolean
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
}

/**
 * Role hierarchy for authorization
 */
export const ROLE_HIERARCHY = {
    ADMIN: ['ADMIN', 'MANAGER', 'THERAPIST', 'PARENT_GUARDIAN', 'NORMAL_USER'],
    MANAGER: ['MANAGER', 'THERAPIST', 'PARENT_GUARDIAN', 'NORMAL_USER'],
    THERAPIST: ['THERAPIST'],
    PARENT_GUARDIAN: ['PARENT_GUARDIAN'],
    NORMAL_USER: ['NORMAL_USER']
};

/**
 * Check if user role has permission for target role
 * @param userRole - User's current role
 * @param targetRole - Role being checked against
 * @returns boolean
 */
export function hasRolePermission(userRole: string, targetRole: string): boolean {
    const allowedRoles = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY];
    return allowedRoles ? allowedRoles.includes(targetRole) : false;
}
