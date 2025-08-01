import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getRoleBasedDashboard } from "@/lib/role-redirect";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/therapist/signup",
  "/manager/signup",
  "/admin/signup",
  "/dashboard-redirect",
  "api-docs",
  "/api/auth",
  "/api/auth/",
  "/api/auth/callback",
  "/api/auth/session",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/providers",
  "/api/auth/csrf",
  "/api/auth/error",
  "/therapist/verification/success",
  "/therapist/verification/approved",
  "/features",
  "/about",
  "/resources",
  "/contact",
  "/confirm-role",
  "/set-password",
  "/blogs",
  "/api/mobile", // Allow all /api/mobile routes to bypass middleware
];

function isPublicPath(path: string) {
  const isPublic = PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath + "/")
  );
  if (process.env.NODE_ENV === "development") {
    console.log("Middleware: isPublicPath check:", { path, isPublic });
  }
  return isPublic;
}

function isApiRoute(path: string) {
  return path.startsWith("/api/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.NODE_ENV === "development") {
    console.log("Middleware: Processing request for:", pathname);
  }

  if (isPublicPath(pathname)) {
    if (process.env.NODE_ENV === "development") {
      console.log("Middleware: Public path, allowing through:", pathname);
    }
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const role = token.role;
  if (!role) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Define role-based route access
  const roleRoutes: Record<string, RegExp> = {
    NORMAL_USER: /^\/(dashboard(\/findTherapist)?|sessions(\/my-requests|\/request|\/|$)|profile\/create|patient\/find-therapist)/,
    THERAPIST: /^\/therapist\/(dashboard|verification|profile(\/setup)?|patients(\/new|\/[^\/]+)?|sessions(\/[^\/]+)?|setAvailability|assessments(\/new|\/[^\/]+)?|messages|blogs(\/new|\/[^\/]+|\/[^\/]+\/edit)?|appointments(\/new)?|assignment-requests|requests)/,
    MANAGER: /^\/manager\/(dashboard|applications|assessments(\/new|\/[^\/]+)?|verification|users|sessions|games)/,
    PARENT_GUARDIAN: /^\/parent\//,
    ADMIN: /^\/admin\//,
  };

  // Check if user is accessing a route not allowed for their role
  let allowed = false;
  if (role === "NORMAL_USER" && roleRoutes.NORMAL_USER.test(pathname))
    allowed = true;
  if (role === "THERAPIST" && roleRoutes.THERAPIST.test(pathname))
    allowed = true;
  if (role === "MANAGER" && roleRoutes.MANAGER.test(pathname))
    allowed = true;
  if (role === "PARENT_GUARDIAN" && roleRoutes.PARENT_GUARDIAN.test(pathname))
    allowed = true;
  if (role === "ADMIN" && roleRoutes.ADMIN.test(pathname)) allowed = true;

  // Allow access to /profile/create for NORMAL_USER
  if (role === "NORMAL_USER" && pathname.startsWith("/profile/create"))
    allowed = true;

  if (!allowed && !isApiRoute(pathname)) {
    // Redirect to their dashboard
    const dashboard = getRoleBasedDashboard(role);
    return NextResponse.redirect(new URL(dashboard, req.url));
  } // User onboarding: check if NORMAL_USER has a profile when accessing dashboard
  // (Removed API call from middleware. Move this logic to the dashboard page/server component.)

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public|images).*)"],
};
