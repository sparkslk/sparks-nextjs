"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    isUrgent: boolean;
    sender?: {
        name: string;
        email: string;
    };
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch("/api/notifications");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch("/api/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "POST",
            });

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "APPOINTMENT":
                return <Clock className="h-4 w-4 text-blue-500" />;
            case "REMINDER":
                return <Bell className="h-4 w-4 text-yellow-500" />;
            case "SYSTEM":
                return <User className="h-4 w-4 text-green-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return "Just now";
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between px-2 py-1">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-6"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 cursor-pointer ${!notification.isRead ? "bg-blue-50 dark:bg-blue-950" : ""
                                    }`}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <div className="flex items-start space-x-3 w-full">
                                    {getNotificationIcon(notification.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">{notification.message}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 10 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center text-sm text-muted-foreground">
                            View all notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
