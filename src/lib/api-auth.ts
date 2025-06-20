import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function requireApiAuth(req: NextRequest, allowedRoles?: string[]) {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (allowedRoles && !allowedRoles.includes(session.user.role ?? '')) {
        throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return session;
}
