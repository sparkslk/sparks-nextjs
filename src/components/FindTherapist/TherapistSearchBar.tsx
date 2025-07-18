"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TherapistSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TherapistSearchBar({ searchQuery, onSearchChange }: TherapistSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        placeholder="Search by name or specialty..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] shadow-sm bg-white"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}