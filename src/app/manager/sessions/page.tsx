"use client";

import { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SessionsTable from "@/components/admin/sessions/sessions-table";
import SessionFilters from "@/components/admin/sessions/session-filters";

interface TherapySession {
  id: number;
  patient: {
    id: number;
    name: string;
  };
  therapist: {
    id: number;
    name: string;
  };
  scheduledAt: string;
  duration: number; // in minutes
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  type: string;
  attendanceStatus: "present" | "absent" | "partial" | "pending";
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedType, setSelectedType] = useState("All Types");

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Frontend: Attempting to fetch sessions...");
        const response = await fetch("/api/manager/sessions");

        console.log("Frontend: Response status:", response.status);
        console.log("Frontend: Response ok:", response.ok);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Frontend: API Error:", errorData);
          throw new Error(
            `Failed to fetch sessions: ${response.status} - ${
              errorData.error || "Unknown error"
            }`
          );
        }

        const data = await response.json();
        console.log("Frontend: Fetched sessions:", data);
        setSessions(data);
      } catch (err) {
        console.error("Frontend: Fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching sessions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter logic
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        session.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.therapist.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        selectedStatus === "All Status" || session.status === selectedStatus;

      // Type filter
      const matchesType =
        selectedType === "All Types" || session.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchTerm, selectedStatus, selectedType]);

  const stats = {
    total: filteredSessions.length,
    scheduled: filteredSessions.filter((s) => s.status === "SCHEDULED").length,
    completed: filteredSessions.filter((s) => s.status === "COMPLETED").length,
    cancelled: filteredSessions.filter((s) => s.status === "CANCELLED").length,
    present: filteredSessions.filter((s) => s.attendanceStatus === "present")
      .length,
    absent: filteredSessions.filter((s) => s.attendanceStatus === "absent")
      .length,
  };

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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
              Session Oversight
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <CalendarDays className="h-8 w-8" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <CalendarClock
                className="h-8 w-8"
                style={{ color: "#3321d2ff" }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.scheduled}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-8 w-8" style={{ color: "#28a745" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-8 w-8" style={{ color: "#dc3545" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.cancelled}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <SessionFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      />

      {/* Paginated Table */}
      <SessionsTable sessions={filteredSessions} recordsPerPage={10} />
    </div>
  );
}
