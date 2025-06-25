"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'APPOINTMENT' | 'REMINDER' | 'TASK' | 'SYSTEM' | 'EMERGENCY';
    isRead: boolean;
    isUrgent: boolean;
    senderId?: string | null;
    receiverId: string;
    sender?: {
        name: string;
        email: string;
    };
    recipient?: {
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isSidebarOpen: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    toggleSidebar: () => void;
    closeSidebar: () => void;
    openSidebar: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lastNotificationCount, setLastNotificationCount] = useState(0);
    const [sseEnabled, setSseEnabled] = useState(true); // Flag to enable/disable SSE

    const openSidebar = useCallback(() => {
        setIsSidebarOpen(true);
    }, []);

    const showNotificationToast = useCallback((notification: Notification) => {
        const toastOptions = {
            description: notification.message,
            action: notification.isUrgent ? {
                label: 'View',
                onClick: () => openSidebar(),
            } : undefined,
        };

        switch (notification.type) {
            case 'EMERGENCY':
                toast.error(notification.title, toastOptions);
                break;
            case 'APPOINTMENT':
                toast.info(notification.title, toastOptions);
                break;
            case 'REMINDER':
                toast.warning(notification.title, toastOptions);
                break;
            case 'TASK':
                toast.success(notification.title, toastOptions);
                break;
            default:
                toast(notification.title, toastOptions);
        }
    }, [openSidebar]);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            const newNotifications = data.notifications || [];
            const newUnreadCount = newNotifications.filter((n: Notification) => !n.isRead).length;

            if (newNotifications.length > lastNotificationCount && lastNotificationCount > 0) {
                const newNotifs = newNotifications.slice(0, newNotifications.length - lastNotificationCount);
                newNotifs.forEach((notification: Notification) => {
                    if (!notification.isRead) {
                        showNotificationToast(notification);
                    }
                });
            }

            setNotifications(newNotifications);
            setUnreadCount(newUnreadCount);
            setLastNotificationCount(newNotifications.length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [lastNotificationCount, showNotificationToast]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    // Fetch notifications on mount and set up polling
    useEffect(() => {
        fetchNotifications();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Set up real-time notifications using Server-Sent Events (SSE)
    useEffect(() => {
        // Skip SSE if disabled
        if (!sseEnabled) {
            return;
        }

        let eventSource: EventSource | null = null;
        let retryTimeout: NodeJS.Timeout | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        const connectSSE = () => {
            try {
                eventSource = new EventSource('/api/notifications/stream');

                eventSource.onopen = () => {
                    console.log('SSE connection established');
                    retryCount = 0; // Reset retry count on successful connection
                };

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        // Handle different message types
                        if (data.type === 'connected' || data.type === 'heartbeat') {
                            // These are connection/heartbeat messages, ignore them
                            return;
                        }

                        // This is an actual notification
                        if (data.id && data.title && data.message) {
                            setNotifications(prev => [data, ...prev]);
                            if (!data.isRead) {
                                setUnreadCount(prev => prev + 1);
                                showNotificationToast(data);
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing SSE data:', error);
                    }
                };

                eventSource.onerror = () => {
                    console.warn('SSE connection lost, will retry if possible');
                    eventSource?.close();

                    // Only retry if we haven't exceeded max retries
                    if (retryCount < maxRetries) {
                        retryCount++;
                        retryTimeout = setTimeout(() => {
                            console.log(`Retrying SSE connection (attempt ${retryCount}/${maxRetries})`);
                            connectSSE();
                        }, 5000 * retryCount); // Exponential backoff
                    } else {
                        console.log('Max SSE retry attempts reached, disabling SSE for this session');
                        setSseEnabled(false); // Disable SSE for this session
                    }
                };

            } catch (error) {
                console.error('Failed to establish SSE connection:', error);
                setSseEnabled(false); // Disable SSE if there's an error
            }
        };

        // Try to establish SSE connection
        connectSSE();

        return () => {
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [sseEnabled, showNotificationToast]);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isLoading,
        isSidebarOpen,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        toggleSidebar,
        closeSidebar,
        openSidebar,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
