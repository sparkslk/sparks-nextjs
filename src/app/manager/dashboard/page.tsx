"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, CalendarCheck, RefreshCw } from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/reports/charts";

interface SessionOversight {
  id: string;
  therapist: {
    id: string;
    name: string;
    email: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  };
  sessionDetails: {
    duration: number;
    status: string;
    scheduledAt: string;
    createdAt: string;
  };
}

interface ManagerData {
  systemStatus: "online" | "offline" | "maintenance";
  totalUsers: number;
  newUsersThisMonth: number;
  databaseSize: string;
  databaseUsage: number;
  totalSessions: number;
  newSessionsThisMonth: number;
  sessionOversightData: SessionOversight[];
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

export default function ManagerDashboard() {
  const [managerData, setManagerData] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const response = await fetch("/api/manager/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch manager data");
      }
      const data = await response.json();
      setManagerData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching manager data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3FB]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Unable to load dashboard
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 mt-0">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-1">
            Manager Dashboard
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Status
              </CardTitle>
              <Zap className="h-12 w-12" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  managerData?.systemStatus === "online"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {managerData?.systemStatus
                  ? managerData.systemStatus.charAt(0).toUpperCase() +
                    managerData.systemStatus.slice(1)
                  : "Unknown"}
              </div>
              <p className="text-xs text-muted-foreground">99.9% uptime</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-12 w-12" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managerData?.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{managerData?.newUsersThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <CalendarCheck
                className="h-12 w-12"
                style={{ color: "#8159A8" }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managerData?.totalSessions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{managerData?.newSessionsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  );
}
