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

        // Skip middleware for API routes (except auth routes that need protection)
        if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
            return NextResponse.next();
        }

        // Allow access to public routes and auth routes
        if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/signup" ||
            pathname === "/confirm-role" ||
            pathname === "/set-password" ||
            pathname === "/api-docs" ||
            pathname.startsWith("/therapist/signup") ||
            pathname.startsWith("/manager/signup") ||
            pathname.startsWith("/admin/signup")
        ) {
            return NextResponse.next();
        }

        // Redirect to login if no token
        if (!token) {
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        const userRole = token.role as UserRole | null;

        // If user doesn't have a role set, redirect to confirm-role page
        if (!userRole && pathname !== "/confirm-role") {
            const confirmRoleUrl = new URL("/confirm-role", request.url);
            return NextResponse.redirect(confirmRoleUrl);
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
                const redirectUrl = new URL(dashboardUrl, request.url);
                return NextResponse.redirect(redirectUrl);
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
            authorized: ({ token, req }) => {
                // Allow access to public routes without token
                const { pathname } = req.nextUrl;

                // Skip auth for API routes (except auth routes)
                if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
                    return true;
                }

                if (
                    pathname === "/" ||
                    pathname === "/login" ||
                    pathname === "/signup" ||
                    pathname === "/confirm-role" ||
                    pathname === "/set-password" ||
                    pathname === "/api-docs" ||
                    pathname.startsWith("/therapist/signup") ||
                    pathname.startsWith("/manager/signup") ||
                    pathname.startsWith("/admin/signup")
                ) {
                    return true;
                }

                // For protected routes, require a token
                return !!token;
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
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)"
    ],
};
