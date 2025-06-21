import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getRoleBasedDashboard } from '@/lib/role-redirect';

const PUBLIC_PATHS = [
    '/',
    '/login',
    '/signup',
    '/api/auth',
    '/api/auth/',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/providers',
    '/api/auth/csrf',
    '/api/auth/error',
];

function isPublicPath(path: string) {
    return PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(publicPath + '/'));
}

function isApiRoute(path: string) {
    return path.startsWith('/api/');
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection
    const role = token.role;
    if (!role) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Define role-based route access
    const roleRoutes: Record<string, RegExp> = {
        NORMAL_USER: /^\/dashboard(\/|$)/,
        THERAPIST: /^\/therapist\//,
        PARENT_GUARDIAN: /^\/parent\//,
        ADMIN: /^\/admin\//,
    };

    // Check if user is accessing a route not allowed for their role
    let allowed = false;
    if (role === 'NORMAL_USER' && roleRoutes.NORMAL_USER.test(pathname)) allowed = true;
    if (role === 'THERAPIST' && roleRoutes.THERAPIST.test(pathname)) allowed = true;
    if (role === 'PARENT_GUARDIAN' && roleRoutes.PARENT_GUARDIAN.test(pathname)) allowed = true;
    if (role === 'ADMIN' && roleRoutes.ADMIN.test(pathname)) allowed = true;

    // Allow access to /profile/create for NORMAL_USER
    if (role === 'NORMAL_USER' && pathname.startsWith('/profile/create')) allowed = true;

    if (!allowed && !isApiRoute(pathname)) {
        // Redirect to their dashboard
        const dashboard = getRoleBasedDashboard(role);
        return NextResponse.redirect(new URL(dashboard, req.url));
    }

    // Patient onboarding: check if NORMAL_USER has a profile
    if (role === 'NORMAL_USER' && pathname === '/dashboard') {
        // Call API to check profile status
        try {
            const res = await fetch(`${req.nextUrl.origin}/api/user/profile-status`, {
                headers: { 'Authorization': `Bearer ${token.sub}` },
            });
            if (res.ok) {
                const { hasProfile } = await res.json();
                if (!hasProfile) {
                    const createProfileUrl = new URL('/profile/create', req.url);
                    createProfileUrl.searchParams.set('reason', 'new_user');
                    return NextResponse.redirect(createProfileUrl);
                }
            } else {
                // Log error and continue
                console.error('API error:', res.status, await res.text());
            }
        } catch (error) {
            console.error('Failed to parse JSON or fetch profile status:', error);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|favicon.ico|public|images).*)',
    ],
};
