"use client";

import { Search, Filter, X } from "lucide-react";
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

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-white via-slate-50/30 to-white rounded-3xl shadow-xl border border-gray-200/50 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* Decorative gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8159A8]/20 via-blue-500/10 to-emerald-500/20 opacity-50">
        <div className="absolute inset-[1px] rounded-3xl bg-white/95 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Search Section */}
        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl shadow-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Search Sessions</h3>
              <p className="text-sm text-gray-600">Find sessions by patient, therapist, or type</p>
            </div>
          </div>
          
          <div className="relative group">
            <div
              className={`relative flex items-center transition-all duration-300 transform ${
                isSearchFocused
                  ? "ring-4 ring-[#8159A8]/20 ring-offset-2 ring-offset-white scale-[1.01]"
                  : "hover:ring-2 hover:ring-[#8159A8]/15 hover:ring-offset-1 hover:ring-offset-white"
              }`}
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#8159A8]/8 via-blue-500/5 to-teal-500/8 rounded-2xl" />
              
              {/* Search icon */}
              <Search
                className={`absolute left-5 h-5 w-5 transition-colors duration-300 ${
                  isSearchFocused ? "text-[#8159A8]" : "text-gray-500 group-hover:text-gray-700"
                }`}
              />
              
              {/* Input field */}
              <input
                type="text"
                placeholder="Search by patient, therapist, or session type..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="relative w-full pl-14 pr-14 py-5 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-[#8159A8]/60 focus:bg-white text-base font-medium placeholder-gray-500 transition-all duration-300 shadow-sm focus:shadow-md"
              />
              
              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-5 p-2 hover:bg-red-50 rounded-xl transition-all duration-200 group/clear"
                >
                  <X className="h-4 w-4 text-gray-500 group-hover/clear:text-red-500 transition-colors duration-200" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-[#8159A8] to-blue-600 rounded-xl shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filter Sessions</h3>
              <p className="text-sm text-gray-600">Narrow down results by status and session type</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">
                Status
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8159A8]/8 via-blue-500/5 to-teal-500/8 rounded-2xl" />
                <select
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-[#8159A8]/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-[#8159A8]/30 appearance-none cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  {/*<option value="In Progress">In Progress</option>*/}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">
                Session Type
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8159A8]/8 via-blue-500/5 to-teal-500/8 rounded-2xl" />
                <select
                  value={selectedType}
                  onChange={(e) => onTypeChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-[#8159A8]/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-[#8159A8]/30 appearance-none cursor-pointer"
                >
                  <option value="All Types">All Types</option>
                  <option value="Individual">Individual</option>
                  <option value="With Guardian">With Guardian</option>

                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || selectedStatus !== "All Status" || selectedType !== "All Types") && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200/60">
              <span className="text-sm font-semibold text-gray-700">Active filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold shadow-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={clearSearch}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {selectedStatus !== "All Status" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold shadow-sm">
                  Status: {selectedStatus}
                  <button
                    onClick={() => onStatusChange("All Status")}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {selectedType !== "All Types" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold shadow-sm">
                  Type: {selectedType}
                  <button
                    onClick={() => onTypeChange("All Types")}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}