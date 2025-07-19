"use client";

import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  selectedRole: string;
  selectedStatus: string;
  selectedTime: string;
  selectedVerification: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onVerificationChange: (value: string) => void;
}

export default function UserFilters({
  searchTerm,
  selectedRole,
  selectedStatus,
  selectedTime,
  selectedVerification,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onTimeChange,
  onVerificationChange
}: UserFiltersProps) {
  return (

    <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-xl bg-gradient-to-r from-[#f5f3fb] to-[#e9e4f5] shadow-sm border border-[#e5e0f0] items-end">
      <div className="relative grow min-w-[300px] max-w-2xl flex flex-col justify-end">
        <label className="text-xs font-medium text-[#8159A8] mb-1 ml-1 invisible">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8159A8]" />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            className="w-full pl-10 pr-4 py-2 border border-[#d1c4e9] bg-white rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] transition-all duration-200 shadow-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col justify-end min-w-[160px] ml-auto">
        <label className="text-xs font-medium text-[#8159A8] mb-1 ml-1">Role</label>
        <select
          className="px-4 py-2 border border-[#d1c4e9] bg-white rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] transition-all duration-200 shadow-sm text-gray-700"
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          {/*<option>All Roles</option>*/}
          <option>Patient</option>
          <option>Therapist</option>
          <option>Guardian</option>
          <option>Manager</option>
        </select>
      </div>

      {/*
      <div className="flex flex-col">
        <label className="text-xs font-medium text-[#8159A8] mb-1 ml-1">Status</label>
        <select
          className="px-4 py-2 border border-[#d1c4e9] bg-white rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] transition-all duration-200 shadow-sm text-gray-700"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium text-[#8159A8] mb-1 ml-1">Time</label>
        <select
          className="px-4 py-2 border border-[#d1c4e9] bg-white rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] transition-all duration-200 shadow-sm text-gray-700"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
        >
          <option>All Time</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium text-[#8159A8] mb-1 ml-1">Verification</label>
        <select
          className="px-4 py-2 border border-[#d1c4e9] bg-white rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] transition-all duration-200 shadow-sm text-gray-700"
          value={selectedVerification}
          onChange={(e) => onVerificationChange(e.target.value)}
        >
          <option>All</option>
          <option>Verified</option>
          <option>Unverified</option>
        </select>
      </div>
      */}
    </div>
  );
}