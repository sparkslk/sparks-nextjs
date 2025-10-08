import { $Enums } from "@prisma/client";
import { prisma } from "./prisma";

type UserRole = $Enums.UserRole;
const UserRole = $Enums.UserRole;

export async function getRoleBasedDashboard(role: UserRole | null, userId?: string): Promise<string> {
    if (!role) return "/confirm-role";

    switch (role) {
        case UserRole.NORMAL_USER:
            return "/dashboard"; // Users go to main dashboard
        case UserRole.PARENT_GUARDIAN:
            return "/parent/dashboard";
        case UserRole.THERAPIST:
            // Check therapist verification status
            if (userId) {
                const therapist = await prisma.therapist.findUnique({
                    where: { userId },
                    include: { verification: true }
                });

                if (therapist?.verification) {
                    const status = therapist.verification.status;
                    
                    // If approved, check if they've seen the approval message
                    if (status === 'APPROVED') {
                        const reviewNotes = therapist.verification.reviewNotes;
                        const hasSeenApproval = reviewNotes?.includes('Approval acknowledged');
                        
                        // If they haven't seen the approval message yet, show it
                        if (!hasSeenApproval) {
                            return "/therapist/verification/approved";
                        }
                        
                        return "/therapist/dashboard";
                    }
                    
                    // If still pending or under review, go to success page
                    if (status === 'PENDING' || status === 'UNDER_REVIEW') {
                        return "/therapist/verification/success";
                    }
                    
                    // If rejected or needs resubmission, go back to verification
                    if (status === 'REJECTED' || status === 'REQUIRES_RESUBMISSION') {
                        return "/therapist/verification";
                    }
                }
                
                // No verification found, go to verification page
                return "/therapist/verification";
            }
            return "/therapist/dashboard";
        case UserRole.MANAGER:
            return "/manager/dashboard";
        case UserRole.ADMIN:
            return "/admin/dashboard";
        default:
            return "/dashboard";
    }
}

// Keep sync version for backwards compatibility
export function getRoleBasedDashboardSync(role: UserRole | null): string {
    if (!role) return "/confirm-role";

    switch (role) {
        case UserRole.NORMAL_USER:
            return "/dashboard";
        case UserRole.PARENT_GUARDIAN:
            return "/parent/dashboard";
        case UserRole.THERAPIST:
            return "/therapist/dashboard";
        case UserRole.MANAGER:
            return "/manager/dashboard";
        case UserRole.ADMIN:
            return "/admin/dashboard";
        default:
            return "/dashboard";
    }
}

export function getRoleBasedSignup(role: UserRole): string {
    switch (role) {
        case UserRole.NORMAL_USER:
        case UserRole.PARENT_GUARDIAN:
            return "/signup";
        case UserRole.THERAPIST:
            return "/therapist/signup";
        case UserRole.MANAGER:
            return "/manager/signup";
        case UserRole.ADMIN:
            return "/admin/signup";
        default:
            return "/signup";
    }
}

export function isAuthorizedForRoute(userRole: UserRole | null, pathname: string): boolean {
    // Public routes that everyone can access
    const publicRoutes = ["/", "/login", "/signup", "/setup-role", "/confirm-role", "/api-docs", "/api/auth", "/quiz"];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return true;
    }

    // If user has no role, they can only access confirm-role page
    if (!userRole) {
        return pathname === "/confirm-role";
    }

    // Role-specific route access
    if (pathname.startsWith("/therapist")) {
        return userRole === UserRole.THERAPIST || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    }

    if (pathname.startsWith("/manager")) {
        return userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    }

    if (pathname.startsWith("/admin")) {
        return userRole === UserRole.ADMIN;
    }

    if (pathname.startsWith("/parent")) {
        return userRole === UserRole.PARENT_GUARDIAN || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    }

    // Default dashboard and user routes for normal users, plus sessions and profile routes
    if (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/set-password") ||
        pathname.startsWith("/sessions") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/user")) {
        return userRole === UserRole.NORMAL_USER || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    }

    return false;
}
