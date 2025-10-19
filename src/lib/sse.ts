// Extend global interface for TypeScript
interface NotificationData {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    isUrgent: boolean;
    senderId?: string;
    receiverId: string;
    createdAt: string;
    updatedAt: string;
}

// Define the type for our global notification streams
type NotificationStreamMap = Map<string, {
    controller: ReadableStreamDefaultController;
    encoder: TextEncoder
}>;

// Add property to globalThis
declare global {
    var notificationStreams: NotificationStreamMap | undefined;
}

// Utility function to send notifications to connected clients
export function sendNotificationToUser(userId: string, notification: NotificationData) {
    const streams: NotificationStreamMap | undefined = global.notificationStreams;
    const userStream = streams?.get(userId);

    if (userStream) {
        try {
            const data = `data: ${JSON.stringify(notification)}\n\n`;
            userStream.controller.enqueue(userStream.encoder.encode(data));
        } catch (error) {
            console.error("Failed to send notification to user:", error);
            // Remove dead connection
            if (streams) {
                streams.delete(userId);
            }
        }
    }
}

// Initialize global streams map if it doesn't exist
export function initializeSSEStreams(): NotificationStreamMap {
    if (!global.notificationStreams) {
        global.notificationStreams = new Map();
    }
    return global.notificationStreams;
}

// Add a stream for a user
export function addUserStream(userId: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
    const streams = initializeSSEStreams();
    streams.set(userId, { controller, encoder });
}

// Remove a stream for a user
export function removeUserStream(userId: string) {
    const streams: NotificationStreamMap | undefined = global.notificationStreams;
    if (streams) {
        streams.delete(userId);
    }
}
