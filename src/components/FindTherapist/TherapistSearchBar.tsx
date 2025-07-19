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
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
      <Input
        placeholder="Search by name or specialty..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-12 py-3 text-base border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary shadow bg-white placeholder:text-muted-foreground"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}