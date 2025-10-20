"use client";

import React, { useEffect, useState } from "react";
import { Users, TrendingUp, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Type Definitions ---
interface RegistrationData {
  month: string;
  patients: number;
  guardians: number;
  therapists: number;
}
interface LeaderboardData {
  name: string;
  sessionCount: number;
  patientCount: number;
}
interface SessionGrowthData {
    month: string;
    sessions: number;
}
interface RevenueData {
    name: string;
    value: number;
}
const PIE_COLORS = ["#8b5cf6", "#10b981"];

export function AnalyticsDashboard() {
  // --- State Management for all charts ---
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [sessionGrowthData, setSessionGrowthData] = useState<SessionGrowthData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseUrl = window.location.origin;
        
        const [regResponse, leaderboardResponse, sessionResponse, revenueResponse] = await Promise.all([
          fetch(`${baseUrl}/api/admin/reports`),
          fetch(`${baseUrl}/api/admin/reports?chart=therapistLeaderboard`),
          fetch(`${baseUrl}/api/admin/reports?chart=sessionGrowth`),
          fetch(`${baseUrl}/api/admin/reports?chart=revenueBreakdown`),
        ]);

        if (!regResponse.ok || !leaderboardResponse.ok || !sessionResponse.ok || !revenueResponse.ok) {
            throw new Error(`One or more API requests failed`);
        }

        const regData = await regResponse.json();
        const leaderboardData = await leaderboardResponse.json();
        const sessionData = await sessionResponse.json();
        const revenueData = await revenueResponse.json();

        setRegistrationData(regData);
        setLeaderboardData(leaderboardData);
        setSessionGrowthData(sessionData);
        setRevenueData(revenueData);

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalyticsData();
  }, []);

  // --- Main Render ---
  return (
    <div className="bg-transparent">
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* --- Loading and Error States --- */}
                {loading && <p className="col-span-full text-center text-gray-500 py-10">Loading dashboard...</p>}
                {error && <p className="col-span-full text-center text-red-500 py-10">Error: {error}</p>}
                
                {!loading && !error && (
                    <>
                        {/* --- User Registration Growth Chart Card --- */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">User Registration Growth</CardTitle>
                                        <p className="text-sm text-gray-500">Total users over time</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={registrationData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} name="Patients" />
                                        <Line type="monotone" dataKey="guardians" stroke="#10b981" strokeWidth={2} name="Guardians" />
                                        <Line type="monotone" dataKey="therapists" stroke="#f59e0b" strokeWidth={2} name="Therapists" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* --- Therapist Leaderboard Chart Card --- */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Therapist Leaderboard</CardTitle>
                                        <p className="text-sm text-gray-500">Top performing therapists</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={leaderboardData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} angle={-25} textAnchor="end" height={70} />
                                        <YAxis type="number" stroke="#6b7280" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                        <Legend verticalAlign="top" />
                                        <Bar dataKey="sessionCount" name="Sessions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="patientCount" name="Patients" fill="#ec4899" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* --- Therapy Session Growth Chart --- */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Therapy Session Growth</CardTitle>
                                        <p className="text-sm text-gray-500">New sessions created per month</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={sessionGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                        <Legend verticalAlign="top" />
                                        <Bar dataKey="sessions" name="Sessions" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* --- Revenue Source Breakdown --- */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Revenue Breakdown</CardTitle>
                                        <p className="text-sm text-gray-500">Total income by source</p>
                                    </div>
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-yellow-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={revenueData as any[]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {revenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    </div>
  );
}