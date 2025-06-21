"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Calendar,
    Settings,
    Heart,
    TrendingUp,
    MessageCircle
} from "lucide-react";

interface ParentData {
    children: Array<{
        id: string;
        firstName: string;
        lastName: string;
        upcomingSessions: number;
        progressReports: number;
    }>;
    totalUpcomingSessions: number;
    unreadMessages: number;
    recentUpdates: Array<{
        id: string;
        message: string;
        timestamp: string;
        type: "success" | "info" | "warning";
    }>;
}

export default function ParentDashboard() {
    const router = useRouter();
    const [parentData, setParentData] = useState<ParentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchParentData();
    }, []);

    const fetchParentData = async () => {
        try {
            const response = await fetch("/api/parent/dashboard");
            if (!response.ok) {
                throw new Error("Failed to fetch parent data");
            }
            const data = await response.json();
            setParentData(data);
        } catch (error) {
            console.error("Error fetching parent data:", error);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

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

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            {/* Header */}
            <header className="bg-card/95 backdrop-blur border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Image
                                src="/images/sparkslogo.png"
                                alt="SPARKS Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Parent Portal</h1>
                                <p className="text-sm text-muted-foreground">SPARKS Family Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">{parentData?.children[0]?.firstName}</p>
                                <Badge variant="secondary" className="text-xs">
                                    Parent/Guardian
                                </Badge>
                            </div>
                            <Button variant="outline" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {parentData?.children[0]?.firstName}!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Track your child&apos;s progress and manage family appointments.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Children</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parentData?.children.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Enrolled in therapy</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parentData?.totalUpcomingSessions || 0}</div>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress Updates</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {parentData?.children.reduce((sum, child) => sum + child.progressReports, 0) || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">New reports available</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages</CardTitle>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parentData?.unreadMessages || 0}</div>
                            <p className="text-xs text-muted-foreground">Unread</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                My Children
                            </CardTitle>
                            <CardDescription>
                                View your children&apos;s profiles, progress, and therapy details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View Children</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5" />
                                Appointments
                            </CardTitle>
                            <CardDescription>
                                Schedule and manage therapy sessions and consultations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Manage Appointments</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5" />
                                Progress Reports
                            </CardTitle>
                            <CardDescription>
                                Access detailed progress reports and therapy outcomes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View Reports</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Communication
                            </CardTitle>
                            <CardDescription>
                                Message therapists and receive updates about your child
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Messages</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Heart className="mr-2 h-5 w-5" />
                                Resources & Support
                            </CardTitle>
                            <CardDescription>
                                Access family resources, guides, and support materials
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Resources</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="mr-2 h-5 w-5" />
                                Family Settings
                            </CardTitle>
                            <CardDescription>
                                Manage family profile, preferences, and account settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Settings</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                {parentData && parentData.recentUpdates.length > 0 && (
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Updates</CardTitle>
                                <CardDescription>Latest updates about your children&apos;s therapy progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {parentData.recentUpdates.map((update) => (
                                        <div key={update.id} className="flex items-center space-x-4">
                                            <div className={`w-2 h-2 rounded-full ${update.type === "success" ? "bg-green-500" :
                                                update.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                                                }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{update.message}</p>
                                                <p className="text-xs text-muted-foreground">{update.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* No data state */}
                {!parentData && !loading && !error && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Children Enrolled</h3>
                        <p className="text-muted-foreground mb-4 text-center">
                            You don&apos;t have any children enrolled in therapy services yet.
                        </p>
                        <Button onClick={() => router.push("/parent/children/add")}>
                            Add Child
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
