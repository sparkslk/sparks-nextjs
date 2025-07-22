"use client";

import React, { useState } from "react";
//import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  X,
  Filter,
  Users,
  Heart,
  UserCheck,
  Shield,
  Briefcase,
} from "lucide-react";

interface UserFilterProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  searchTerm: string;
  onSearchChange: (query: string) => void;
  stats?: {
    totalUsers: number;
    patients: number;
    therapists: number;
    guardians: number;
    managers: number;
  };
  className?: string;
}

const UserFilter: React.FC<UserFilterProps> = ({
  selectedRole,
  onRoleChange,
  searchTerm,
  onSearchChange,
  stats,
  className = "",
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter roles data
  const roles = [
    {
      label: "Patients",
      value: stats?.patients || 0,
      icon: Heart,
      color: "bg-pink-100 text-pink-700",
      key: "Patient",
    },
    {
      label: "Therapists",
      value: stats?.therapists || 0,
      icon: UserCheck,
      color: "bg-blue-100 text-blue-700",
      key: "Therapist",
    },
    {
      label: "Guardians",
      value: stats?.guardians || 0,
      icon: Shield,
      color: "bg-green-100 text-green-700",
      key: "Guardian",
    },
    {
      label: "Managers",
      value: stats?.managers || 0,
      icon: Briefcase,
      color: "bg-orange-100 text-orange-700",
      key: "Manager",
    },
  ];

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
        {/* Role Filter Section */}
        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-[#8159A8] to-blue-600 rounded-xl shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filter by Role</h3>
              <p className="text-sm text-gray-600">Select a user type to filter results</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => {
              const isSelected = selectedRole === role.key;
              const Icon = role.icon;

              return (
                <Card
                  key={role.key}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group ${
                    isSelected
                      ? "shadow-2xl border-2 border-[#8159A8]/60 bg-gradient-to-br from-[#8159A8]/15 to-[#8159A8]/8 ring-4 ring-[#8159A8]/10"
                      : "shadow-lg border border-gray-200/80 bg-white/60 backdrop-blur-sm hover:shadow-xl hover:border-[#8159A8]/30"
                  }`}
                  onClick={() => onRoleChange(role.key)}
                >
                  <CardContent className="flex items-center p-5 space-x-4 relative">
                    <div
                      className={`p-3.5 rounded-2xl ${role.color} shadow-md transition-all duration-300 ${
                        isSelected ? "scale-110 shadow-lg" : "group-hover:scale-105"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold transition-colors duration-200 ${
                          isSelected ? "text-[#8159A8]" : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {role.label}
                      </p>
                      <p
                        className={`text-2xl font-bold transition-colors duration-200 leading-tight ${
                          isSelected ? "text-[#8159A8]" : "text-gray-900"
                        }`}
                      >
                        {role.value.toLocaleString()}
                      </p>
                    </div>

                    {/* Selected state indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-[#8159A8] to-blue-600 rounded-full shadow-lg flex items-center justify-center animate-pulse">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Search Section */}
        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl shadow-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Search Users</h3>
              <p className="text-sm text-gray-600">Find users by name, email, or other details</p>
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
                placeholder="Search by name, email, or role..."
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
      </div>
    </div>
  );
};

export default UserFilter;
