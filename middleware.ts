import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { $Enums } from "@prisma/client";
import { isAuthorizedForRoute, getRoleBasedDashboard } from "./src/lib/role-redirect";

type UserRole = $Enums.UserRole;

export default withAuth(
    function middleware(request) {
        const { pathname } = request.nextUrl;
        const token = request.nextauth.token;

        // Allow access to public routes and auth routes
        if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/signup" ||
            pathname === "/confirm-role" ||
            pathname === "/set-password" ||
            pathname.startsWith("/therapist/signup") ||
            pathname.startsWith("/manager/signup") ||
            pathname.startsWith("/admin/signup") ||
            pathname.startsWith("/api/auth") // Allow all auth API routes
        ) {
            return NextResponse.next();
        }

        // Redirect to login if no token
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const userRole = token.role as UserRole | null;

        // If user doesn't have a role set, redirect to confirm-role page
        if (!userRole && pathname !== "/confirm-role") {
            return NextResponse.redirect(new URL("/confirm-role", request.url));
        }

        // If user has a role, check authorization for the route
        if (userRole) {
            // Allow access to profile creation for NORMAL_USER
            if (userRole === "NORMAL_USER" && pathname.startsWith("/profile/create")) {
                return NextResponse.next();
            }

            // Check if user is authorized for this route
            if (!isAuthorizedForRoute(userRole, pathname)) {
                // Redirect to their appropriate dashboard
                const dashboardUrl = getRoleBasedDashboard(userRole);
                return NextResponse.redirect(new URL(dashboardUrl, request.url));
            }

            // Patient onboarding: check if NORMAL_USER has a profile when accessing dashboard
            if (userRole === "NORMAL_USER" && pathname === "/dashboard") {
                // This check would be handled by the dashboard page itself
                // to avoid middleware complexity with API calls
                return NextResponse.next();
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Always return true to let the middleware function handle the logic
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        "/((?!_next/static|_next/image|favicon.ico|public).*)"
    ],
};
