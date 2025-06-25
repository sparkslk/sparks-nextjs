"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";

export default function NotificationBell() {
    const { unreadCount, openSidebar } = useNotifications();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted/80 transition-colors"
            onClick={openSidebar}
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px] animate-pulse"
                >
                    {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
            )}
        </Button>
    );
}
