"use client";

import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
    className?: string;
    variant?: "default" | "ghost" | "outline";
    size?: "default" | "sm" | "lg" | "icon";
}

export default function NotificationBell({
    className,
    variant = "ghost",
    size = "icon"
}: NotificationBellProps) {
    const { unreadCount, toggleSidebar, isLoading } = useNotifications();

    return (
        <Button
            variant={variant}
            size={size}
            onClick={toggleSidebar}
            className={cn("relative", className)}
            disabled={isLoading}
        >
            <Bell className={cn(
                "h-5 w-5",
                unreadCount > 0 && "animate-pulse"
            )} />
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px] animate-bounce"
                >
                    {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
            )}
            <span className="sr-only">
                {unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
            </span>
        </Button>
    );
}
