"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    StatCard,
    QuickActionCard,
    RecentActivity
} from "@/components/dashboard/DashboardComponents";
import { PatientIdCard } from "@/components/dashboard/PatientIdCard";
import { AssignedTherapistCard } from "@/components/patient/assigned-therapist-card";
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
    Activity,
    List
} from "lucide-react";
import { UserRole } from "@/lib/auth";
import { userRoleNeedsProfile, userRoleHasDashboardAccess, getRedirectPathForRole } from "@/lib/profile-utils";

interface UserData {
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
    const router = useRouter();
    const { data: session } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch("/api/profile");
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const data = await response.json();

            // Ensure data.profile exists
            if (!data.profile) {
                setUserData(null);
                return;
            }

            // Set user data with safe default empty arrays for sessions and treatment plans
            setUserData({
                ...data.profile,
                upcomingSessions: data.profile.upcomingSessions || [],
                recentSessions: data.profile.recentSessions || [],
                treatmentPlans: data.profile.treatmentPlans || []
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError(error instanceof Error ? error.message : "Failed to load user data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch user data on component mount
        fetchUserData();
    }, [fetchUserData]);

    const requestSession = () => {
        router.push("/sessions/request");
    };

    // Handle role-based redirects and profile requirements
    useEffect(() => {
        if (!loading && session?.user) {
            const userRole = (session.user as { role?: UserRole }).role;

            // If user role doesn't need profile but accessed /dashboard, redirect to proper dashboard
            if (userRole && userRoleHasDashboardAccess(userRole)) {
                const correctPath = getRedirectPathForRole(userRole);
                if (correctPath !== "/dashboard") {
                    router.replace(correctPath);
                    return;
                }
            }

            // Only redirect NORMAL_USER without profile to profile creation
            if (!error && !userData && userRole && userRoleNeedsProfile(userRole)) {
                router.replace("/profile/create?reason=new_user");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, error, userData, session]);

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
            <DashboardLayout title="Dashboard" subtitle="Welcome to your therapy portal">
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

    if (!userData) {
        // While redirecting, render nothing
        return null;
    }

    const quickActions = [
        {
            title: "Request Session",
            description: "Schedule a new therapy session",
            icon: Calendar,
            onClick: requestSession
        },
        {
            title: "Find Therapist",
            description: "Browse and connect with therapists",
            icon: User,
            onClick: () => router.push("/dashboard/findTherapist")
        },
        {
            title: "My Requests",
            description: "View your session requests",
            icon: List,
            onClick: () => router.push("/sessions/my-requests")
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
            onClick: () => router.push("/parent/blogs")
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
        if (userData?.recentSessions && Array.isArray(userData.recentSessions)) {
            userData.recentSessions.slice(0, 3).forEach((session: SessionData) => {
                activities.push({
                    id: `session-${session.id}`,
                    type: "session" as const,
                    title: `Therapy Session - ${session.type || 'General'}`,
                    description: `Session with ${session.therapistName || 'Therapist'}`,
                    time: new Date(session.scheduledAt).toLocaleDateString(),
                    status: session.status as "completed" | "pending" | "cancelled"
                });
            });
        }

        return activities;
    };

    return (
        <DashboardLayout
            title="Dashboard"
            subtitle={`Welcome back, ${userData.firstName}!`}
        >
            {/* User Info Card */}
            <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-card/95 to-card/80 backdrop-blur">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                                    {userData.firstName} {userData.lastName}
                                </h2>
                                {userData.therapist && (
                                    <p className="text-muted-foreground">
                                        Primary Therapist: {userData.therapist.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button onClick={requestSession} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                            <Calendar className="mr-2 h-4 w-4" />
                            Request Session
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Patient ID Card and Therapist Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <PatientIdCard
                    patientId={userData.id}
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                />
                <AssignedTherapistCard />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Upcoming Sessions"
                    value={userData?.upcomingSessions?.length || 0}
                    description="Scheduled therapy sessions"
                    icon={Calendar}
                    color="primary"
                />
                <StatCard
                    title="Completed Sessions"
                    value={userData?.recentSessions?.filter((s: SessionData) => s?.status === 'COMPLETED')?.length || 0}
                    description="This month"
                    icon={Heart}
                    color="success"
                />
                <StatCard
                    title="Active Plans"
                    value={userData?.treatmentPlans?.filter((p: TreatmentPlan) => p?.isActive)?.length || 0}
                    description="Treatment plans in progress"
                    icon={TrendingUp}
                    color="default"
                />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Quick Actions</h2>
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
                {/* Upcoming Sessions */}
                <div className="xl:col-span-1 order-2 xl:order-1">
                    <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Upcoming Sessions
                            </CardTitle>
                            <CardDescription>Your scheduled therapy appointments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!userData?.upcomingSessions || !Array.isArray(userData.upcomingSessions) || userData.upcomingSessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-4">No upcoming sessions</p>
                                    <Button variant="outline" size="sm" onClick={requestSession} className="border-primary/20 hover:bg-primary/5">
                                        Request Session
                                    </Button>
                                </div>
                            ) : (
                                userData.upcomingSessions.map((session: SessionData) => (
                                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50 gap-3">
                                        <div className="flex-1">
                                            <p className="font-medium">{session.type || 'Therapy Session'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(session.scheduledAt).toLocaleDateString()} at{" "}
                                                {new Date(session.scheduledAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="border-primary/20 self-start sm:self-center">{session.duration || 60} min</Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="xl:col-span-2 order-1 xl:order-2">
                    <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Recent Sessions
                            </CardTitle>
                            <CardDescription>Your recent therapy activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentActivity
                                activities={formatRecentActivities()}
                                title=""
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Treatment Plans */}
            {userData?.treatmentPlans && userData.treatmentPlans.length > 0 && (
                <div className="mt-8">
                    <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Treatment Plans
                            </CardTitle>
                            <CardDescription>Your active treatment and therapy goals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {userData.treatmentPlans.map((plan: TreatmentPlan) => (
                                    <div key={plan.id} className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
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
                                                {plan.goals.map((goal: string, index: number) => (
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
