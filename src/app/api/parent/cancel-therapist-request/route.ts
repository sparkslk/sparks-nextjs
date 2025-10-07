import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
    try {
        // Get the session to verify the user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized - No session found' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const requestId = searchParams.get('requestId');

        if (!requestId) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        // Find the assignment request
        const assignmentRequest = await prisma.therapistAssignmentRequest.findUnique({
            where: {
                id: requestId
            },
            include: {
                patient: {
                    include: {
                        parentGuardians: true
                    }
                },
                therapist: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!assignmentRequest) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 }
            );
        }

        // Verify that the current user is the parent of the patient
        const isParent = assignmentRequest.patient.parentGuardians.some(
            pg => pg.userId === session.user.id
        );

        if (!isParent) {
            return NextResponse.json(
                { error: 'Unauthorized - Not the parent of this patient' },
                { status: 403 }
            );
        }

        // Only allow cancellation if the request is still pending
        if (assignmentRequest.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Can only cancel pending requests' },
                { status: 400 }
            );
        }

        // Delete the assignment request (using deleteMany for safer operation)
        const deleteResult = await prisma.therapistAssignmentRequest.deleteMany({
            where: {
                id: requestId,
                status: 'PENDING' // Extra safety check
            }
        });

        // Check if any record was actually deleted
        if (deleteResult.count === 0) {
            return NextResponse.json(
                { error: 'Request not found or already processed' },
                { status: 404 }
            );
        }

        // Create a notification for the therapist about the cancellation
        await prisma.notification.create({
            data: {
                senderId: session.user.id,
                receiverId: assignmentRequest.therapist.userId,
                type: 'SYSTEM',
                title: 'Assignment Request Cancelled',
                message: `The assignment request for patient ${assignmentRequest.patient.firstName} ${assignmentRequest.patient.lastName || ''} has been cancelled by the parent.`,
                isUrgent: false
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Request cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling therapist assignment request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}