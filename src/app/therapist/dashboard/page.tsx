"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    StatCard,
    QuickActionCard,
    RecentActivity,
    UpcomingAppointments
} from "@/components/dashboard/DashboardComponents";
import {
    Users,
    Calendar,
    ClipboardList,
    UserPlus,
    FileText,
    Clock,
    CheckCircle,
    Bell
} from "lucide-react";

interface TherapistStats {
    totalPatients: number;
    todayAppointments: number;
    completedSessions: number;
    pendingTasks: number;
}

interface Activity {
    id: string;
    type: "session" | "task" | "assessment" | "notification";
    title: string;
    description: string;
    time: string;
    status?: "completed" | "pending" | "cancelled";
}

interface Appointment {
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: "scheduled" | "confirmed" | "pending";
}

interface TherapistDashboardData {
    stats: TherapistStats;
    recentActivities: Activity[];
    upcomingAppointments: Appointment[];
}

export default function TherapistDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<TherapistStats>({
        totalPatients: 0,
        todayAppointments: 0,
        completedSessions: 0,
        pendingTasks: 0
    });
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Timezone-safe date and time formatting functions
    const formatDateTime = (dateString: string) => {
        // Parse the date string manually to avoid timezone conversion issues
        if (dateString.includes('T')) {
            // Handle ISO format (2025-10-31T18:30:00 or 2025-10-31T18:30:00Z)
            const [datePart, timePart] = dateString.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            
            const timeOnly = timePart.split('.')[0].split('Z')[0]; // Remove milliseconds and Z
            const [hours, minutes] = timeOnly.split(':').map(Number);
            
            // Create date in local timezone without conversion
            const parsedDate = new Date(year, month - 1, day, hours, minutes);
            
            return parsedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            // Fallback for other formats
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    // Helper function to parse appointment datetime safely without timezone conversion
    const parseAppointmentDateTime = (dateString: string): Date => {
        if (dateString.includes('T')) {
            // Handle ISO format (2025-10-31T18:30:00 or 2025-10-31T18:30:00Z)
            const [datePart, timePart] = dateString.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            
            const timeOnly = timePart.split('.')[0].split('Z')[0]; // Remove milliseconds and Z
            const [hours, minutes, seconds = 0] = timeOnly.split(':').map(Number);
            
            // Create date in local timezone without conversion
            return new Date(year, month - 1, day, hours, minutes, seconds);
        } else {
            // Fallback for other formats
            return new Date(dateString);
        }
    };

    // Check if appointment is in the future
    const isAppointmentUpcoming = (appointmentTime: string): boolean => {
        const appointmentDate = parseAppointmentDateTime(appointmentTime);
        const now = new Date();
        return appointmentDate > now;
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setError(null);
                const res = await fetch("/api/therapist/dashboard");
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Therapist profile not found. Please contact administration.");
                    }
                    throw new Error(`Failed to fetch dashboard data: ${res.status}`);
                }
                const data: TherapistDashboardData = await res.json();

                setStats(data.stats);
                setRecentActivities(data.recentActivities || []);

                // Filter only upcoming appointments (future sessions) and format their times
                const upcomingOnly = (data.upcomingAppointments || [])
                    .filter(apt => isAppointmentUpcoming(apt.time))
                    .map(apt => ({
                        ...apt,
                        time: formatDateTime(apt.time)
                    }));
                setUpcomingAppointments(upcomingOnly);

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const quickActions = [
        {
            title: "View Sessions",
            description: "See all your upcoming and past therapy sessions",
            icon: Bell,
            onClick: () => router.push("/therapist/sessions")
        },
        {
            title: "Set Availability",
            description: "Update your available time slots for sessions",
            icon: Calendar,
            onClick: () => router.push("/therapist/setAvailability")
        },
        {
            title: "View Patients",
            description: "Browse and manage your patients",
            icon: UserPlus,
            onClick: () => router.push("/therapist/patients")
        },
        {
            title: "View Assessments",
            description: "Access and manage assessments",
            icon: ClipboardList,
            onClick: () => router.push("/therapist/assessments")
        },
        {
            title: "View Reports",
            description: "Review and generate patient progress reports",
            icon: FileText,
            onClick: () => router.push("/therapist/reports")
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/therapist')}
                            className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary">
                        Therapist Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your patients and sessions efficiently
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        description="Active patients under your care"
                        icon={Users}
                        trend={{ value: 12, isPositive: true }}
                        color="primary"
                    />
                    <StatCard
                        title="Today's Sessions"
                        value={stats.todayAppointments}
                        description="Scheduled sessions for today"
                        icon={Calendar}
                        color="primary"
                    />
                    <StatCard
                        title="Completed Sessions"
                        value={stats.completedSessions}
                        description="This month"
                        icon={CheckCircle}
                        trend={{ value: 8, isPositive: true }}
                        color="primary"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {quickActions.map((action, index) => (
                            <QuickActionCard
                                key={index}
                                title={action.title}
                                description={action.description}
                                icon={action.icon}
                                onClick={action.onClick}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Upcoming Appointments */}
                    <div className="xl:col-span-1">
                        <UpcomingAppointments appointments={upcomingAppointments} />
                    </div>

                    {/* Right Column - Recent Activity */}
                    <div className="xl:col-span-2">
                        <RecentActivity
                            activities={recentActivities.map(activity => ({
                                ...activity,
                                time: formatDateTime(activity.time)
                            }))}
                            title="Recent Activity"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}