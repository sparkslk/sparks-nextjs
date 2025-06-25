import { NextResponse } from "next/server";

export async function POST() {
    try {

        // Clear all NextAuth cookies
        const nextAuthCookies = [
            'next-auth.session-token',
            'next-auth.csrf-token',
            'next-auth.callback-url',
            'next-auth.state',
            '__Secure-next-auth.session-token', // For HTTPS
            '__Host-next-auth.csrf-token', // For HTTPS
        ];

        const response = NextResponse.json({ success: true });

        // Clear each cookie
        nextAuthCookies.forEach(cookieName => {
            response.cookies.set({
                name: cookieName,
                value: '',
                expires: new Date(0),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        });

        // Also clear any custom session storage
        response.cookies.set({
            name: 'sparks-session',
            value: '',
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
