"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

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
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
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

  return (
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
            {currentPageData.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 px-6 text-center text-gray-500"
                >
                  No sessions found matching your criteria
                </td>
              </tr>
            ) : (
              currentPageData.map((session, idx) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} entries
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* First Page Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Previous Page Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
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
                className={`h-8 w-8 p-0 ${
                  pageNum === currentPage 
                    ? "bg-[#8159A8] text-white hover:bg-[#6b4890]" 
                    : "text-gray-700 hover:bg-gray-100"
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
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Last Page Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsTable;