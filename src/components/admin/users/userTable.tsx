"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Users,
  Star,
  Award,
  Clock,
  FileText,
  Shield,
} from "lucide-react";

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

// Updated UserDetailsModal Component with purple color scheme
const UserDetailsModal: React.FC<{
  user: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const isPatient = user.role === "Patient";
  const isTherapist = user.role === "Therapist";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-white/30">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                  {user.role}
                </span>
                <span className="text-white/90 text-sm">
                  Joined {user.joinedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto w-70% max-h-[calc(90vh-120px)]">
          {isPatient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{user.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {user.dateOfBirth}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Address
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{user.address}</p>
              </div>

              {/* Medical History */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Medical History
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {user.medicalHistory}
                </p>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Emergency Contact
                  </h3>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {user.emergencyContact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isTherapist && (
            <div className="space-y-6">
              {/* Professional Information */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Professional Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">License Number</p>
                      <p className="font-medium text-gray-900">
                        {user.licenseNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium text-gray-900">
                        {user.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">
                        {user.experience}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability & Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Availability
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {user.availability}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rating
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(parseFloat(user.rating) || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {user.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-t border-purple-200 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Close
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 text-white shadow-lg">
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

const UserTable: React.FC<UserTableProps> = ({
  selectedRole,
  filteredUsers,
  setEditUser,
  setEditModalOpen,
  setDeleteUser,
  setDeleteModalOpen,
  setEmergencyContactDetails: _setEmergencyContactDetails,
  setEmergencyContactOpen: _setEmergencyContactOpen,
  recordsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div className="relative bg-gradient-to-br from-white via-slate-50/30 to-white rounded-3xl shadow-xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8159A8]/20 via-blue-500/10 to-emerald-500/20 opacity-50">
          <div className="absolute inset-[1px] rounded-3xl bg-white/95 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-[#8159A8]/15 via-blue-500/8 to-teal-500/10 border-b-2 border-[#8159A8]/20">
              <tr>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  User
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Role
                </th>
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Joined Date
                </th>
                {/* Dynamic headers based on selected role */}
                {selectedRole === "Patient" && (
                  <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                    Contact
                  </th>
                )}
                {selectedRole === "Therapist" && (
                  <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                    Rating
                  </th>
                )}
                {selectedRole === "Guardian" && (
                  <>
                    <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                      Patient
                    </th>
                    <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                      Relationship
                    </th>
                  </>
                )}
                {selectedRole === "Manager" && (
                  <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                    Email
                  </th>
                )}
                <th className="text-left py-6 px-8 font-bold text-[#8159A8] tracking-wide uppercase text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-200/60 transition-all duration-300 transform hover:scale-[1.005] active:scale-[0.995] group ${
                    idx % 2 === 0 
                      ? "bg-white/60 backdrop-blur-sm" 
                      : "bg-gradient-to-r from-slate-50/40 to-white/80 backdrop-blur-sm"
                  } hover:bg-gradient-to-r hover:from-[#8159A8]/8 hover:to-blue-500/5 hover:shadow-lg hover:border-[#8159A8]/30`}
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${user.avatarColor} flex items-center justify-center text-white font-semibold text-lg shadow-lg border-2 border-white/80 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                      >
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base transition-colors duration-300 group-hover:text-[#8159A8]">
                          {user.name}
                        </div>
                        {user.email && (
                          <div className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <span
                      className={`inline-flex px-4 py-2 text-xs font-semibold rounded-full shadow-md transition-all duration-300 group-hover:shadow-lg ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-6 px-8 text-sm text-gray-700 font-medium transition-colors duration-300 group-hover:text-gray-900">
                    {user.joinedDate}
                  </td>

                  {/* Role-specific data cells with proper alignment */}
                  {user.role === "Patient" && selectedRole === "Patient" && (
                    <td className="py-6 px-8 text-sm text-gray-700 transition-colors duration-300 group-hover:text-gray-900">
                      <div className="font-medium">{user.phone}</div>
                    </td>
                  )}

                  {user.role === "Therapist" && selectedRole === "Therapist" && (
                    <td className="py-6 px-8 text-sm text-gray-700">
                      <div className="flex items-center space-x-2 transition-all duration-300 group-hover:scale-105">
                        <div className="p-2 bg-yellow-100 rounded-xl shadow-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-[#8159A8] transition-colors duration-300">
                          {user.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({user.experience})
                        </span>
                      </div>
                    </td>
                  )}

                  {user.role === "Guardian" && selectedRole === "Guardian" && (
                    <>
                      <td className="py-6 px-8 text-sm text-gray-700 font-medium transition-colors duration-300 group-hover:text-gray-900">
                        {user.patient}
                      </td>
                      <td className="py-6 px-8 text-sm text-gray-700 transition-colors duration-300 group-hover:text-gray-900">
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold shadow-sm">
                          {user.relationship}
                        </span>
                      </td>
                    </>
                  )}

                  {user.role === "Manager" && selectedRole === "Manager" && (
                    <td className="py-6 px-8 text-sm text-gray-700 font-medium transition-colors duration-300 group-hover:text-gray-900">
                      {user.email}
                    </td>
                  )}

                  <td className="py-6 px-8">
                    <div className="flex items-center gap-3">
                      {/* View Details button for Patient and Therapist */}
                      {(user.role === "Patient" || user.role === "Therapist") && (
                        <Button
                          size="sm"
                          className="text-xs bg-primary text-white hover:from-[#6b4890] hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-xl px-4 py-2"
                          onClick={() => handleViewDetails(user)}
                        >
                          View Details
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-2 border-[#8159A8]/60 text-[#8159A8] hover:bg-[#8159A8]/10 hover:border-[#8159A8] hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-xl px-4 py-2 backdrop-blur-sm"
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
                        className="text-xs border-2 border-red-400/60 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-xl px-4 py-2 backdrop-blur-sm"
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

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="relative z-10 px-8 py-6 bg-gradient-to-r from-slate-50/60 via-white/40 to-slate-50/60 backdrop-blur-sm border-t-2 border-gray-200/60 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700 font-medium">
              <div className="p-2 bg-gradient-to-br from-[#8159A8]/10 to-blue-500/10 rounded-xl shadow-sm mr-3">
                <Users className="h-4 w-4 text-[#8159A8]" />
              </div>
              <span>
                Showing <span className="font-bold text-[#8159A8]">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-[#8159A8]">{Math.min(endIndex, totalRecords)}</span> of{" "}
                <span className="font-bold text-[#8159A8]">{totalRecords}</span> entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                    pageNum === currentPage
                      ? "bg-gradient-to-r from-[#8159A8] to-blue-600 text-white hover:from-[#6b4890] hover:to-blue-700 border-2 border-[#8159A8] shadow-md"
                      : "text-gray-700 hover:bg-[#8159A8] hover:text-white border-2 border-gray-300/60 hover:border-[#8159A8] backdrop-blur-sm"
                  }`}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-300/60 hover:bg-[#8159A8] hover:text-white hover:border-[#8159A8] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

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

      {/* Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </>
  );
};

export default UserTable;
