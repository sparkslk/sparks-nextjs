import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface DatabaseTask {
  id: string;
  patientId: string;
  title: string;
  description: string;
  instructions: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: number;
  isRecurring: boolean;
  recurringPattern: string | null;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  completionNotes: string | null;
}

interface TransformedTask extends Omit<DatabaseTask, 'dueDate' | 'createdAt' | 'updatedAt' | 'completedAt'> {
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { childId } = await params;

    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    // Verify that the current user is authorized to view this child's tasks
    const parentGuardianRelation = await prisma.parentGuardian.findFirst({
      where: {
        userId: session.user.id,
        patientId: childId
      }
    });

    if (!parentGuardianRelation) {
      return NextResponse.json({ error: 'Child not found or unauthorized' }, { status: 404 });
    }

    // Fetch all tasks for the child from the database
    const dbTasks = await prisma.task.findMany({
      where: {
        patientId: childId
      },
      orderBy: [
        {
          // Order by status priority (overdue first, then pending, in progress, completed)
          status: 'asc'
        },
        {
          priority: 'desc'
        },
        {
          dueDate: 'asc'
        }
      ]
    });

    // Transform the tasks to ensure proper date formatting and status handling
    const tasks: TransformedTask[] = dbTasks.map((task) => {
      // Check if task is overdue
      const isOverdue = task.dueDate !== null && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
      
      return {
        id: task.id,
        patientId: task.patientId,
        title: task.title,
        description: task.description || '',
        instructions: task.instructions || '',
        status: isOverdue ? 'OVERDUE' : (task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'),
        priority: task.priority,
        isRecurring: task.isRecurring,
        recurringPattern: task.recurringPattern,
        dueDate: task.dueDate ? task.dueDate.toISOString() : '',
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        completedAt: task.completedAt ? task.completedAt.toISOString() : null,
        completionNotes: task.completionNotes,
      };
    });

    // Calculate statistics
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
    const overdueTasks = tasks.filter((t) => t.status === 'OVERDUE').length;

    return NextResponse.json({
      success: true,
      tasks: tasks,
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}