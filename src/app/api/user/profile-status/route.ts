import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    // Get user id from token (middleware sends as Bearer <userId>)
    const authHeader = req.headers.get('authorization');
    const userId = authHeader?.split(' ')[1];
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if patient profile exists
    const patient = await prisma.patient.findUnique({
        where: { userId },
        select: { id: true },
    });

    return NextResponse.json({ hasProfile: !!patient });
}
