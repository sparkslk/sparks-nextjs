"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionModal } from "@/components/admin/session-modal";
import { Users, Database, Zap, CalendarCheck, RefreshCw, Calendar } from "lucide-react";

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
  // Mock therapist requests data (replace with API call in production)
  const mockTherapistRequests = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "ADHD Specialist",
      status: "pending",
      submittedAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Child Psychology",
      status: "under_review",
      submittedAt: "2025-01-14T14:15:00Z",
    },
    {
      id: "3",
      name: "Dr. Nadeesha Perera",
      specialty: "Clinical Psychology",
      status: "approved",
      submittedAt: "2025-01-10T09:00:00Z",
    },
  ];

  const [managerData, setManagerData] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Database Size
              </CardTitle>
              <Database className="h-12 w-12" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managerData?.databaseSize || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {managerData?.databaseUsage || 0}% of capacity
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-[#8159A8]">
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {managerData?.sessionOversightData &&
                managerData.sessionOversightData.length > 0 ? (
                  managerData.sessionOversightData.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-base text-gray-800 mb-1">
                          {session.therapist.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">Patient:</span>{" "}
                            {session.patient.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-gray-500">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {session.sessionDetails.duration} minutes
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              session.sessionDetails.status.toLowerCase() ===
                              "completed"
                                ? "bg-green-100 text-green-700"
                                : session.sessionDetails.status.toLowerCase() ===
                                  "scheduled"
                                ? "bg-blue-100 text-blue-700"
                                : session.sessionDetails.status.toLowerCase() ===
                                  "in-progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : session.sessionDetails.status.toLowerCase() ===
                                  "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {session.sessionDetails.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-sm font-semibold text-gray-700 mb-0.5">
                          {new Date(
                            session.sessionDetails.scheduledAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(
                            session.sessionDetails.scheduledAt
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No recent sessions</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  className="hover:opacity-90 hover:shadow-md transition-all duration-200 font-medium"
                  style={{ backgroundColor: "#8159A8", color: "white" }}
                  onClick={() => setShowSessionModal(true)}
                >
                  View All Sessions
                </Button>
                <SessionModal
                  isOpen={showSessionModal}
                  onClose={() => setShowSessionModal(false)}
                  sessions={
                    managerData?.sessionOversightData
                      ? managerData.sessionOversightData.map((session) => ({
                          id: session.id,
                          name: session.therapist.name,
                          amount:
                            session.sessionDetails?.duration?.toString() || "0",
                          commission: "N/A",
                          sessionDetails: `Session with ${session.patient.name} • ${session.sessionDetails.duration} mins • ${session.sessionDetails.status}`,
                          scheduledAt: session.sessionDetails.scheduledAt,
                        }))
                      : []
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-[#8159A8]">
                Recent Therapist Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTherapistRequests && mockTherapistRequests.length > 0 ? (
                  mockTherapistRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-base text-gray-800 mb-1">
                          {request.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">Specialty:</span>
                            {request.specialty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(request.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : request.status === "under_review"
                                ? "bg-blue-100 text-blue-700"
                                : request.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : request.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {request.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-sm text-gray-500 mb-0.5">
                          Request
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">
                      No recent therapist requests
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  className="hover:opacity-90 hover:shadow-md transition-all duration-200 font-medium"
                  style={{ backgroundColor: "#8159A8", color: "white" }}
                  //onClick={() => router.push("/manager/applications")}
                >
                  View All Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
