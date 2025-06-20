import { $Enums } from "../../generated/prisma";

type UserRole = $Enums.UserRole;
const UserRole = $Enums.UserRole;

export function getRoleBasedDashboard(role: UserRole | null): string {
    if (!role) return "/confirm-role";

    switch (role) {
        case UserRole.NORMAL_USER:
            return "/dashboard"; // Patient users go to main dashboard
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
    const publicRoutes = ["/", "/login", "/signup", "/setup-role", "/confirm-role", "/api/auth"];
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

    // Default dashboard and patient routes for normal users, plus sessions and profile routes
    if (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/set-password") ||
        pathname.startsWith("/sessions") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/patient")) {
        return userRole === UserRole.NORMAL_USER || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    }

    return false;
}
