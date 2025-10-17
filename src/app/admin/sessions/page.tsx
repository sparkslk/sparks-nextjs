"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CalendarDays, CalendarClock, CheckCircle2, XCircle, Filter, Search, X, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  status: "SCHEDULED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  type: string;
  attendanceStatus: "PRESENT" | "LATE" | string;
  refundDetails?: {
    id: number | string;
    originalAmount: number | null;
    refundAmount: number | null;
    refundPercentage: number | null;
    cancellationTime: string | Date | null;
    sessionTime: string | Date | null;
    cancelReason: string | null;
    bankAccountName: string | null;
    bankName: string | null;
    accountNumber: string | null;
    branchCode: string | null;
    refundStatus: string | null;
  } | null;
}

export default function SessionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [activeRefund, setActiveRefund] = useState<
    TherapySession["refundDetails"] | null
  >(null);
  const [refundEditStatus, setRefundEditStatus] = useState<string>("PENDING");
  const [refundAdminNote, setRefundAdminNote] = useState<string>("");

  // Add filter state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "scheduled" | "completed" | "cancelled" | "no-show"
  >("all");

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/sessions");

        console.log("Frontend: Response status:", response.status);

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

  // Removed status color chip generation; not needed for the simplified tables

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
    if (!minutes && minutes !== 0) return "-";
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const mapAttendanceLabel = (attendance?: string) => {
    const normalized = (attendance || "").toUpperCase();
    return normalized === "LATE" ? "Late" : "On time";
  };

  const getStatusBadgeClasses = (status: string) => {
    const s = status.toLowerCase();
    if (s === "scheduled")
      return "border-transparent [a&]:hover:bg-primary/90 bg-blue-100 text-blue-800";
    if (s === "rescheduled")
      return "border-transparent [a&]:hover:bg-primary/90 bg-yellow-100 text-yellow-800";
    if (s === "completed")
      return "border-transparent [a&]:hover:bg-primary/90 bg-green-100 text-green-800";
    if (["cancelled", "declined"].includes(s))
      return "border-transparent [a&]:hover:bg-primary/90 bg-red-100 text-red-800";
    if (["no_show", "no-show"].includes(s))
      return "border-transparent [a&]:hover:bg-primary/90 bg-orange-100 text-orange-800";
  };

  const getRefundBadgeClasses = (refundStatus?: string | null) => {
    const s = (refundStatus || "").toString().toLowerCase();
    if (s === "completed")
      return "bg-green-50 text-green-800 border border-green-200";
    if (s === "failed") return "bg-red-50 text-red-800 border border-red-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const formatStatusLabel = (status: string) => {
    if (!status) return "-";
    return status
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/(^|\s)\S/g, (t) => t.toUpperCase());
  };

  const renderCompletedCards = (rows: TherapySession[]) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No completed sessions found
        </div>
      ) : (
        rows.map((session) => (
          <div
            key={session.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with Patient Info and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Patient Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {session.patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>

                {/* Patient Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {session.patient.id}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                  session.status
                )}`}
              >
                Completed
              </span>
            </div>

            {/* Session Details Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(session.scheduledAt)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline
                      points="12 6 12 12 16 14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(session.scheduledAt)}
                  </p>
                </div>
              </div>

              {/* Type */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {session.type}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <RefreshCw className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDuration(session.duration)}
                  </p>
                </div>
              </div>
            </div>

            {/* Therapist and Attendance Status */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Therapist:</span>{" "}
                <span className="font-semibold text-[#6B46A0] text-base">
                  {session.therapist.name}
                </span>
              </div>

              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {mapAttendanceLabel(session.attendanceStatus)}
              </span>
            </div>

            {/* Removed view details eye icon button */}
          </div>
        ))
      )}
    </div>
  );

  const renderScheduledCards = (rows: TherapySession[]) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No scheduled sessions found
        </div>
      ) : (
        rows.map((session) => (
          <div
            key={session.id}
            className={`relative ${
              session.status === "RESCHEDULED"
                ? "border border-yellow-200 bg-yellow-50/50 dark:bg-slate-950"
                : "bg-white"
            } rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {session.patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {session.patient.id}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                  session.status
                )}`}
              >
                {session.status === "RESCHEDULED"
                  ? "Reschedule Requested"
                  : formatStatusLabel(session.status)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline
                      points="12 6 12 12 16 14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDuration(session.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {session.type}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Therapist:</span>{" "}
                <span className="font-semibold text-[#6B46A0] text-base">
                  {session.therapist.name}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCancelledCards = (rows: TherapySession[]) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No cancelled sessions found
        </div>
      ) : (
        rows.map((session) => (
          <div
            key={session.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {session.patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {session.patient.id}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                  session.status
                )}`}
              >
                {formatStatusLabel(session.status)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline
                      points="12 6 12 12 16 14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {session.type}
                  </p>
                </div>
              </div>

              {/* Refund Status (badge) */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Refund Status</p>
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getRefundBadgeClasses(
                      session.refundDetails?.refundStatus
                    )}`}
                  >
                    {session.refundDetails?.refundStatus || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Therapist:</span>{" "}
                <span className="font-semibold text-[#6B46A0] text-base">
                  {session.therapist.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveRefund(session.refundDetails ?? null);
                  setRefundEditStatus(
                    (
                      session.refundDetails?.refundStatus || "PENDING"
                    ).toUpperCase()
                  );
                  setRefundAdminNote("");
                  setShowRefundModal(true);
                }}
              >
                View refund details
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderNoShowCards = (rows: TherapySession[]) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No no-show sessions found
        </div>
      ) : (
        rows.map((session) => (
          <div
            key={session.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {session.patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {session.patient.id}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                  session.status
                )}`}
              >
                {formatStatusLabel(session.status)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline
                      points="12 6 12 12 16 14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg
                    className="w-6 h-6 text-[#6B46A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {session.type}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Therapist:</span>{" "}
                <span className="font-semibold text-[#6B46A0] text-base">
                  {session.therapist.name}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const filterSessionsByTab = (tab: string) => {
    let filteredSessions;
    switch (tab) {
      case "scheduled":
        filteredSessions = sessions.filter((session) =>
          ["SCHEDULED", "RESCHEDULED"].includes(session.status)
        );
        break;
      case "completed":
        filteredSessions = sessions.filter(
          (session) => session.status === "COMPLETED"
        );
        break;
      case "cancelled":
        filteredSessions = sessions.filter(
          (session) => session.status === "CANCELLED"
        );
        break;
      case "no-show":
        filteredSessions = sessions.filter(
          (session) => session.status === "NO_SHOW"
        );
        break;
      case "all":
        filteredSessions = sessions;
        break;
      default:
        filteredSessions = sessions;
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredSessions = filteredSessions.filter(
        (session) =>
          (session.patient.name?.toLowerCase() || "").includes(lowerSearch) ||
          String(session.patient.id ?? "")
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    // Apply date range filter
    if (dateFrom) {
      filteredSessions = filteredSessions.filter((session) => {
        const sessionDate = new Date(session.scheduledAt)
          .toISOString()
          .split("T")[0];
        return sessionDate >= dateFrom;
      });
    }
    if (dateTo) {
      filteredSessions = filteredSessions.filter((session) => {
        const sessionDate = new Date(session.scheduledAt)
          .toISOString()
          .split("T")[0];
        return sessionDate <= dateTo;
      });
    }

    // Apply type filter
    if (selectedType && selectedType !== "all") {
      filteredSessions = filteredSessions.filter(
        (session) => session.type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    return filteredSessions;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setSelectedType("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    dateFrom ||
    dateTo ||
    (selectedType && selectedType !== "all");

  // Get unique session types for filter dropdown
  const sessionTypes = [
    ...new Set(
      sessions.map((session) => session.type).filter((type) => type != null)
    ),
  ];

  // Stats derived from the sessions list using the same tab-filtering logic
  const stats = {
    total: sessions.length,
    scheduled: filterSessionsByTab("scheduled").length,
    completed: filterSessionsByTab("completed").length,
    cancelled: filterSessionsByTab("cancelled").length,
    no_show: filterSessionsByTab("no-show").length,
    present: sessions.filter((s) => s.attendanceStatus === "PRESENT").length,
    absent: sessions.filter((s) => s.attendanceStatus === "LATE").length,
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({stats.scheduled})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({stats.cancelled})
          </TabsTrigger>
          <TabsTrigger value="no-show">No-Show ({stats.no_show})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters 
      <SessionFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onSearchChange={setSearchTerm}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      /> */}

      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0.5 text-xs"
                >
                  {
                    [searchTerm, dateFrom, dateTo, selectedType].filter(Boolean)
                      .length
                  }
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Showing {filterSessionsByTab(activeTab).length} of {sessions.length}{" "}
            sessions
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Patient name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Session Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Session Type
                </label>
                <Select
                  value={selectedType || "all"}
                  onValueChange={(value) =>
                    setSelectedType(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Paginated Table */}
      <div className="mt-4">
        {activeTab === "scheduled" &&
          renderScheduledCards(filterSessionsByTab("scheduled"))}
        {activeTab === "completed" &&
          renderCompletedCards(filterSessionsByTab("completed"))}
        {activeTab === "no-show" &&
          renderNoShowCards(filterSessionsByTab("no-show"))}
        {activeTab === "cancelled" &&
          renderCancelledCards(filterSessionsByTab("cancelled"))}
        {activeTab === "all" && (
          <div className="grid gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Scheduled</h3>
              {renderScheduledCards(filterSessionsByTab("scheduled"))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Completed</h3>
              {renderCompletedCards(filterSessionsByTab("completed"))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Cancelled</h3>
              {renderCancelledCards(filterSessionsByTab("cancelled"))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">No-Show</h3>
              {renderNoShowCards(filterSessionsByTab("no-show"))}
            </div>
          </div>
        )}
      </div>
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowRefundModal(false)}
          />
          <div className="relative z-50 w-full max-w-2xl mx-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Refund details</h3>
                  {/* Refund status badge (moved into header) */}
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${
                      (activeRefund?.refundStatus || "").toLowerCase() ===
                      "completed"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : (activeRefund?.refundStatus || "").toLowerCase() ===
                          "failed"
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {(activeRefund?.refundStatus &&
                      activeRefund.refundStatus.toString()) ||
                      "Pending"}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRefundModal(false)}
                >
                  Close
                </Button>
              </div>
              {activeRefund ? (
                <div className="space-y-4 text-sm text-gray-700">
                  {/* Financial details section */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Financial details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Original amount
                        </p>
                        <p className="font-semibold">
                          {activeRefund.originalAmount != null
                            ? `Rs.${activeRefund.originalAmount}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Refund amount
                        </p>
                        <p className="font-semibold">
                          {activeRefund.refundAmount != null
                            ? `Rs.${activeRefund.refundAmount}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Refund percentage
                        </p>
                        <p className="font-semibold">
                          {activeRefund.refundPercentage != null
                            ? `${Math.round(activeRefund.refundPercentage)}%`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates & times: separate date and time fields */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dates & times</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Cancellation date
                        </p>
                        <p className="font-semibold">
                          {activeRefund.cancellationTime
                            ? new Date(
                                activeRefund.cancellationTime
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Cancellation time
                        </p>
                        <p className="font-semibold">
                          {activeRefund.cancellationTime
                            ? new Date(
                                activeRefund.cancellationTime
                              ).toLocaleTimeString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Session date
                        </p>
                        <p className="font-semibold">
                          {activeRefund.sessionTime
                            ? new Date(
                                activeRefund.sessionTime
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Session time
                        </p>
                        <p className="font-semibold">
                          {activeRefund.sessionTime
                            ? new Date(
                                activeRefund.sessionTime
                              ).toLocaleTimeString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank details section */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Bank details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Account name
                        </p>
                        <p className="font-semibold">
                          {activeRefund.bankAccountName || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Bank name</p>
                        <p className="font-semibold">
                          {activeRefund.bankName || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Account number
                        </p>
                        <p className="font-semibold">
                          {activeRefund.accountNumber || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Branch code
                        </p>
                        <p className="font-semibold">
                          {activeRefund.branchCode || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cancel reason</p>
                    <p className="font-semibold">
                      {activeRefund.cancelReason || "-"}
                    </p>
                  </div>

                  {/* Admin controls: show controls only when refund is not COMPLETED */}
                  {(activeRefund.refundStatus || "").toUpperCase() !==
                  "COMPLETED" ? (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">
                        Update refund
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setRefundEditStatus("PENDING")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${
                            refundEditStatus === "PENDING"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => setRefundEditStatus("COMPLETED")}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${
                            refundEditStatus === "COMPLETED"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Admin note (optional)
                        </label>
                        <textarea
                          value={refundAdminNote}
                          onChange={(e) => setRefundAdminNote(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8159A8]"
                          placeholder="Add any note about the manual payment"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowRefundModal(false)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              if (!activeRefund?.id) {
                                alert("Missing refund id");
                                return;
                              }
                              // Always log the id before and after fetch
                              console.log(
                                "Updating refund id:",
                                activeRefund.id
                              );
                              const res = await fetch(
                                `/api/admin/sessions/refund/${activeRefund.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    refundStatus: refundEditStatus,
                                    adminNote: refundAdminNote,
                                  }),
                                }
                              );
                              if (!res.ok) {
                                let err;
                                try {
                                  err = await res.json();
                                } catch {
                                  err = null;
                                }
                                console.error(
                                  "Refund PATCH response:",
                                  err,
                                  res.status
                                );
                                throw new Error(
                                  err && (err.error || err.message)
                                    ? err.error || err.message
                                    : `Failed to update refund (${res.status})`
                                );
                              } else {
                                const body = await res.json().catch(() => ({}));
                                console.log("Refund PATCH success:", body);
                              }
                              // Update local activeRefund to show completed status and saved note
                              setActiveRefund((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      refundStatus: refundEditStatus,
                                      cancelReason:
                                        prev.cancelReason ??
                                        prev.cancelReason /* keep existing */,
                                    }
                                  : prev
                              );
                              // If admin provided a note and the status is completed, store it on activeRefund
                              if (
                                refundAdminNote &&
                                refundEditStatus.toUpperCase() === "COMPLETED"
                              ) {
                                setActiveRefund((prev) =>
                                  prev
                                    ? { ...prev, adminNote: refundAdminNote }
                                    : prev
                                );
                              }
                              // Keep modal open and re-fetch sessions in background to refresh source of truth
                              setLoading(true);
                              fetch("/api/admin/sessions")
                                .then((res) => res.json())
                                .then(setSessions)
                                .catch(console.error)
                                .finally(() => setLoading(false));
                            } catch (e) {
                              console.error("Refund save error", e);
                              alert(
                                e instanceof Error
                                  ? e.message
                                  : "Failed to update refund"
                              );
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Admin note</p>
                      <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
                        {(activeRefund as any)?.adminNote
                          ? (activeRefund as any).adminNote
                          : "No admin note provided."}
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowRefundModal(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No refund details available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
