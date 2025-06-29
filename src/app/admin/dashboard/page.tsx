"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
//import { StatsCard } from "@/components/ui/stats-card";
import { DonationModal } from '@/components/ui/donation-modal';
import { SessionModal } from '@/components/ui/therapySession-modal';
//import { Badge } from "@/components/ui/badge";
import {
    Users,
    Settings,
    BarChart3,
    Shield,
    Database,
    Globe,
    Zap,
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import { Session } from 'inspector/promises';

interface AdminData {
    systemStatus: "online" | "offline" | "maintenance";
    totalUsers: number;
    newUsersThisMonth: number;
    databaseSize: string;
    databaseCapacity: number;
    securityAlerts: number;
    resolvedAlertsToday: number;
    systemHealth: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkIO: string;
    };
    userRoleDistribution: {
        normalUsers: number;
        parents: number;
        therapists: number;
        managers: number;
        admins: number;
    };
    recentEvents: Array<{
        id: string;
        message: string;
        timestamp: string;
        type: "success" | "warning" | "info";
    }>;
}

const mockSessionData = [
  {
    id: 1,
    doctorName: "Dr. Nimal Perera",
    sessionDetails: "Session with Saman W. • 60 mins • Completed",
    amount: "Rs. 800",
    commission: "10% commission"
  },
  {
    id: 2,
    doctorName: "Dr. Kamala Silva",
    sessionDetails: "Session with Priya R. • 45 mins • In Progress",
    amount: "Rs. 600",
    commission: "10% commission"
  },
  {
    id: 3,
    doctorName: "Dr. Ruwan Fernando",
    sessionDetails: "Session with Nuwan K. • 90 mins • Completed",
    amount: "Rs. 1,200",
    commission: "10% commission"
  }
];

const mockDonationData = [
  {
    id: 1,
    donorName: "Malini Wickramasinghe",
    timeAgo: "2 hours ago",
    amount: "Rs. 15,000"
  },
  {
    id: 2,
    donorName: "Chandana Rajapaksa",
    timeAgo: "5 hours ago",
    amount: "Rs. 7,500"
  },
  {
    id: 3,
    donorName: "Sanduni Perera",
    timeAgo: "1 day ago",
    amount: "Rs. 30,000"
  },
  {
    id: 4,
    donorName: "Anonymous",
    timeAgo: "2 days ago",
    amount: "Rs. 22,500"
  }
];

export default function AdminDashboard() {
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showSessionModal, setShowSessionModal] = useState(false);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await fetch("/api/admin/dashboard");
            if (!response.ok) {
                throw new Error("Failed to fetch admin data");
            }
            const data = await response.json();
            setAdminData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching admin data:", error);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Map mockDonationData to match DonationModal's expected fields
    const mappedDonationData = mockDonationData.map((donation) => ({
        id: donation.id.toString(),
        name: donation.donorName,
        amount: Number(donation.amount.replace(/[^\d]/g, "")),
        timeAgo: donation.timeAgo,
    }));
    // Map mockSessionData to match SessionModal's expected fields
    const mappedSessionData = mockSessionData.map((session) => ({
        id: session.id.toString(),
        name: session.doctorName,
        sessionDetails: session.sessionDetails,
        amount: session.amount.replace(/[^\d]/g, ""),
        commission: session.commission,
    }));

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
        <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
                {/* Welcome Section */}
                <div className="mb-8 mt-0">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the entire SPARKS platform and all system operations.
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* System Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Zap className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${adminData?.systemStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                {adminData?.systemStatus ? adminData.systemStatus.charAt(0).toUpperCase() + adminData.systemStatus.slice(1) : 'Unknown'}
                            </div>
                            <p className="text-xs text-muted-foreground">99.9% uptime</p>
                        </CardContent>
                    </Card>

                    {/*<StatsCard
                        title="System Status"
                        value={
                            adminData?.systemStatus === "online" ? 1 : adminData?.systemStatus === "maintenance" ? 0.5 : 0
                        }
                        description='99.9% uptime'
                        iconType="zap"
                    />*/}

                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>    
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{adminData?.totalUsers?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">+{adminData?.newUsersThisMonth || 0} this month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                            <Database className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{adminData?.databaseSize || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground">{adminData?.databaseCapacity || 0}% capacity</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                            <AlertTriangle className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{adminData?.securityAlerts || 0}</div>
                            <p className="text-xs text-muted-foreground">{adminData?.resolvedAlertsToday || 0} resolved today</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                    {/* Recent Session Oversight */}
                    <Card>
                        <CardHeader>
                        <CardTitle>Recent Session Oversight</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                            {mockSessionData.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                <h4 className="font-semibold text-sm">{session.doctorName}</h4>
                                <p className="text-xs text-muted-foreground">{session.sessionDetails}</p>
                                </div>
                                <div className="text-right">
                                <p className="font-semibold text-green-600">{session.amount}</p>
                                <p className="text-xs text-muted-foreground">{session.commission}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button className="hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }} onClick={() => setShowSessionModal(true)}>
                            View All Sessions
                            </Button>
                            <Button variant="outline">
                            Generate Report
                            </Button>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Recent Donations */}
                    <Card>
                        <CardHeader>
                        <CardTitle>Recent Donations</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                            {mockDonationData.map((donation) => (
                            <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                <h4 className="font-semibold text-sm">{donation.donorName}</h4>
                                <p className="text-xs text-muted-foreground">{donation.timeAgo}</p>
                                </div>
                                <div className="text-right">
                                <p className="font-semibold text-green-600">{donation.amount}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button className="hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }} onClick={() => setShowDonationModal(true)}>
                            View All Donations
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Action Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/*<Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
                    </Card>*/}

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
                            <Button className="w-full hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }}>
                                Security Settings
                            </Button>
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
                            <Button className="w-full hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }}>
                                Database Admin
                            </Button>
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
                            <Button className="w-full hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }}>
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>

                    {/*<Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/api-docs', '_blank')}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="mr-2 h-5 w-5" />
                                API Documentation
                            </CardTitle>
                            <CardDescription>
                                Interactive Swagger documentation for all API endpoints
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">View API Docs</Button>
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
                    </Card>*/}
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
                                    <span className="text-sm font-medium">{adminData?.systemHealth?.cpuUsage?.toFixed(1) || '0'}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Memory Usage</span>
                                    <span className="text-sm font-medium">{adminData?.systemHealth?.memoryUsage?.toFixed(1) || '0'}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Disk Usage</span>
                                    <span className="text-sm font-medium">{adminData?.systemHealth?.diskUsage?.toFixed(1) || '0'}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Network I/O</span>
                                    <span className="text-sm font-medium">{adminData?.systemHealth?.networkIO || '0 MB/s'}</span>
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
                                {adminData?.recentEvents?.map((event) => (
                                    <div key={event.id} className="flex items-center space-x-4">
                                        <div className={`w-2 h-2 rounded-full ${event.type === "success" ? "bg-green-500" :
                                            event.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{event.message}</p>
                                            <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                                        </div>
                                    </div>
                                )) || (
                                        <p className="text-sm text-muted-foreground">No recent events</p>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Statistics 
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Role Distribution</CardTitle>
                            <CardDescription>Current distribution of users across different roles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{adminData?.userRoleDistribution?.normalUsers || 0}</div>
                                    <p className="text-xs text-muted-foreground">Patients</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{adminData?.userRoleDistribution?.parents || 0}</div>
                                    <p className="text-xs text-muted-foreground">Parents</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{adminData?.userRoleDistribution?.therapists || 0}</div>
                                    <p className="text-xs text-muted-foreground">Therapists</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{adminData?.userRoleDistribution?.managers || 0}</div>
                                    <p className="text-xs text-muted-foreground">Managers</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{adminData?.userRoleDistribution?.admins || 0}</div>
                                    <p className="text-xs text-muted-foreground">Admins</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>*/}

                <DonationModal 
                    isOpen={showDonationModal} 
                    onClose={() => setShowDonationModal(false)} 
                    donations={mappedDonationData} 
                />
                <SessionModal
                    isOpen={showSessionModal}
                    onClose={() => setShowSessionModal(false)}
                    sessions={mappedSessionData}
                />
            </main>
        </div>
    );
}
