import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "./src/lib/auth";
import { isAuthorizedForRoute, getRoleBasedDashboard } from "./src/lib/role-redirect";

export default withAuth(
    function middleware(request) {
        const { pathname } = request.nextUrl;
        const token = request.nextauth.token;

        console.log("Middleware:", {
            pathname,
            hasToken: !!token,
            role: token?.role,
            email: token?.email
        });

        // Allow access to public routes
        if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/signup" ||
            pathname === "/debug-auth" ||
            pathname.startsWith("/therapist/signup") ||
            pathname.startsWith("/manager/signup") ||
            pathname.startsWith("/admin/signup")
        ) {
            console.log("Allowing public route:", pathname);
            return NextResponse.next();
        }

        if (!token) {
            console.log("No token, redirecting to login");
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const userRole = token.role as UserRole | null;
        console.log("User role from token:", userRole);

        // Check if user is authorized for this route
        if (userRole && !isAuthorizedForRoute(userRole, pathname)) {
            // Redirect to their appropriate dashboard
            const dashboardUrl = getRoleBasedDashboard(userRole);
            console.log("Unauthorized route, redirecting to:", dashboardUrl);
            return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }

        console.log("Allowing access to:", pathname);
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
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    ],
};
