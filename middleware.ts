import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { $Enums } from "./generated/prisma";
import { isAuthorizedForRoute, getRoleBasedDashboard } from "./src/lib/role-redirect";

type UserRole = $Enums.UserRole;

export default withAuth(
    function middleware(request) {
        const { pathname } = request.nextUrl;
        const token = request.nextauth.token;

        // Allow access to public routes and OAuth callback routes
        if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/signup" ||
            pathname === "/confirm-role" ||
            pathname.startsWith("/therapist/signup") ||
            pathname.startsWith("/manager/signup") ||
            pathname.startsWith("/admin/signup") ||
            pathname.startsWith("/api/auth") // Allow all auth API routes
        ) {
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const userRole = token.role as UserRole | null;

        // If user doesn't have a role set, redirect to confirm-role page
        if (!userRole && pathname !== "/confirm-role") {
            return NextResponse.redirect(new URL("/confirm-role", request.url));
        }

        // Check if user is authorized for this route
        if (userRole && !isAuthorizedForRoute(userRole, pathname)) {
            // Redirect to their appropriate dashboard
            const dashboardUrl = getRoleBasedDashboard(userRole);
            return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Allow access to auth routes without token
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - includes NextAuth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.ico$).*)",
    ],
};
