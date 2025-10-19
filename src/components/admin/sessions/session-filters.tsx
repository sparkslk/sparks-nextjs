"use client";

import { X, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SessionFiltersProps {
  searchTerm: string;
  selectedStatus: string;
  selectedType: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  className?: string;
}

export default function SessionFilters({
  searchTerm,
  selectedStatus,
  selectedType,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  className = ""
}: SessionFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className={`relative mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-semibold text-gray-700 ml-1">Filters</span>
        <button
          className="text-gray-600 flex items-center gap-1 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
          {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>
      {showFilters && (
        <div className="border border-gray-200 rounded-2xl bg-white px-6 pb-3 pt-4 flex flex-col gap-4 md:flex-row md:items-end md:gap-8">
          {/* Search */}
          <div className="flex-1 min-w-[180px] max-w-xs">
            <label className="block mb-1 text-xs text-gray-600 font-medium">Search by patient/therapist/type</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`block w-full rounded-lg border border-gray-300 px-4 pr-10 py-2 bg-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all ${isSearchFocused ? 'shadow-md' : ''}`}
              />
              {searchTerm && (
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
          {/* Status */}
          <div className="min-w-[180px] md:min-w-[140px]">
            <label className="block mb-1 text-xs text-gray-600 font-medium">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="All Status">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              {/* You can add more as needed */}
            </select>
          </div>
          {/* Type */}
          <div className="min-w-[180px] md:min-w-[140px]">
            <label className="block mb-1 text-xs text-gray-600 font-medium">Session type</label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="All Types">All Types</option>
              <option value="Individual">Individual</option>
              <option value="With Guardian">With Guardian</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}