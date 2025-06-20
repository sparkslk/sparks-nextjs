"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    StatCard,
    QuickActionCard,
    RecentActivity
} from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Heart,
    TrendingUp,
    MessageCircle,
    Clock,
    User,
    FileText,
    Plus,
    Activity
} from "lucide-react";

// Manual UserRole enum (matching our types)
enum UserRole {
    NORMAL_USER = "NORMAL_USER",
    PARENT_GUARDIAN = "PARENT_GUARDIAN",
    THERAPIST = "THERAPIST",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
}

interface PatientData {
    id: string;
    firstName: string;
    lastName: string;
    therapist?: {
        name: string;
        specialization: string[];
    };
    upcomingSessions: SessionData[];
    recentSessions: SessionData[];
    treatmentPlans: TreatmentPlan[];
}

interface SessionData {
    id: string;
    scheduledAt: string;
    duration: number;
    type: string;
    status: string;
    therapistName: string;
    notes?: string;
}

interface TreatmentPlan {
    id: string;
    title: string;
    goals: string[];
    startDate: string;
    isActive: boolean;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [patientData, setPatientData] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatientData = useCallback(async () => {
        try {
            const response = await fetch("/api/profile");
            if (!response.ok) {
                if (response.status === 404) {
                    // Patient profile not found, redirect to profile creation
                    router.push("/profile/create");
                    return;
                }
                throw new Error("Failed to fetch patient data");
            }
            const data = await response.json();
            if (!data.profile) {
                // No profile found, redirect to profile creation
                router.push("/profile/create");
                return;
            }
            // Set patient data with default empty arrays for sessions and treatment plans
            setPatientData({
                ...data.profile,
                upcomingSessions: data.profile.upcomingSessions || [],
                recentSessions: data.profile.recentSessions || [],
                treatmentPlans: data.profile.treatmentPlans || []
            });
        } catch (error) {
            console.error("Error fetching patient data:", error);
            setError(error instanceof Error ? error.message : "Failed to load patient data");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && session) {
            const userRole = (session.user as { role?: UserRole }).role as UserRole;

            // Only NORMAL_USER (patients) should access this dashboard
            if (userRole !== UserRole.NORMAL_USER) {
                // Redirect other roles to their specific dashboards
                switch (userRole) {
                    case UserRole.PARENT_GUARDIAN:
                        router.push("/parent/dashboard");
                        break;
                    case UserRole.THERAPIST:
                        router.push("/therapist/dashboard");
                        break;
                    case UserRole.MANAGER:
                        router.push("/manager/dashboard");
                        break;
                    case UserRole.ADMIN:
                        router.push("/admin/dashboard");
                        break;
                    default:
                        router.push("/confirm-role");
                        break;
                }
                return;
            }

            // Fetch patient data for NORMAL_USER
            fetchPatientData();
        }
    }, [status, router, session, fetchPatientData]);

    const requestSession = () => {
        router.push("/sessions/request");
    };

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

    if (error) {
        return (
            <DashboardLayout title="Patient Dashboard" subtitle="Welcome to your therapy portal">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!patientData) {
        return (
            <DashboardLayout title="Patient Dashboard" subtitle="Welcome to your therapy portal">
                <div className="flex flex-col items-center justify-center py-12">
                    <User className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                    <p className="text-muted-foreground mb-4 text-center">
                        To get started with your therapy journey, please complete your patient profile.
                    </p>
                    <Button onClick={() => router.push("/profile/create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Profile
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const quickActions = [
        {
            title: "Request Session",
            description: "Schedule a new therapy session",
            icon: Calendar,
            onClick: requestSession
        },
        {
            title: "View Progress",
            description: "Check your treatment progress",
            icon: TrendingUp,
            onClick: () => router.push("/progress")
        },
        {
            title: "Message Therapist",
            description: "Send a message to your therapist",
            icon: MessageCircle,
            onClick: () => router.push("/messages")
        },
        {
            title: "Resources",
            description: "Access therapy resources and exercises",
            icon: FileText,
            onClick: () => router.push("/resources")
        }
    ];

    const formatRecentActivities = () => {
        const activities: Array<{
            id: string;
            type: "session" | "task" | "assessment" | "notification";
            title: string;
            description: string;
            time: string;
            status: "completed" | "pending" | "cancelled";
        }> = [];

        // Add recent sessions (safely handle empty array)
        if (patientData?.recentSessions) {
            patientData.recentSessions.slice(0, 3).forEach(session => {
                activities.push({
                    id: `session-${session.id}`,
                    type: "session" as const,
                    title: `Therapy Session - ${session.type}`,
                    description: `Session with ${session.therapistName}`,
                    time: new Date(session.scheduledAt).toLocaleDateString(),
                    status: session.status as "completed" | "pending" | "cancelled"
                });
            });
        }

        return activities;
    };

    return (
        <DashboardLayout
            title="Patient Dashboard"
            subtitle={`Welcome back, ${patientData.firstName}!`}
        >
            {/* Patient Info Card */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {patientData.firstName} {patientData.lastName}
                                </h2>
                                {patientData.therapist && (
                                    <p className="text-muted-foreground">
                                        Primary Therapist: {patientData.therapist.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button onClick={requestSession}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Request Session
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Upcoming Sessions"
                    value={patientData?.upcomingSessions?.length || 0}
                    description="Scheduled therapy sessions"
                    icon={Calendar}
                    color="primary"
                />
                <StatCard
                    title="Completed Sessions"
                    value={patientData?.recentSessions?.filter(s => s.status === 'COMPLETED')?.length || 0}
                    description="This month"
                    icon={Heart}
                    color="success"
                />
                <StatCard
                    title="Active Plans"
                    value={patientData?.treatmentPlans?.filter(p => p.isActive)?.length || 0}
                    description="Treatment plans in progress"
                    icon={TrendingUp}
                    color="default"
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
                {/* Upcoming Sessions */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Sessions</CardTitle>
                            <CardDescription>Your scheduled therapy appointments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!patientData?.upcomingSessions || patientData.upcomingSessions.length === 0 ? (
                                <div className="text-center py-4">
                                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground text-sm">No upcoming sessions</p>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={requestSession}>
                                        Request Session
                                    </Button>
                                </div>
                            ) : (
                                patientData.upcomingSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                        <div>
                                            <p className="font-medium">{session.type}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(session.scheduledAt).toLocaleDateString()} at{" "}
                                                {new Date(session.scheduledAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{session.duration} min</Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <RecentActivity
                        activities={formatRecentActivities()}
                        title="Recent Sessions"
                    />
                </div>
            </div>

            {/* Treatment Plans */}
            {patientData?.treatmentPlans && patientData.treatmentPlans.length > 0 && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Treatment Plans</CardTitle>
                            <CardDescription>Your active treatment and therapy goals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {patientData.treatmentPlans.map((plan) => (
                                    <div key={plan.id} className="p-4 bg-muted/20 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{plan.title}</h4>
                                            <Badge variant={plan.isActive ? "default" : "secondary"}>
                                                {plan.isActive ? "Active" : "Completed"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Started: {new Date(plan.startDate).toLocaleDateString()}
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Goals:</p>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                {plan.goals.map((goal, index) => (
                                                    <li key={index} className="flex items-center">
                                                        <Activity className="h-3 w-3 mr-2" />
                                                        {goal}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
