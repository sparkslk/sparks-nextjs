

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
                    <div className="bg-white rounded-lg p-6">
                        <div className="text-sm text-gray-600 mb-1">Children Registered</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{parentData?.children.length || 0}</div>
                        <div className="text-xs text-gray-500">Active accounts</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6">
                        <div className="text-sm text-gray-600 mb-1">Next Appointment</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{parentData?.totalUpcomingSessions || 0}</div>
                        <div className="text-xs text-gray-500">Days away</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6">
                        <div className="text-sm text-gray-600 mb-1">Unread Messages</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{parentData?.unreadMessages || 0}</div>
                        <div className="text-xs text-gray-500">From therapists</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6">
                        <div className="text-sm text-gray-600 mb-1">Progress Reports</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {parentData?.children.reduce((sum, child) => sum + child.progressReports, 0) || 0}
                        </div>
                        <div className="text-xs text-gray-500">New reports available</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Children Progress */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Children Progress</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {parentData?.children.map((child) => (
                                <div key={child.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{child.firstName} {child.lastName}</h4>
                                            <p className="text-sm text-gray-500">Upcoming Sessions: {child.upcomingSessions}</p>
                                        </div>
                                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                                            ACTIVE
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${Math.min(child.progressReports * 10, 100)}%`,
                                                    backgroundColor: '#8159A8'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">Task Completion: {Math.min(child.progressReports * 10, 100)}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
                        </div>
                        <div className="p-6">
                            {parentData && parentData.recentUpdates.length > 0 ? (
                                <div className="space-y-4">
                                    {parentData.recentUpdates.map((update) => (
                                        <div key={update.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">{update.message.split(':')[0] || 'System'}</span>
                                                <span className="text-xs text-gray-500">{update.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{update.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent updates</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* No data state */}
                {!parentData && !loading && !error && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Children Enrolled</h3>
                        <p className="text-gray-600 mb-4 text-center">
                            You don&apos;t have any children enrolled in therapy services yet.
                        </p>
                        <Button 
                            onClick={() => router.push("/parent/children/add")}
                            style={{ backgroundColor: '#8159A8' }}
                            className="text-white hover:opacity-90"
                        >
                            Add Child
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}