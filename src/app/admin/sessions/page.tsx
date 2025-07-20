"use client";

import { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  Loader,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  type: string;
  attendanceStatus: "present" | "absent" | "partial" | "pending";
}

// Simple filter component inline (since SessionFilters might not match our new structure)
const SessionFilters = ({
  searchTerm,
  selectedStatus,
  selectedType,
  selectedAttendance,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onAttendanceChange,
  sessions,
}: {
  searchTerm: string;
  selectedStatus: string;
  selectedType: string;
  selectedAttendance: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onAttendanceChange: (value: string) => void;
  sessions: TherapySession[];
}) => {
  // Get unique values for dropdowns
  const uniqueStatuses = [
    "All Status",
    ...Array.from(new Set(sessions.map((s) => s.status))),
  ];
  const uniqueTypes = [
    "All Types",
    ...Array.from(new Set(sessions.map((s) => s.type))),
  ];
  const uniqueAttendance = [
    "All Attendance",
    ...Array.from(new Set(sessions.map((s) => s.attendanceStatus))),
  ];

  return (
    <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search patients, therapists, or type..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-transparent"
          >
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-transparent"
          >
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attendance
          </label>
          <select
            value={selectedAttendance}
            onChange={(e) => onAttendanceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-transparent"
          >
            {uniqueAttendance.map((attendance) => (
              <option key={attendance} value={attendance}>
                {attendance}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedAttendance, setSelectedAttendance] =
    useState("All Attendance");

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Frontend: Attempting to fetch sessions...");
        const response = await fetch("/api/admin/sessions");

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

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.therapist.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Status" || session.status === selectedStatus;
      const matchesType =
        selectedType === "All Types" || session.type === selectedType;
      const matchesAttendance =
        selectedAttendance === "All Attendance" ||
        session.attendanceStatus === selectedAttendance;

      return matchesSearch && matchesStatus && matchesType && matchesAttendance;
    });
  }, [sessions, searchTerm, selectedStatus, selectedType, selectedAttendance]);

  const stats = {
    total: filteredSessions.length,
    scheduled: filteredSessions.filter((s) => s.status === "scheduled").length,
    completed: filteredSessions.filter((s) => s.status === "completed").length,
    cancelled: filteredSessions.filter((s) => s.status === "cancelled").length,
    present: filteredSessions.filter((s) => s.attendanceStatus === "present")
      .length,
    absent: filteredSessions.filter((s) => s.attendanceStatus === "absent")
      .length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
              <CalendarDays className="h-8 w-8" style={{ color: '#8159A8' }} />
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
              <CalendarClock className="h-8 w-8" style={{ color: '#3321d2ff' }} />
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
              <CheckCircle2 className="h-8 w-8" style={{ color: '#28a745' }} />
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
              <XCircle className="h-8 w-8" style={{ color: '#dc3545' }} />
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
        selectedAttendance={selectedAttendance}
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
        onAttendanceChange={setSelectedAttendance}
        sessions={sessions}
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-[#f5f3fb] to-[#e9e4f5] border-b-2 border-[#8159A8]">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Patient
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Therapist
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Type
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Date
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Time
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Duration
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 px-6 text-center text-gray-500"
                  >
                    No sessions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, idx) => (
                  <tr
                    key={session.id}
                    className={`border-b transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-[#f9f7fc]" : "bg-white"
                    } hover:bg-[#f3eaff]`}
                  >
                    <td className="py-4 px-6 font-medium">
                      {session.patient.name}
                    </td>
                    <td className="py-4 px-6">{session.therapist.name}</td>
                    <td className="py-4 px-6">{session.type}</td>
                    <td className="py-4 px-6">
                      {formatDate(session.scheduledAt)}
                    </td>
                    <td className="py-4 px-6">
                      {formatTime(session.scheduledAt)}
                    </td>
                    <td className="py-4 px-6">
                      {formatDuration(session.duration)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getAttendanceColor(
                          session.attendanceStatus
                        )}`}
                      >
                        {session.attendanceStatus || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
