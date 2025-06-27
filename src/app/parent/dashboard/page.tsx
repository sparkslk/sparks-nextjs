"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";



import { Users, Plus, UserPlus } from "lucide-react";
import { AddChildForm } from "@/components/parent/AddChildForm";
import { ConnectChildForm } from "@/components/parent/ConnectChildForm";
import { StatsCard } from "@/components/ui/stats-card";

interface ParentData {
    children: Array<{
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        relationship: string;
        isPrimary: boolean;
        upcomingSessions: number;
        progressReports: number;
        progressPercentage: number;
        lastSession: string | null;
        therapist: {
            name: string;
            email: string;
        } | null;
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
    const [parentData, setParentData] = useState<ParentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddChild, setShowAddChild] = useState(false);
    const [showConnectChild, setShowConnectChild] = useState(false);

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

    const fetchChildren = async () => {
        try {
            const response = await fetch("/api/parent/children");
            if (!response.ok) {
                throw new Error("Failed to fetch children");
            }
            const data = await response.json();

            // Update parent data with new children data
            if (parentData) {
                setParentData({
                    ...parentData,
                    children: data.children
                });
            } else {
                setParentData({
                    children: data.children,
                    totalUpcomingSessions: 0,
                    unreadMessages: 0,
                    recentUpdates: []
                });
            }
        } catch (error) {
            console.error("Error fetching children:", error);
        }
    };

    const handleChildAdded = () => {
        setShowAddChild(false);
        fetchChildren();
    };

    const handleChildConnected = () => {
        setShowConnectChild(false);
        fetchChildren();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header Section with Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-lg text-gray-600 font-medium">
                        Monitor and manage your children&apos;s therapeutic progress
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Track sessions, view reports, and stay connected with therapists
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={showConnectChild} onOpenChange={setShowConnectChild}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect Child
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Connect to Existing Child</DialogTitle>
                                <DialogDescription>
                                    Use your child&apos;s Patient ID to connect to their account
                                </DialogDescription>
                            </DialogHeader>
                            <ConnectChildForm onSuccess={handleChildConnected} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
                        <DialogTrigger asChild>
                            <Button style={{ backgroundColor: '#8159A8' }} className="text-white hover:opacity-90">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Child
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Child</DialogTitle>
                                <DialogDescription>
                                    Create a new patient profile for your child
                                </DialogDescription>
                            </DialogHeader>
                            <AddChildForm onSuccess={handleChildAdded} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* Stats Grid - only show when we have children */}
            {parentData && parentData.children.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Children Registered"
                        value={parentData.children.length}
                        description="Active accounts"
                    />
                    
                    <StatsCard
                        title="Upcoming Sessions"
                        value={parentData.totalUpcomingSessions}
                        description="Scheduled sessions"
                    />
                    
                    <StatsCard
                        title="Unread Messages"
                        value={parentData.unreadMessages}
                        description="From therapists"
                    />
                    
                    <StatsCard
                        title="Progress Reports"
                        value={parentData.children.reduce((sum, child) => sum + child.progressReports, 0)}
                        description="New reports available"
                    />
                </div>
            )}

            {/* Main Content Grid - only show when we have children */}
            {parentData && parentData.children.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Children Progress */}
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
                        <CardHeader className="border-b border-purple-100 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <Users className="h-5 w-5" />
                                Children Progress Overview
                            </CardTitle>
                            <p className="text-gray-600 text-sm mt-1">Track therapeutic progress and upcoming sessions</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {parentData.children.map((child) => (
                                <div key={child.id} className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(to bottom right, #8159A8, #6b46a0)' }}>
                                                    {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">{child.firstName} {child.lastName}</h4>
                                                    <p className="text-sm text-gray-500">Age: {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years</p>
                                                </div>
                                            </div>
                                            {child.isPrimary && (
                                                <Badge variant="secondary" className="mb-3 text-purple-800 border-purple-200" style={{ backgroundColor: '#f3f0ff' }}>
                                                    Primary Guardian
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-3 py-1 text-xs rounded-full font-bold bg-green-100 text-green-700 border border-green-200">
                                                ACTIVE
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded font-mono">
                                                {child.id}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 mb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">{child.upcomingSessions}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-800">Upcoming Sessions</span>
                                        </div>
                                        <p className="text-xs text-blue-600">Next 7 days</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                                            <span className="text-sm font-bold" style={{ color: '#8159A8' }}>{child.progressPercentage || 0 }%</span>
                                        </div>
                                        <div className="relative">
                                            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                                <div
                                                    className="h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                                                    style={{
                                                        width: `${child.progressPercentage || 0}%`,
                                                        background: 'linear-gradient(to right, #8159A8, #6b46a0)'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 h-3"></div>
                                        </div>
                                    </div>

                                    {child.therapist && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {child.therapist.name.split(' ').map(n => n.charAt(0)).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">Dr. {child.therapist.name}</p>
                                                    <p className="text-xs text-gray-500">Assigned Therapist</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {child.lastSession && (
                                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                                            <span className="font-medium">Last Session:</span> {child.lastSession}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Updates */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900">Recent Messages</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {parentData && parentData.recentUpdates.length > 0 ? (
                                <div className="space-y-4">
                                    {parentData.recentUpdates.map((update) => (
                                        <div key={update.id} className="border-l-4 pl-4 py-2 rounded-r" style={{ borderLeftColor: '#8159A8', backgroundColor: '#f7f3ff' }}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-gray-900">{update.message.split(':')[0] || 'System'}</span>
                                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{update.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{update.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No recent updates</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* No data state - show when no children or when data is null */}
            {(!parentData || (parentData && parentData.children.length === 0)) && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                        <h3 className="text-lg font-semibold mb-2 text-gray-900">No Children Enrolled</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            You don&apos;t have any children enrolled in therapy services yet. Get started by adding your first child or connecting to an existing account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => setShowConnectChild(true)}
                                variant="outline"
                                className="px-6 py-2"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect Existing Child
                            </Button>
                            <Button
                                onClick={() => setShowAddChild(true)}
                                className="text-white px-6 py-2 hover:opacity-90"
                                style={{ backgroundColor: '#8159A8' }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Child
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}