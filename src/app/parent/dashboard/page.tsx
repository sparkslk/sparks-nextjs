

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import ParentNavigation from "../navigation/parentNavigation";

interface ParentData {
    children: Array<{
        id: string;
        firstName: string;
        lastName: string;
        upcomingSessions: number;
        progressReports: number;
        progressPercentage: number;
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <div className="min-h-screen bg-gray-50">
            <ParentNavigation parentData={parentData ?? undefined} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardContent className="p-6">
                            <div className="text-sm font-medium mb-1" style={{ color: '#8159A8' }}>Children Registered</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{parentData?.children.length || 0}</div>
                            <div className="text-xs text-gray-500">Active accounts</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardContent className="p-6">
                            <div className="text-sm font-medium mb-1" style={{ color: '#8159A8' }}>Next Appointment</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{parentData?.totalUpcomingSessions || 0}</div>
                            <div className="text-xs text-gray-500">Days away</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardContent className="p-6">
                            <div className="text-sm font-medium mb-1" style={{ color: '#8159A8' }}>Unread Messages</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{parentData?.unreadMessages || 0}</div>
                            <div className="text-xs text-gray-500">From therapists</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
                        <CardContent className="p-6">
                            <div className="text-sm font-medium mb-1" style={{ color: '#8159A8' }}>Progress Reports</div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {parentData?.children.reduce((sum, child) => sum + child.progressReports, 0) || 0}
                            </div>
                            <div className="text-xs text-gray-500">New reports available</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Children Progress */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900">Children Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {parentData?.children.map((child) => (
                                <div key={child.id} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{child.firstName} {child.lastName}</h4>
                                            <p className="text-sm text-gray-600">Upcoming Sessions: {child.upcomingSessions}</p>
                                        </div>                        <span className="px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#8159A8', color: 'white' }}>
                            ACTIVE
                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${child.progressPercentage}%`,
                                                    backgroundColor: '#8159A8'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">Task Completion: {child.progressPercentage}%</p>
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
                <br/>

                {/* No data state */}
                {!parentData && !loading && !error && (
                    <Card className="shadow-sm">
                        <CardContent className="text-center py-12">
                            <Users className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                            <h3 className="text-lg font-semibold mb-2 text-gray-900">No Children Enrolled</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                You don&apos;t have any children enrolled in therapy services yet. Get started by adding your first child.
                            </p>
                            <Button 
                                onClick={() => router.push("/parent/children/add")}
                                style={{ backgroundColor: '#8159A8' }}
                                className="text-white px-6 py-2 hover:opacity-90"
                            >
                                Add Child
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}