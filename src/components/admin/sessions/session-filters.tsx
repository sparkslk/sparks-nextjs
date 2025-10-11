"use client";

import { Search, Filter, X, Calendar, Clock } from "lucide-react";
import { useState } from "react";

interface SessionFiltersProps {
  searchTerm: string;
  selectedStatus: string;
  selectedType: string;
  startDate: string;
  endDate: string;
  selectedDuration: string;
  selectedTimeOfDay: string;
  selectedTherapist: string;
  therapists: Array<{ id: string; name: string }>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onTimeOfDayChange: (value: string) => void;
  onTherapistChange: (value: string) => void;
  onClearAllFilters: () => void;
  className?: string;
}

export default function SessionFilters({
  searchTerm,
  selectedStatus,
  selectedType,
  startDate,
  endDate,
  selectedDuration,
  selectedTimeOfDay,
  selectedTherapist,
  therapists,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
  onDurationChange,
  onTimeOfDayChange,
  onTherapistChange,
  onClearAllFilters,
  className = ""
}: SessionFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const clearSearch = () => {
    onSearchChange("");
  };

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      selectedStatus !== "All Status" ||
      selectedType !== "All Types" ||
      startDate ||
      endDate ||
      selectedDuration !== "All Durations" ||
      selectedTimeOfDay !== "All Times" ||
      selectedTherapist !== "All Therapists"
    );
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
        </div>

        {/* Advanced Filters Section */}
        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
              <p className="text-sm text-gray-600">Refine by date range, duration, and time</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Start Date Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/5 to-blue-500/8 rounded-2xl" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-emerald-500/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-emerald-500/30 cursor-pointer"
                />
              </div>
            </div>

            {/* End Date Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/5 to-blue-500/8 rounded-2xl" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-emerald-500/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-emerald-500/30 cursor-pointer"
                />
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/5 to-blue-500/8 rounded-2xl" />
                <select
                  value={selectedDuration}
                  onChange={(e) => onDurationChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-emerald-500/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-emerald-500/30 appearance-none cursor-pointer"
                >
                  <option value="All Durations">All Durations</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2+ hours</option>
                </select>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time of Day Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Day
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/5 to-blue-500/8 rounded-2xl" />
                <select
                  value={selectedTimeOfDay}
                  onChange={(e) => onTimeOfDayChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-emerald-500/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-emerald-500/30 appearance-none cursor-pointer"
                >
                  <option value="All Times">All Times</option>
                  <option value="Morning">Morning (6am-12pm)</option>
                  <option value="Afternoon">Afternoon (12pm-6pm)</option>
                  <option value="Evening">Evening (6pm-12am)</option>
                </select>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Therapist Filter */}
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-semibold text-gray-700 block">
                Therapist
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/5 to-blue-500/8 rounded-2xl" />
                <select
                  value={selectedTherapist}
                  onChange={(e) => onTherapistChange(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:border-emerald-500/60 focus:bg-white text-base font-medium text-gray-700 transition-all duration-300 shadow-sm focus:shadow-md hover:border-emerald-500/30 appearance-none cursor-pointer"
                >
                  <option value="All Therapists">All Therapists</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200/60">
              <span className="text-sm font-semibold text-gray-700">Active filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold shadow-sm">
                  Search: &quot;{searchTerm}&quot;
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

              {startDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold shadow-sm">
                  From: {new Date(startDate).toLocaleDateString()}
                  <button
                    onClick={() => onStartDateChange("")}
                    className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {endDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold shadow-sm">
                  To: {new Date(endDate).toLocaleDateString()}
                  <button
                    onClick={() => onEndDateChange("")}
                    className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedDuration !== "All Durations" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold shadow-sm">
                  Duration: {selectedDuration === "120" ? "2+ hours" : `${selectedDuration} min`}
                  <button
                    onClick={() => onDurationChange("All Durations")}
                    className="ml-1 hover:bg-teal-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedTimeOfDay !== "All Times" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold shadow-sm">
                  Time: {selectedTimeOfDay}
                  <button
                    onClick={() => onTimeOfDayChange("All Times")}
                    className="ml-1 hover:bg-amber-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedTherapist !== "All Therapists" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  Therapist: {therapists.find(t => t.id === selectedTherapist)?.name || selectedTherapist}
                  <button
                    onClick={() => onTherapistChange("All Therapists")}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Clear All Filters Button */}
              <button
                onClick={onClearAllFilters}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold shadow-sm hover:bg-red-200 transition-colors duration-200"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}