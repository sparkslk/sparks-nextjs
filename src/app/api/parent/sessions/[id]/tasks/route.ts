import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    // Fetch all tasks for the session from the database
    const dbTasks = await prisma.task.findMany({
      where: { sessionid: id },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
    return NextResponse.json({ success: true, tasks: dbTasks });
  } catch (error) {
    console.error('Error fetching session tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
