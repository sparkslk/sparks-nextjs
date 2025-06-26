"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Clock, AlertTriangle, Calendar, Settings, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationSidebarProps {
    className?: string;
}

export function NotificationSidebar({ className }: NotificationSidebarProps) {
    const {
        notifications,
        unreadCount,
        isLoading,
        isSidebarOpen,
        markAsRead,
        markAllAsRead,
        closeSidebar,
    } = useNotifications();

    const getNotificationIcon = (type: string, isUrgent: boolean) => {
        const iconClass = cn(
            "h-4 w-4",
            isUrgent ? "text-red-500" : "text-muted-foreground"
        );

        switch (type) {
            case 'APPOINTMENT':
                return <Calendar className={iconClass} />;
            case 'REMINDER':
                return <Clock className={iconClass} />;
            case 'TASK':
                return <CheckCircle className={iconClass} />;
            case 'EMERGENCY':
                return <AlertTriangle className={cn(iconClass, "text-red-500")} />;
            case 'SYSTEM':
                return <Settings className={iconClass} />;
            default:
                return <Bell className={iconClass} />;
        }
    };

    const getTypeColor = (type: string, isUrgent: boolean) => {
        if (isUrgent) return "destructive";

        switch (type) {
            case 'APPOINTMENT':
                return "default";
            case 'REMINDER':
                return "secondary";
            case 'TASK':
                return "outline";
            case 'EMERGENCY':
                return "destructive";
            case 'SYSTEM':
                return "secondary";
            default:
                return "default";
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={closeSidebar}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                            duration: 0.3
                        }}
                        className={cn(
                            "fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 shadow-2xl",
                            className
                        )}
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Bell className="h-5 w-5 text-primary" />
                                        {unreadCount > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                            >
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                                                >
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Notifications</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={closeSidebar}
                                    className="h-8 w-8 hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </motion.div>

                            {/* Actions */}
                            {unreadCount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, duration: 0.3 }}
                                    className="p-4 border-b border-border"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="w-full hover:bg-primary/10 transition-colors"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Mark all as read
                                    </Button>
                                </motion.div>
                            )}

                            {/* Notifications List */}
                            <div className="flex-1 overflow-y-auto">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                    className="p-4 space-y-4"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                                            />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.4 }}
                                            className="flex flex-col items-center justify-center py-12 text-center"
                                        >
                                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                                                <Bell className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                                            <p className="text-muted-foreground text-sm">
                                                We&rsquo;ll notify you when something important happens.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        notifications.map((notification, index) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                transition={{
                                                    delay: 0.1 + (index * 0.05),
                                                    duration: 0.3,
                                                    type: "spring",
                                                    stiffness: 300
                                                }}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Card
                                                    className={cn(
                                                        "cursor-pointer transition-all duration-200 hover:shadow-lg",
                                                        !notification.isRead && "border-l-4 border-l-primary bg-primary/5",
                                                        notification.isUrgent && "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
                                                    )}
                                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                                >
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-2">
                                                                {getNotificationIcon(notification.type, notification.isUrgent)}
                                                                <Badge
                                                                    variant={getTypeColor(notification.type, notification.isUrgent)}
                                                                    className="text-xs"
                                                                >
                                                                    {notification.type.toLowerCase()}
                                                                </Badge>
                                                                {notification.isUrgent && (
                                                                    <motion.div
                                                                        animate={{
                                                                            scale: [1, 1.1, 1],
                                                                        }}
                                                                        transition={{
                                                                            duration: 2,
                                                                            repeat: Infinity,
                                                                            ease: "easeInOut"
                                                                        }}
                                                                    >
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            Urgent
                                                                        </Badge>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {formatTimeAgo(notification.createdAt)}
                                                            </span>
                                                        </div>
                                                        <CardTitle className={cn(
                                                            "text-sm leading-tight",
                                                            !notification.isRead && "font-semibold"
                                                        )}>
                                                            {notification.title}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <CardDescription className="text-sm leading-relaxed">
                                                            {notification.message}
                                                        </CardDescription>
                                                        {notification.sender && (
                                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    From: {notification.sender.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {!notification.isRead && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="flex items-center gap-1 mt-2"
                                                            >
                                                                <motion.div
                                                                    animate={{
                                                                        scale: [1, 1.3, 1],
                                                                        opacity: [0.7, 1, 0.7]
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut"
                                                                    }}
                                                                    className="w-2 h-2 bg-primary rounded-full"
                                                                />
                                                                <span className="text-xs text-muted-foreground">New</span>
                                                            </motion.div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
