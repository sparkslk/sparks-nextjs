"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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

interface SessionsTableProps {
  sessions: TherapySession[];
  recordsPerPage?: number;
}

const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  recordsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalRecords = sessions.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;

  // Get current page data
  const currentPageData = useMemo(() => {
    return sessions.slice(startIndex, endIndex);
  }, [sessions, startIndex, endIndex]);

  // Reset to first page when sessions changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sessions]);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
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
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border border-green-200 shadow-sm hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-200 shadow-sm hover:bg-red-200";
      case "rescheduled":
        return "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-200";
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 border border-green-200 shadow-sm hover:bg-green-200";
      case "absent":
        return "bg-red-100 text-red-700 border border-red-200 shadow-sm hover:bg-red-200";
      case "partial":
        return "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-200";
      case "pending":
        return "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-200";
    }
  };

  return (
    <div className="mt-8">
      <div className="relative bg-gradient-to-br from-white via-slate-50/30 to-white rounded-3xl shadow-xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8159A8]/20 via-blue-500/10 to-emerald-500/20 opacity-50">
          <div className="absolute inset-[1px] rounded-3xl bg-white/95 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-[#8159A8]/15 via-blue-500/8 to-teal-500/10 border-b-2 border-[#8159A8]/20">
              <tr>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Patient
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Therapist
                </th>
                <th className="text-center py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Type
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Date
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Time
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Duration
                </th>
                <th className="text-center py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Status
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 px-8 text-center text-gray-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8159A8]/10 to-blue-500/10 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-[#8159A8]" />
                      </div>
                      <span className="text-lg">
                        No sessions found matching your criteria
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageData.map((session, idx) => (
                  <tr
                    key={session.id}
                    className={`border-b border-gray-200/60 transition-all duration-300 transform hover:scale-[1.005] active:scale-[0.995] group ${idx % 2 === 0
                        ? "bg-white/60 backdrop-blur-sm"
                        : "bg-gradient-to-r from-slate-50/40 to-white/80 backdrop-blur-sm"
                      } hover:bg-gradient-to-r hover:from-[#8159A8]/8 hover:to-blue-500/5 hover:shadow-lg hover:border-[#8159A8]/30`}
                  >
                    <td className="py-6 px-8">
                      <div className="font-semibold text-gray-900 text-base transition-colors duration-300 group-hover:text-[#8159A8]">
                        {session.patient.name}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="font-medium text-gray-800 transition-colors duration-300 group-hover:text-gray-900">
                        {session.therapist.name}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 group-hover:shadow-md">
                        {session.type === "With Parent" ? "Family Session" : session.type}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="font-medium text-gray-800 transition-colors duration-300 group-hover:text-gray-900">
                        {formatDate(session.scheduledAt)}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="font-medium text-gray-800 transition-colors duration-300 group-hover:text-gray-900">
                        {formatTime(session.scheduledAt)}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center space-x-2 transition-all duration-300 group-hover:scale-105">
                        <div className="p-2 bg-indigo-100 rounded-xl shadow-sm">
                          <Clock className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-[#8159A8] transition-colors duration-300">
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span
                        className={`inline-flex px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 group-hover:shadow-lg capitalize ${getStatusColor(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <span
                        className={`inline-flex px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 group-hover:shadow-lg capitalize ${getAttendanceColor(
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

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="relative z-10 px-8 py-6 bg-gradient-to-r from-slate-50/60 via-white/40 to-slate-50/60 backdrop-blur-sm border-t-2 border-gray-200/60 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700 font-medium">
              <div className="p-2 bg-gradient-to-br from-[#8159A8]/10 to-blue-500/10 rounded-xl shadow-sm mr-3">
                <Calendar className="h-4 w-4 text-[#8159A8]" />
              </div>
              <span>
                Showing{" "}
                <span className="font-bold text-[#8159A8]">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-bold text-[#8159A8]">
                  {Math.min(endIndex, totalRecords)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#8159A8]">{totalRecords}</span>{" "}
                entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous Page Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${pageNum === currentPage
                      ? "bg-gradient-to-r from-[#8159A8] to-blue-600 text-white hover:from-[#6b4890] hover:to-blue-700 border-2 border-[#8159A8] shadow-md"
                      : "text-gray-700 hover:bg-[#8159A8] hover:text-white border-2 border-gray-300/60 hover:border-[#8159A8] backdrop-blur-sm"
                    }`}
                >
                  {pageNum}
                </Button>
              ))}

              {/* Next Page Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last Page Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsTable;