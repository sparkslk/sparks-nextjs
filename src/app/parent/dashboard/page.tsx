"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Users, Plus, UserPlus, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
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
        nextUpcomingSession: string | null;
        therapist: {
            name: string;
            email: string;
            image?: string | null;
        } | null;
        image?: string | null;
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
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchParentData();
    }, []);

    const fetchParentData = async () => {
        try {
            setError(null);
            const response = await fetch("/api/parent/dashboard");
            if (!response.ok) {
                throw new Error(`Failed to load dashboard data (${response.status})`);
            }
            const data = await response.json();
            setParentData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching parent data:", error);
            setError(error instanceof Error ? error.message : "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await fetchParentData();
        setRefreshing(false);
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

    console.log(parentData);

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4 mx-auto"></div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Loading Dashboard</h3>
                    <p className="text-gray-600">Fetching your children&apos; progress data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Unable to load dashboard</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                        <Button onClick={refreshData} disabled={refreshing}>
                            {refreshing ? "Refreshing..." : "Refresh Data"}
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        If the problem persists, please contact support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header Section with Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-1">Parent Dashboard</h1>
                            <div className="relative group">
                                <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary cursor-help" />
                                <div className="absolute left-6 top-0 bg-background text-foreground text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap shadow-lg border border-border">
                                    View and manage your children&apos; therapy progress
                                </div>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-base font-medium">
                            Monitor and manage your children&apos; therapeutic progress
                        </p>
                        {lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={showConnectChild} onOpenChange={setShowConnectChild}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline"
                                className="transition-all duration-200 shadow-sm hover:shadow-md"
                                aria-label="Connect to an existing child's account"
                            >
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
                            <Button 
                                className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-sm hover:opacity-90 transition"
                                aria-label="Add a new child to your account"
                            >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Children Registered"
                        value={parentData.children.length}
                        description="Active accounts"
                        iconType="users"
                    />
                    <StatsCard
                        title="Upcoming Sessions"
                        value={parentData.totalUpcomingSessions}
                        description="Scheduled sessions"
                        iconType="calendar"
                    />
                    <StatsCard
                        title="Unread Messages"
                        value={parentData.unreadMessages}
                        description="From therapists"
                        iconType="message"
                    />
                </div>
            )}

            {/* Main Content Grid - only show when we have children */}
            {parentData && parentData.children.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Children Progress */}
                    <Card className="shadow-md border-border bg-background">
                        <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <Users className="h-5 w-5" />
                                Children Progress Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {parentData.children.map((child) => (
                                <div 
                                    key={child.id} 
                                    className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-95 focus-within:ring-2 focus-within:ring-primary/50"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details for ${child.firstName} ${child.lastName}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            // Navigate to child details
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden bg-gradient-to-br from-primary to-primary-foreground">
                                                    {child.image && typeof child.image === 'string' && child.image.trim() !== '' ? (
                                                        <Image
                                                            src={child.image}
                                                            alt={`${child.firstName} ${child.lastName}`}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover w-full h-full rounded-full"
                                                            priority
                                                        />
                                                    ) : (
                                                        <span>{child.firstName.charAt(0)}{child.lastName.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground text-lg">{child.firstName} {child.lastName}</h4>
                                                    <p className="text-sm text-muted-foreground">Age: {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years</p>
                                                </div>
                                            </div>
                                            {child.isPrimary && (
                                                <Badge variant="secondary" className="mb-3 text-primary border-primary/20 bg-primary/10">
                                                    Primary Guardian
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-3 py-1 text-xs rounded-full font-bold bg-success/10 text-success border border-success/20">
                                                ACTIVE
                                            </span>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
                                                {child.id}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-muted-foreground">Overall Progress</span>
                                            <span className="text-sm font-bold text-primary">{child.progressPercentage}%</span>
                                        </div>
                                        <div className="relative">
                                            <div className="w-full bg-muted rounded-full h-3 shadow-inner">
                                                <div
                                                    className="h-3 rounded-full transition-all duration-500 ease-out shadow-sm bg-gradient-to-r from-primary to-primary-foreground"
                                                    style={{ width: `${child.progressPercentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-background to-transparent opacity-30 h-3"></div>
                                        </div>
                                    </div>

                                    {child.therapist && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="flex items-center gap-2">
                                                {child.therapist.image && typeof child.therapist.image === 'string' && child.therapist.image.trim() !== '' ? (
                                                    <Image
                                                        src={child.therapist.image}
                                                        alt={child.therapist.name}
                                                        width={32}
                                                        height={32}
                                                        className="object-cover w-8 h-8 rounded-full"
                                                        priority
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gradient-to-br from-success to-success-foreground rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                        {child.therapist.name.split(' ').map(n => n.charAt(0)).join('')}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Dr. {child.therapist.name}</p>
                                                    <p className="text-xs text-muted-foreground">Assigned Therapist</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {child.lastSession && (
                                        <div className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg p-2">
                                            <span className="font-medium">Last Session:</span> {child.lastSession}
                                        </div>
                                    )}
                                    {child.nextUpcomingSession && (
                                        <div className="mt-2 text-xs bg-primary/10 text-primary rounded-lg p-2 border border-primary/20 flex items-center gap-2 justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Next Session:</span>
                                                <span className="font-semibold">{child.nextUpcomingSession}</span>
                                            </div>
                                            <Button size="sm" className="bg-primary text-white px-4 py-1 ml-4" aria-label="Join Session">
                                                Join
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Right column: Schedule Session and Recent Updates stacked */}

                    <div className="flex flex-col gap-6">
                        {/* Schedule Session Section */}
                        <Card className="shadow-md border-border bg-background">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span>📅</span> Schedule Session
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {parentData.children.map(child => (
                                        <div key={child.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg bg-accent/10 border-accent">
                                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                                <span className="font-semibold text-foreground">{child.firstName} {child.lastName}</span>
                                                {child.therapist && (
                                                    <span className="text-sm text-muted-foreground">Therapist: <span className="font-medium text-primary">Dr. {child.therapist.name}</span></span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                
                                                {child.therapist ? (
                                                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 min-w-[150px]">
                                                        Schedule 
                                                    </Button>
                                                ) : (
                                                    <a href="/parent/findTherapist" className="w-full">
                                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 min-w-[150px] w-full">
                                                            Find Therapist
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Updates */}
                        <Card className="shadow-md border-border bg-background">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-lg font-semibold text-foreground">Recent Updates</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {parentData && parentData.recentUpdates.length > 0 ? (
                                    <div className="space-y-4">
                                        {parentData.recentUpdates.map((update) => (
                                            <div key={update.id} className="border-l-4 pl-4 py-2 rounded-r  bg-primary/5">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-foreground">{update.message.split(':')[0] || 'System'}</span>
                                                    <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">{update.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{update.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Image 
                                            src="/images/NoMsg.png" 
                                            alt="No messages" 
                                            width={400}
                                            height={400}
                                            className="mx-auto mb-6 opacity-60"
                                        />
                                        <h3 className="text-lg font-semibold mb-2 text-foreground">All caught up!</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            You&apos;re all up to date.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* No data state - show when no children or when data is null */}
            {(!parentData || (parentData && parentData.children.length === 0)) && !loading && !error && (
                <Card className="shadow-md border-border bg-background">
                    <CardContent className="text-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                        <h3 className="text-lg font-semibold mb-2 text-foreground">No Children Enrolled</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            You don&apos;t have any children enrolled in therapy services yet. Get started by adding your first child or connecting to an existing account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => setShowConnectChild(true)}
                                variant="outline"
                                className="px-6 py-2"
                                aria-label="Connect to an existing child's therapy account"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect Existing Child
                            </Button>
                            <Button
                                onClick={() => setShowAddChild(true)}
                                className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-sm hover:opacity-90 transition"
                                aria-label="Add a new child to start therapy services"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Child
                            </Button>
                        </div>
                        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent">
                            <p className="text-sm text-accent-foreground font-medium mb-1">Need help getting started?</p>
                            <p className="text-xs text-accent-foreground">
                                If your Patient is already receiving services, ask your Patient for their Patient ID to connect their account.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}