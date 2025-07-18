import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { childId, taskId } = await params;
    const body = await request.json();
    const { completionNotes, unmark } = body;

    if (!childId || !taskId) {
      return NextResponse.json({ error: 'Child ID and Task ID are required' }, { status: 400 });
    }

    // Verify that the current user is authorized to access this child
    const parentGuardianRelation = await prisma.parentGuardian.findFirst({
      where: {
        userId: session.user.id,
        patientId: childId
      }
    });

    if (!parentGuardianRelation) {
      return NextResponse.json({ error: 'Child not found or unauthorized' }, { status: 404 });
    }

    let updatedTask;
    if (unmark) {
      // Unmark the task as completed
      updatedTask = await prisma.task.update({
        where: {
          id: taskId,
          patientId: childId
        },
        data: {
          status: 'PENDING',
          completedAt: null,
          completionNotes: null,
          updatedAt: new Date()
        }
      });
    } else {
      // Mark the task as completed
      updatedTask = await prisma.task.update({
        where: {
          id: taskId,
          patientId: childId // Ensure the task belongs to the correct child
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completionNotes: completionNotes || null,
          updatedAt: new Date()
        }
      });
    }

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: unmark ? 'Task unmarked as completed' : 'Task marked as completed',
      task: {
        id: updatedTask.id,
        patientId: updatedTask.patientId,
        title: updatedTask.title,
        description: updatedTask.description,
        instructions: updatedTask.instructions,
        status: updatedTask.status,
        priority: updatedTask.priority,
        isRecurring: updatedTask.isRecurring,
        recurringPattern: updatedTask.recurringPattern,
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : new Date().toISOString(),
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
        completedAt: updatedTask.completedAt ? updatedTask.completedAt.toISOString() : null,
        completionNotes: updatedTask.completionNotes
      }
    });

  } catch (error) {
    console.error('Error updating task:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}