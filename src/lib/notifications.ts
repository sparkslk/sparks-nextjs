import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

// Import the SSE function from the separated utility
import { sendNotificationToUser } from '@/lib/sse';

interface CreateNotificationParams {
    title: string;
    message: string;
    type: NotificationType;
    receiverId: string;
    senderId?: string;
    isUrgent?: boolean;
}

interface SessionDetails {
    scheduledAt: string | Date;
}

interface TaskDetails {
    title: string;
}

export async function createNotification({
    title,
    message,
    type,
    receiverId,
    senderId,
    isUrgent = false
}: CreateNotificationParams) {
    try {
        // Create notification in database
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type,
                receiverId,
                senderId,
                isUrgent,
                isRead: false
            }
        });

        // Send real-time notification via SSE
        const notificationData = {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: notification.isRead,
            isUrgent: notification.isUrgent,
            senderId: notification.senderId || undefined,
            receiverId: notification.receiverId,
            createdAt: notification.createdAt.toISOString(),
            updatedAt: notification.updatedAt.toISOString()
        };

        // Send to connected client via SSE
        sendNotificationToUser(receiverId, notificationData);

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
}

// Helper functions for common notification types
export async function notifySessionApproved(patientId: string, therapistId: string, sessionDetails: SessionDetails) {
    return createNotification({
        title: 'Session Approved',
        message: `Your therapy session has been approved and scheduled for ${new Date(sessionDetails.scheduledAt).toLocaleDateString()}.`,
        type: 'APPOINTMENT',
        receiverId: patientId,
        senderId: therapistId,
        isUrgent: false
    });
}

export async function notifySessionRequested(therapistId: string, patientId: string) {
    return createNotification({
        title: 'New Session Request',
        message: `You have received a new session request that requires your review.`,
        type: 'APPOINTMENT',
        receiverId: therapistId,
        senderId: patientId,
        isUrgent: false
    });
}

export async function notifySessionReminder(userId: string, sessionDetails: SessionDetails) {
    return createNotification({
        title: 'Session Reminder',
        message: `Your therapy session is scheduled for tomorrow at ${new Date(sessionDetails.scheduledAt).toLocaleTimeString()}.`,
        type: 'REMINDER',
        receiverId: userId,
        isUrgent: false
    });
}

export async function notifyTaskAssigned(patientId: string, therapistId: string, taskDetails: TaskDetails) {
    return createNotification({
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${taskDetails.title}`,
        type: 'TASK',
        receiverId: patientId,
        senderId: therapistId,
        isUrgent: false
    });
}

export async function notifyEmergency(userId: string, message: string, senderId?: string) {
    return createNotification({
        title: 'Emergency Alert',
        message,
        type: 'EMERGENCY',
        receiverId: userId,
        senderId,
        isUrgent: true
    });
}

export async function notifySessionRescheduleRequest(
    patientId: string, 
    therapistId: string, 
    sessionDetails: SessionDetails, 
    reason: string
) {
    const scheduledDate = new Date(sessionDetails.scheduledAt);
    return createNotification({
        title: 'Session Reschedule Request',
        message: `Your therapist has requested to reschedule your session scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}. Reason: ${reason}. Please check your appointments to select a new time slot.`,
        type: 'APPOINTMENT',
        receiverId: patientId,
        senderId: therapistId,
        isUrgent: true
    });
}

export async function notifySystemMessage(userId: string, title: string, message: string) {
    return createNotification({
        title,
        message,
        type: 'SYSTEM',
        receiverId: userId,
        isUrgent: false
    });
}
