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

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch("/api/therapist/dashboard");
                if (!res.ok) throw new Error("Failed to fetch dashboard data");
                const data = await res.json();
                setStats(data.stats);
                setRecentActivities(data.recentActivities || []);
                setUpcomingAppointments(data.upcomingAppointments || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const quickActions = [
        {
            title: "Session Requests",
            description: "Review and approve session requests",
            icon: Bell,
            onClick: () => router.push("/therapist/requests")
        },
        {
            title: "Schedule Appointment",
            description: "Book a new therapy session",
            icon: Calendar,
            onClick: () => router.push("/therapist/appointments/new")
        },
        {
            title: "Add New Patient",
            description: "Register a new patient",
            icon: UserPlus,
            onClick: () => router.push("/therapist/patients/new")
        },
        {
            title: "Create Assessment",
            description: "Design a new assessment form",
            icon: ClipboardList,
            onClick: () => router.push("/therapist/assessments/new")
        },
        {
            title: "View Reports",
            description: "Generate patient progress reports",
            icon: FileText,
            onClick: () => router.push("/therapist/reports")
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    description="Active patients under your care"
                    icon={Users}
                    trend={{ value: 12, isPositive: true }}
                    color="primary"
                />
                <StatCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    description="Scheduled sessions for today"
                    icon={Calendar}
                    color="success"
                />
                <StatCard
                    title="Completed Sessions"
                    value={stats.completedSessions}
                    description="This month"
                    icon={CheckCircle}
                    trend={{ value: 8, isPositive: true }}
                    color="default"
                />
                <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    description="Assessments and reviews"
                    icon={Clock}
                    color="warning"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Upcoming Appointments */}
                <div className="lg:col-span-1">
                    <UpcomingAppointments appointments={upcomingAppointments} />
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-2">
                    <RecentActivity activities={recentActivities} />
                </div>
            </div>
        </div>
    );
}
