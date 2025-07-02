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
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or ID..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <option>All Roles</option>
        <option>Therapist</option>
        <option>Patient</option>
        <option>Guardian</option>
        <option>Manager</option>
      </select>

      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option>All Status</option>
        <option>Active</option>
        <option>Pending</option>
        <option>Suspended</option>
      </select>

      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        value={selectedTime}
        onChange={(e) => onTimeChange(e.target.value)}
      >
        <option>All Time</option>
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 3 months</option>
      </select>

      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        value={selectedVerification}
        onChange={(e) => onVerificationChange(e.target.value)}
      >
        <option>All</option>
        <option>Verified</option>
        <option>Unverified</option>
      </select>
    </div>
  );
}