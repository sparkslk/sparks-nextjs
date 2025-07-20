"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface UserTableProps {
  selectedRole: string;
  filteredUsers: any[];
  setEditUser: (user: any) => void;
  setEditModalOpen: (open: boolean) => void;
  setDeleteUser: (user: any) => void;
  setDeleteModalOpen: (open: boolean) => void;
  setEmergencyContactDetails: (details: string | null) => void;
  setEmergencyContactOpen: (open: boolean) => void;
  recordsPerPage?: number;
}

function getRoleColor(role: string) {
  switch (role) {
    case "Patient":
      return "bg-green-100 text-green-800";
    case "Therapist":
      return "bg-blue-100 text-blue-800";
    case "Guardian":
      return "bg-yellow-100 text-yellow-800";
    case "Manager":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

const UserTable: React.FC<UserTableProps> = ({
  selectedRole,
  filteredUsers,
  setEditUser,
  setEditModalOpen,
  setDeleteUser,
  setDeleteModalOpen,
  setEmergencyContactDetails,
  setEmergencyContactOpen,
  recordsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;

  // Get current page data
  const currentPageData = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex]);

  // Reset to first page when filteredUsers changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredUsers]);

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

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-[#f5f3fb] to-[#e9e4f5] border-b-2 border-[#8159A8]">
            <tr>
              <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                User
              </th>
              <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                Role
              </th>
              <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                Joined Date
              </th>
              {/* Dynamic Headers */}
              {selectedRole === "Patient" && (
                <>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Gender
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Phone
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    DOB
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Address
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Medical History
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Emergency Contact
                  </th>
                </>
              )}
              {selectedRole === "Therapist" && (
                <>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    License
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Specialization
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Experience
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Availability
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Rating
                  </th>
                </>
              )}
              {selectedRole === "Guardian" && (
                <>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Patient
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Relationship
                  </th>
                </>
              )}
              {selectedRole === "Manager" && (
                <>
                  <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                    Email
                  </th>
                </>
              )}
              <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((user, idx) => (
              <tr
                key={user.id}
                className={`border-b transition-colors duration-200 ${
                  idx % 2 === 0 ? "bg-[#f9f7fc]" : "bg-white"
                } hover:bg-[#f3eaff]`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-semibold text-base shadow-md border-2 border-white`}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-base">
                        {user.name}
                      </div>
                      {user.email && (
                        <div className="text-xs text-gray-500">{user.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-700">
                  {user.joinedDate}
                </td>
                {/* Dynamic Cells */}
                {user.role === "Patient" && selectedRole === "Patient" && (
                  <>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.gender}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.phone}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.dateOfBirth}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.address}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.medicalHistory}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-[#8159A8] text-[#8159A8] hover:bg-[#f5f3fb]"
                        onClick={() => {
                          setEmergencyContactDetails(user.emergencyContact);
                          setEmergencyContactOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </>
                )}
                {user.role === "Therapist" &&
                  selectedRole === "Therapist" && (
                    <>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.licenseNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.specialization}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.experience}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.availability}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.rating}
                      </td>
                    </>
                  )}
                {user.role === "Guardian" &&
                  selectedRole === "Guardian" && (
                    <>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.patient}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.relationship}
                      </td>
                    </>
                  )}
                {user.role === "Manager" &&
                  selectedRole === "Manager" && (
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.email}
                    </td>
                  )}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-[#8159A8] text-[#8159A8] hover:bg-[#f5f3fb]"
                      onClick={() => {
                        setEditUser(user);
                        setEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-red-500 text-red-600 hover:bg-red-200 hover:text-red-800"
                      onClick={() => {
                        setDeleteUser(user);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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

export default UserTable;