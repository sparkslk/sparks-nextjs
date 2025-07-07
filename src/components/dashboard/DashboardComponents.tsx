"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "default" | "primary" | "success" | "warning" | "danger";
}

export function StatCard({ title, value, description, icon: Icon, trend, color = "default" }: StatCardProps) {
    const colorClasses = {
        default: "bg-card/95 backdrop-blur border-0 shadow-lg",
        primary: "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg backdrop-blur",
        success: "bg-gradient-to-r from-green-50/95 to-green-100/50 border-green-200/50 shadow-lg backdrop-blur dark:from-green-950/95 dark:to-green-900/50 dark:border-green-800/50",
        warning: "bg-gradient-to-r from-yellow-50/95 to-yellow-100/50 border-yellow-200/50 shadow-lg backdrop-blur dark:from-yellow-950/95 dark:to-yellow-900/50 dark:border-yellow-800/50",
        danger: "bg-gradient-to-r from-red-50/95 to-red-100/50 border-red-200/50 shadow-lg backdrop-blur dark:from-red-950/95 dark:to-red-900/50 dark:border-red-800/50"
    };

    const iconColorClasses = {
        default: "text-primary",
        primary: "text-primary",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        danger: "text-red-600 dark:text-red-400"
    };

    return (
        <Card className={`transition-all duration-300 hover:shadow-xl hover:scale-105 ${colorClasses[color]}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="p-2 bg-background/50 rounded-lg">
                    <Icon className={`h-4 w-4 ${iconColorClasses[color]}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className={`flex items-center text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'
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
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
    variant?: "default" | "primary" | "secondary";
}

export function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionProps) {
    return (
        <Card className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-card/95 backdrop-blur group" onClick={onClick}>
            <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full group-hover:from-primary/30 group-hover:to-purple-500/30 transition-all">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1">{description}</CardDescription>
                    </div>
                </div>
            </CardContent>
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
                return <Calendar className="h-4 w-4 text-primary" />;
            case "task":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "assessment":
                return <Activity className="h-4 w-4 text-blue-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-4">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No recent activity</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50 hover:shadow-md transition-all">
                            <div className="flex-shrink-0 mt-1 p-2 bg-background/50 rounded-lg">
                                {getTypeIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium truncate">{activity.title}</p>
                                    <div className="flex items-center space-x-2">
                                        {activity.status && getStatusIcon(activity.status)}
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
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
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your next scheduled therapy sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No upcoming sessions</p>
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
                <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => window.location.href = '/therapist/sessions'}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Sessions
                </Button>
            </CardContent>
        </Card>
    );
}
