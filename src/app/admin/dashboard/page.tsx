"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Settings,
    BarChart3,
    Shield,
    Database,
    Globe,
    Zap,
    AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
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
                                <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
                                <p className="text-sm text-muted-foreground">SPARKS System Administration</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">{session?.user?.name}</p>
                                <Badge variant="destructive" className="text-xs">
                                    Administrator
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
                        System Administration
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Manage the entire SPARKS platform and all system operations.
                    </p>
                </div>

                {/* System Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Zap className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Online</div>
                            <p className="text-xs text-muted-foreground">99.9% uptime</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,247</div>
                            <p className="text-xs text-muted-foreground">+89 this month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2.4GB</div>
                            <p className="text-xs text-muted-foreground">68% capacity</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">2 resolved today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                User Management
                            </CardTitle>
                            <CardDescription>
                                Manage all user accounts, roles, and permissions across the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Manage Users</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="mr-2 h-5 w-5" />
                                Security & Permissions
                            </CardTitle>
                            <CardDescription>
                                Configure security settings, audit logs, and access controls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Security Settings</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="mr-2 h-5 w-5" />
                                Database Management
                            </CardTitle>
                            <CardDescription>
                                Monitor database performance, backups, and maintenance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Database Admin</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                System Analytics
                            </CardTitle>
                            <CardDescription>
                                View comprehensive system metrics and usage analytics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View Analytics</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="mr-2 h-5 w-5" />
                                API Management
                            </CardTitle>
                            <CardDescription>
                                Manage API keys, rate limits, and third-party integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">API Console</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="mr-2 h-5 w-5" />
                                System Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure global system settings and application parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">System Config</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* System Overview */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Health</CardTitle>
                            <CardDescription>Real-time system performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm">CPU Usage</span>
                                    <span className="text-sm font-medium">23.5%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Memory Usage</span>
                                    <span className="text-sm font-medium">54.2%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Disk Usage</span>
                                    <span className="text-sm font-medium">68.1%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Network I/O</span>
                                    <span className="text-sm font-medium">12.4 MB/s</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent System Events</CardTitle>
                            <CardDescription>Important system events and alerts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Database backup completed successfully</p>
                                        <p className="text-xs text-muted-foreground">30 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">High CPU usage detected on server-02</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Security patch applied successfully</p>
                                        <p className="text-xs text-muted-foreground">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Statistics */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Role Distribution</CardTitle>
                            <CardDescription>Current distribution of users across different roles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">892</div>
                                    <p className="text-xs text-muted-foreground">Normal Users</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">234</div>
                                    <p className="text-xs text-muted-foreground">Parents</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">89</div>
                                    <p className="text-xs text-muted-foreground">Therapists</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">27</div>
                                    <p className="text-xs text-muted-foreground">Managers</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">5</div>
                                    <p className="text-xs text-muted-foreground">Admins</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
