"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Calendar,
    FileText,
    Settings,
    Activity,
    BarChart3,
    UserCheck,
    Clock,
    DollarSign
} from "lucide-react";

export default function ManagerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
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
        router.push("/login");
        return null;
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

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
                                <h1 className="text-xl font-bold text-foreground">Manager Portal</h1>
                                <p className="text-sm text-muted-foreground">SPARKS Management Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">{session?.user?.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                    Manager
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
                        Welcome back, {session?.user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Oversee operations and manage your team's performance.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Therapists</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">+3 this month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <p className="text-xs text-muted-foreground">+12 new this week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sessions This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">420</div>
                            <p className="text-xs text-muted-foreground">95% completion rate</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$34,200</div>
                            <p className="text-xs text-muted-foreground">+15% vs last month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserCheck className="mr-2 h-5 w-5" />
                                Staff Management
                            </CardTitle>
                            <CardDescription>
                                Manage therapist schedules, performance, and assignments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Manage Staff</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Analytics & Reports
                            </CardTitle>
                            <CardDescription>
                                View detailed analytics, KPIs, and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View Analytics</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Client Overview
                            </CardTitle>
                            <CardDescription>
                                Monitor client progress across all therapists and programs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Client Overview</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5" />
                                Scheduling Management
                            </CardTitle>
                            <CardDescription>
                                Oversee scheduling conflicts and optimize resource allocation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Manage Scheduling</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                Documentation Review
                            </CardTitle>
                            <CardDescription>
                                Review and approve treatment plans and progress reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Review Documents</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="mr-2 h-5 w-5" />
                                System Settings
                            </CardTitle>
                            <CardDescription>
                                Configure system settings and organizational preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">System Settings</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Management Activity</CardTitle>
                            <CardDescription>Important updates and actions requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Staff shortage alert: Pediatric therapy department</p>
                                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Monthly performance reports generated successfully</p>
                                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New therapist onboarding completed: Dr. Sarah Wilson</p>
                                        <p className="text-xs text-muted-foreground">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Overview */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Performance</CardTitle>
                            <CardDescription>Overview of therapist performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm">Average Client Satisfaction</span>
                                    <span className="text-sm font-medium">4.7/5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Session Completion Rate</span>
                                    <span className="text-sm font-medium">95.2%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">On-time Performance</span>
                                    <span className="text-sm font-medium">92.8%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Documentation Compliance</span>
                                    <span className="text-sm font-medium">98.1%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Operational Metrics</CardTitle>
                            <CardDescription>Key operational performance indicators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm">Utilization Rate</span>
                                    <span className="text-sm font-medium">87.3%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Client Retention</span>
                                    <span className="text-sm font-medium">91.5%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Revenue per Session</span>
                                    <span className="text-sm font-medium">$82.40</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Cancellation Rate</span>
                                    <span className="text-sm font-medium">4.8%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
