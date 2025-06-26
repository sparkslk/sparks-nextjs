import { UserRole } from "@/lib/auth";

/**
 * Determines if a user role requires a profile for dashboard access
 */
export function userRoleNeedsProfile(role: UserRole | null): boolean {
    // Only NORMAL_USER requires a patient profile to access dashboard
    return role === UserRole.NORMAL_USER;
}

/**
 * Determines if a user role should have dashboard access without a profile
 */
export function userRoleHasDashboardAccess(role: UserRole | null): boolean {
    if (!role) return false;
    
    // These roles have their own dashboards and don't need patient profiles
    const rolesWithDashboardAccess: UserRole[] = [
        UserRole.PARENT_GUARDIAN,
        UserRole.THERAPIST,
        UserRole.MANAGER,
        UserRole.ADMIN
    ];
    
    return rolesWithDashboardAccess.includes(role);
}

/**
 * Gets the appropriate redirect path for a user role that doesn't need a profile
 */
export function getRedirectPathForRole(role: UserRole): string {
    switch (role) {
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
