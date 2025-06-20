"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    StatCard,
    QuickActionCard,
    RecentActivity,
    UpcomingAppointments
} from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Calendar,
    ClipboardList,
    TrendingUp,
    UserPlus,
    FileText,
    Activity,
    Clock,
    CheckCircle
} from "lucide-react";

interface TherapistStats {
    totalPatients: number;
    todayAppointments: number;
    completedSessions: number;
    pendingTasks: number;
}

export default function TherapistDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<TherapistStats>({
        totalPatients: 0,
        todayAppointments: 0,
        completedSessions: 0,
        pendingTasks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            // TODO: Fetch actual data from API
            // Simulated data for now
            setStats({
                totalPatients: 24,
                todayAppointments: 5,
                completedSessions: 18,
                pendingTasks: 7
            });
            setLoading(false);
        }
    }, [status, router]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    // Sample data - replace with actual API calls
    const recentActivities = [
        {
            id: "1",
            type: "session" as const,
            title: "Therapy Session with Sarah Johnson",
            description: "Individual cognitive behavioral therapy session",
            time: "2 hours ago",
            status: "completed" as const
        },
        {
            id: "2",
            type: "assessment" as const,
            title: "Initial Assessment - Michael Chen",
            description: "Comprehensive psychological evaluation",
            time: "5 hours ago",
            status: "completed" as const
        },
        {
            id: "3",
            type: "task" as const,
            title: "Treatment Plan Review",
            description: "Review and update treatment plans for 3 patients",
            time: "1 day ago",
            status: "pending" as const
        }
    ];

    const upcomingAppointments = [
        {
            id: "1",
            patientName: "Emma Wilson",
            time: "2:00 PM",
            type: "Individual Therapy",
            status: "confirmed" as const
        },
        {
            id: "2",
            patientName: "David Brown",
            time: "3:30 PM",
            type: "Family Therapy",
            status: "scheduled" as const
        },
        {
            id: "3",
            patientName: "Lisa Garcia",
            time: "4:45 PM",
            type: "Assessment",
            status: "pending" as const
        }
    ];

    const quickActions = [
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

    return (
        <DashboardLayout
            title="Therapist Dashboard"
            subtitle={`Welcome back, ${session?.user?.name || 'Doctor'}`}
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="mb-8">
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

            {/* Patient Progress Overview */}
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Progress Overview</CardTitle>
                        <CardDescription>
                            Weekly progress summary for your active patients
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                                <div>
                                    <p className="font-medium">Sarah Johnson</p>
                                    <p className="text-sm text-muted-foreground">Anxiety Management Program</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">85% Progress</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                                <div>
                                    <p className="font-medium">Michael Chen</p>
                                    <p className="text-sm text-muted-foreground">Depression Treatment</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">72% Progress</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                                <div>
                                    <p className="font-medium">Emma Wilson</p>
                                    <p className="text-sm text-muted-foreground">PTSD Recovery Program</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium">58% Progress</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                            View Detailed Progress Reports
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
