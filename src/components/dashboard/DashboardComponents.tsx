"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    Calendar,
    Clock,
    TrendingUp,
    Activity,
    CheckCircle,
    AlertCircle,
    XCircle
} from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<any>;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "default" | "primary" | "success" | "warning" | "danger";
}

export function StatCard({ title, value, description, icon: Icon, trend, color = "default" }: StatCardProps) {
    const colorClasses = {
        default: "bg-card",
        primary: "bg-primary/10 border-primary/20",
        success: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
        warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
        danger: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
    };

    return (
        <Card className={`transition-all hover:shadow-md ${colorClasses[color]}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
                {trend && (
                    <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`mr-1 h-3 w-3 ${!trend.isPositive ? 'rotate-180' : ''
                            }`} />
                        {Math.abs(trend.value)}% from last month
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    variant?: "default" | "primary" | "secondary";
}

export function QuickActionCard({ title, description, icon: Icon, onClick, variant = "default" }: QuickActionProps) {
    return (
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-105" onClick={onClick}>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="text-sm">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}

interface RecentActivityItem {
    id: string;
    type: "session" | "task" | "assessment" | "notification";
    title: string;
    description: string;
    time: string;
    status?: "completed" | "pending" | "cancelled";
}

interface RecentActivityProps {
    activities: RecentActivityItem[];
    title?: string;
}

export function RecentActivity({ activities, title = "Recent Activity" }: RecentActivityProps) {
    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "cancelled":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Activity className="h-4 w-4 text-blue-500" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "session":
                return <Calendar className="h-4 w-4" />;
            case "task":
                return <CheckCircle className="h-4 w-4" />;
            case "assessment":
                return <Activity className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                                {getTypeIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium truncate">{activity.title}</p>
                                    <div className="flex items-center space-x-2">
                                        {activity.status && getStatusIcon(activity.status)}
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

interface UpcomingAppointment {
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: "scheduled" | "confirmed" | "pending";
}

interface UpcomingAppointmentsProps {
    appointments: UpcomingAppointment[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
    const getStatusBadge = (status: string) => {
        const variants = {
            scheduled: "secondary",
            confirmed: "default",
            pending: "destructive"
        } as const;

        return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                ) : (
                    appointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div>
                                <p className="font-medium">{appointment.patientName}</p>
                                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{appointment.time}</p>
                                {getStatusBadge(appointment.status)}
                            </div>
                        </div>
                    ))
                )}
                <Button variant="outline" className="w-full mt-4">
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Appointments
                </Button>
            </CardContent>
        </Card>
    );
}
