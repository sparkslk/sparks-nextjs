"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface TherapistFiltersProps {
  selectedSpecialty: string;
  setSelectedSpecialty: (value: string) => void;
  selectedTimeAvailability: string;
  setSelectedTimeAvailability: (value: string) => void;
  selectedCost: string;
  setSelectedCost: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  onClearAllFilters: () => void;
}

export function TherapistFilters({
  selectedSpecialty,
  setSelectedSpecialty,
  selectedTimeAvailability,
  setSelectedTimeAvailability,
  selectedCost,
  setSelectedCost,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  onClearAllFilters
}: TherapistFiltersProps) {
  return (
    <>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs bg-[#8159A8] text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="w-full flex flex-wrap gap-3">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="anxiety">Anxiety & Depression</SelectItem>
                <SelectItem value="family">Family Therapy</SelectItem>
                <SelectItem value="adhd">ADHD & Behavioral Issues</SelectItem>
                <SelectItem value="trauma">Trauma & PTSD</SelectItem>
                <SelectItem value="child">Child Psychology</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeAvailability} onValueChange={setSelectedTimeAvailability}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="nextWeek">Next Week</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCost} onValueChange={setSelectedCost}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Cost</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {selectedSpecialty !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              {selectedSpecialty}
              <button onClick={() => setSelectedSpecialty("all")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedTimeAvailability !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              {selectedTimeAvailability}
              <button onClick={() => setSelectedTimeAvailability("all")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedCost !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              {selectedCost}
              <button onClick={() => setSelectedCost("all")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </>
  );
}