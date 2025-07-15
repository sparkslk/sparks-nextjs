import { Search } from "lucide-react";

interface SessionFiltersProps {
  searchTerm: string;
  selectedStatus: string;
  selectedType: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export default function SessionFilters({
  searchTerm,
  selectedStatus,
  selectedType,
  onSearchChange,
  onStatusChange,
  onTypeChange
}: SessionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search sessions by patient, therapist, or type..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="All Status">All Status</option>
        <option value="Upcoming">Upcoming</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="All Types">All Types</option>
        <option value="Speech Therapy">Speech Therapy</option>
        <option value="Occupational Therapy">Occupational Therapy</option>
        <option value="Behavioral Therapy">Behavioral Therapy</option>
      </select>
    </div>
  );
}
