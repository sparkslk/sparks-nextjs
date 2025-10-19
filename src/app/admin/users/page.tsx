"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, User, Phone, Mail, Calendar, MapPin, Heart, Star, Award, Clock, FileText, Shield, Users, Edit, Eye, X } from "lucide-react";
//import UserFilter from "@/components/admin/users/admin-user-filters";
import UserDetailEdit from "@/components/admin/users/user-detail-edit";
import AddUser from "@/components/admin/users/add-user";
//import UserStatsCards from "@/components/admin/users/users-stats-cards";
import EmergencyContactDialog from "@/components/admin/users/EmergencyContactDialog";
import UserDelete from "@/components/admin/users/user-delete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UsersPage() {
  // State for emergency contact modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("Patient"); // Default to Patient
  const [emergencyContactOpen, setEmergencyContactOpen] = React.useState(false);
  const [emergencyContactDetails] = React.useState<
    string | null
  >(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null);

  // Define User type compatible with UserTable component
  interface User {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    createdAt?: string;
    therapistProfile?: unknown;
    patientProfile?: unknown;
    managerProfile?: unknown;
    [key: string]: unknown;
  }

  // State to hold users fetched from the API
  const [users, setUsers] = useState<User[]>([]);

  // State for add user modal
  const [addUserOpen, setAddUserOpen] = useState(false);

  // State for card layout
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "patient" | "therapist" | "guardian" | "manager"
  >("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        if (data && data.data) {
          setUsers(data.data);
        } else {
          setUsers([]);
        }
        // Only set lastUpdated on the client to avoid hydration mismatch
        setTimeout(() => setLastUpdated(new Date()), 0);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Map API data to table display format, handling different user types
  // Ensure that any object fields are stringified for safe rendering
  const safeString = (val: unknown) => {
    if (val == null || val === "" || val === undefined) return "N/A";
    if (typeof val === "object") {
      // If it's an array, join; if object, JSON.stringify but remove braces for readability
      if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "N/A";
      try {
        // Try to flatten simple objects for display
        const values = Object.values(val);
        if (values.length === 0) return "N/A";
        if (values.every((v) => v != null && typeof v !== "object")) {
          return values
            .map((v) => (v == null || v === "" ? "N/A" : v))
            .join(", ");
        }
        return JSON.stringify(val);
      } catch {
        return JSON.stringify(val);
      }
    }
    return String(val) === "" ? "N/A" : String(val);
  };

  const mappedUsers = users.map((user) => {
    const userWithExtendedProps = user as typeof user & {
      fullName?: string;
      fullname?: string;
      dateOfBirth?: string;
      gender?: string;
      address?: string;
      emergencyContact?: string;
      medicalHistory?: string;
      status?: string;
      licenseNumber?: string;
      specialization?: string;
      experience?: string;
      availability?: string;
      rating?: string;
      relationship?: string;
      patient?: string;
    };
    if (user.role === "Patient") {
      // Format dateOfBirth to only show date part if possible
      let dob = userWithExtendedProps.dateOfBirth;
      if (dob) {
        try {
          const d = new Date(dob);
          if (!isNaN(d.getTime())) {
            dob = d.toISOString().split("T")[0];
          } else {
            dob = safeString(dob);
          }
        } catch {
          dob = safeString(dob);
        }
      } else {
        dob = "N/A";
      }
      return {
        id: user.id,
        role: user.role,
        name: userWithExtendedProps.fullName || user.name,
        email: user.email,
        gender: safeString(userWithExtendedProps.gender),
        phone: safeString(user.phone),
        dateOfBirth: dob,
        address: safeString(userWithExtendedProps.address),
        emergencyContact: safeString(userWithExtendedProps.emergencyContact),
        medicalHistory: safeString(userWithExtendedProps.medicalHistory),
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : "",
        avatar: userWithExtendedProps.fullName
          ? userWithExtendedProps.fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
          : "",
        avatarColor: "bg-[#8159A8]",
        status: safeString(userWithExtendedProps.status || ""),
      };
    } else if (user.role === "Therapist") {
      return {
        id: user.id,
        role: user.role,
        name: userWithExtendedProps.fullname,
        email: user.email,
        licenseNumber: safeString(userWithExtendedProps.licenseNumber),
        specialization: safeString(userWithExtendedProps.specialization),
        experience: safeString(userWithExtendedProps.experience),
        availability: safeString(userWithExtendedProps.availability),
        rating: safeString(userWithExtendedProps.rating),
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : "",
        avatar: userWithExtendedProps.fullname
          ? userWithExtendedProps.fullname
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
          : "",
        avatarColor: "bg-[#8159A8]",
        status: safeString(userWithExtendedProps.status || ""),
      };
    } else if (user.role === "Guardian") {
      return {
        id: user.id,
        role: user.role,
        name: userWithExtendedProps.fullName || user.name,
        email: user.email,
        patient: safeString(userWithExtendedProps.patient),
        relationship: safeString(userWithExtendedProps.relationship),
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : "",
        avatar: userWithExtendedProps.fullName
          ? userWithExtendedProps.fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
          : "",
        avatarColor: "bg-[#8159A8]",
        status: safeString(userWithExtendedProps.status || ""),
      };
    } else if (user.role === "Manager") {
      return {
        id: user.id,
        role: user.role,
        name: userWithExtendedProps.fullName || user.name,
        email: user.email,
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : "",
        avatar:
          userWithExtendedProps.fullName || user.name
            ? (userWithExtendedProps.fullName || user.name || "")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
            : "",
        avatarColor: "bg-[#8159A8]",
        status: safeString(userWithExtendedProps.status || ""),
      };
    }
    // fallback
    return {
      id: user.id,
      role: user.role,
      name: userWithExtendedProps.fullName || user.name,
      email: user.email,
      joinedDate: user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : "",
      avatar:
        userWithExtendedProps.fullName || user.name
          ? (userWithExtendedProps.fullName || user.name || "")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
          : "",
      avatarColor: "bg-[#8159A8]",
      status: safeString(userWithExtendedProps.status || ""),
    };
  });

  const stats = {
    totalUsers: mappedUsers.length,
    patients: mappedUsers.filter((u) => u.role === "Patient").length,
    therapists: mappedUsers.filter((u) => u.role === "Therapist").length,
    guardians: mappedUsers.filter((u) => u.role === "Guardian").length,
    managers: mappedUsers.filter((u) => u.role === "Manager").length,
  };

  // Card rendering functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Patient":
        return "bg-pink-100 text-pink-700";
      case "Therapist":
        return "bg-blue-100 text-blue-700";
      case "Guardian":
        return "bg-green-100 text-green-700";
      case "Manager":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderPatientCards = (rows: typeof mappedUsers) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No patients found</div>
      ) : (
        rows.map((user) => (
          <div
            key={user.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with User Info and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {user.avatar}
                </div>

                {/* User Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">Patient ID: {user.id}</p>
                </div>
              </div>

              {/* Role Badge */}
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(
                  user.role || ""
                )}`}
              >
                {user.role}
              </span>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* Gender */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <User className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.gender}
                  </p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.dateOfBirth}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Phone className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.phone}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Mail className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Address and Joined Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Address:</span>{" "}
                <span className="text-gray-700">{user.address}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Joined:</span>{" "}
                <span className="text-gray-700">{user.joinedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setIsDetailsModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditUser(user);
                  setEditModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteUser(user);
                  setDeleteModalOpen(true);
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Shield className="w-4 h-4" />
                Deactivate
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTherapistCards = (rows: typeof mappedUsers) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No therapists found
        </div>
      ) : (
        rows.map((user) => (
          <div
            key={user.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with User Info and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {user.avatar}
                </div>

                {/* User Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Therapist ID: {user.id}
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(
                  user.role || ""
                )}`}
              >
                {user.role}
              </span>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* License Number */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Award className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Number</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Specialization */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Heart className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Specialization</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.specialization}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Clock className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.experience}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Star className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.rating}
                  </p>
                </div>
              </div>
            </div>

            {/* Email and Joined Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Email:</span>{" "}
                <span className="text-gray-700">{user.email}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Joined:</span>{" "}
                <span className="text-gray-700">{user.joinedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setIsDetailsModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditUser(user);
                  setEditModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteUser(user);
                  setDeleteModalOpen(true);
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Shield className="w-4 h-4" />
                Deactivate
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderGuardianCards = (rows: typeof mappedUsers) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No guardians found
        </div>
      ) : (
        rows.map((user) => (
          <div
            key={user.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with User Info and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {user.avatar}
                </div>

                {/* User Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Guardian ID: {user.id}
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(
                  user.role || ""
                )}`}
              >
                {user.role}
              </span>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Patient */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Users className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Patient</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.patient}
                  </p>
                </div>
              </div>

              {/* Relationship */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Heart className="w-6 h-6 text-[#6B46A0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Relationship</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.relationship}
                  </p>
                </div>
              </div>
            </div>

            {/* Email and Joined Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Email:</span>{" "}
                <span className="text-gray-700">{user.email}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Joined:</span>{" "}
                <span className="text-gray-700">{user.joinedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditUser(user);
                  setEditModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteUser(user);
                  setDeleteModalOpen(true);
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Shield className="w-4 h-4" />
                Deactivate
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderManagerCards = (rows: typeof mappedUsers) => (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No managers found</div>
      ) : (
        rows.map((user) => (
          <div
            key={user.id}
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with User Info and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    background:
                      "linear-gradient(to right bottom, rgb(129, 89, 168), rgb(107, 70, 160))",
                  }}
                >
                  {user.avatar}
                </div>

                {/* User Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">Manager ID: {user.id}</p>
                </div>
              </div>

              {/* Role Badge */}
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(
                  user.role || ""
                )}`}
              >
                {user.role}
              </span>
            </div>

            {/* Email and Joined Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Email:</span>{" "}
                <span className="text-gray-700">{user.email}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Joined:</span>{" "}
                <span className="text-gray-700">{user.joinedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditUser(user);
                  setEditModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteUser(user);
                  setDeleteModalOpen(true);
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Shield className="w-4 h-4" />
                Deactivate
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Filter users by tab
  const filterUsersByTab = (tab: string) => {
    let filteredUsers;
    switch (tab) {
      case "patient":
        filteredUsers = mappedUsers.filter((user) => user.role === "Patient");
        break;
      case "therapist":
        filteredUsers = mappedUsers.filter((user) => user.role === "Therapist");
        break;
      case "guardian":
        filteredUsers = mappedUsers.filter((user) => user.role === "Guardian");
        break;
      case "manager":
        filteredUsers = mappedUsers.filter((user) => user.role === "Manager");
        break;
      case "all":
        filteredUsers = mappedUsers;
        break;
      default:
        filteredUsers = mappedUsers;
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          (user.name?.toLowerCase() || "").includes(lowerSearch) ||
          (user.email?.toLowerCase() || "").includes(lowerSearch) ||
          String(user.id ?? "")
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    return filteredUsers;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Unable to load dashboard
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
              User Management
            </h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            className="flex items-center gap-2"
            style={{ backgroundColor: "#8159A8" }}
            onClick={() => setAddUserOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
          {/* Add User Modal */}
          <AddUser
            open={addUserOpen}
            onOpenChange={setAddUserOpen}
            onAdd={(newUser) => {
              // Add new user to state (optimistic add)
              const newUserRecord: User = {
                id: String(Date.now()),
                name: String(
                  newUser.fullName || newUser.fullname || newUser.name || ""
                ),
                email: String(newUser.email || ""),
                phone: newUser.phone as string | undefined,
                role: String(newUser.role || ""),
                createdAt: new Date().toISOString().split("T")[0],
                therapistProfile: newUser.therapistProfile,
                patientProfile: newUser.patientProfile,
                managerProfile: newUser.managerProfile,
              };
              setUsers((prev) => [newUserRecord, ...prev]);
            }}
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-8 w-8" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <User className="h-8 w-8" style={{ color: "#ec4899" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {stats.patients}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Therapists</CardTitle>
              <Heart className="h-8 w-8" style={{ color: "#3b82f6" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.therapists}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guardians</CardTitle>
              <Shield className="h-8 w-8" style={{ color: "#10b981" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.guardians}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v: string) =>
          setActiveTab(
            v as "all" | "patient" | "therapist" | "guardian" | "manager"
          )
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="all">All ({stats.totalUsers})</TabsTrigger>
          <TabsTrigger value="patient">Patients ({stats.patients})</TabsTrigger>
          <TabsTrigger value="therapist">
            Therapists ({stats.therapists})
          </TabsTrigger>
          <TabsTrigger value="guardian">
            Guardians ({stats.guardians})
          </TabsTrigger>
          <TabsTrigger value="manager">Managers ({stats.managers})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Filters
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filterUsersByTab(activeTab).length} of {mappedUsers.length}{" "}
            users
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Therapist">Therapist</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Card Layout */}
      <div className="mt-4">
        {activeTab === "patient" &&
          renderPatientCards(filterUsersByTab("patient"))}
        {activeTab === "therapist" &&
          renderTherapistCards(filterUsersByTab("therapist"))}
        {activeTab === "guardian" &&
          renderGuardianCards(filterUsersByTab("guardian"))}
        {activeTab === "manager" &&
          renderManagerCards(filterUsersByTab("manager"))}
        {activeTab === "all" && (
          <div className="grid gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Patients</h3>
              {renderPatientCards(filterUsersByTab("patient"))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Therapists</h3>
              {renderTherapistCards(filterUsersByTab("therapist"))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Guardians</h3>
              {renderGuardianCards(filterUsersByTab("guardian"))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Managers</h3>
              {renderManagerCards(filterUsersByTab("manager"))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmergencyContactDialog
        open={emergencyContactOpen}
        onOpenChange={setEmergencyContactOpen}
        emergencyContactDetails={emergencyContactDetails}
      />

      {editUser && (
        <UserDetailEdit
          user={editUser}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={(updatedRawUser) => {
            // Update the raw users array with the updated user data
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === updatedRawUser.id ? updatedRawUser : u
              )
            );
            setEditModalOpen(false);
          }}
        />
      )}

      {deleteUser && (
        <UserDelete
          user={deleteUser}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onDelete={(userId) => {
            // Remove user from state after successful deletion
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
          }}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 text-gray-800 relative">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedUser(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-200/50 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-purple-200/50 backdrop-blur-sm flex items-center justify-center text-purple-700 font-bold text-2xl shadow-lg border-2 border-purple-300/30">
                  {String(selectedUser.avatar || "")}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {String(selectedUser.name || "")}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="bg-purple-200/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-purple-300/30 text-purple-700">
                      {String(selectedUser.role || "")}
                    </span>
                    <span className="text-gray-600 text-sm">
                      Joined {String(selectedUser.joinedDate || "")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto w-70% max-h-[calc(90vh-120px)]">
              {selectedUser.role === "Patient" && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Personal Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <User className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.gender || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.dateOfBirth || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.phone || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Mail className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.email || "")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Address
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {String(selectedUser.address || "")}
                    </p>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Emergency Contact
                      </h3>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      {(() => {
                        try {
                          const emergencyContact = selectedUser.emergencyContact
                            ? typeof selectedUser.emergencyContact === "string"
                              ? JSON.parse(selectedUser.emergencyContact)
                              : selectedUser.emergencyContact
                            : null;

                          if (emergencyContact && emergencyContact.name) {
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                  <User className="h-4 w-4 text-purple-500 mt-1" />
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Name
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {String(emergencyContact.name || "")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <Phone className="h-4 w-4 text-purple-500 mt-1" />
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Phone Number
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {String(emergencyContact.phone || "")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3 md:col-span-2">
                                  <Heart className="h-4 w-4 text-purple-500 mt-1" />
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Relationship
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {String(
                                        emergencyContact.relationship || ""
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <p className="text-gray-700 leading-relaxed">
                                No emergency contact information available
                              </p>
                            );
                          }
                        } catch (error) {
                          return (
                            <p className="text-gray-700 leading-relaxed">
                              {String(
                                selectedUser.emergencyContact ||
                                  "No emergency contact information available"
                              )}
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Medical History
                      </h3>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <p className="text-gray-700 leading-relaxed">
                        {String(
                          selectedUser.medicalHistory ||
                            "No medical history information available"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

                {/* Show error banner if there's an error loading users */}
                {error && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md shadow">
                      <strong className="mr-2">Error:</strong> {error}
                    </div>
                  </div>
                )}

              {selectedUser.role === "Therapist" && (
                <div className="space-y-6">
                  {/* Professional Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Award className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Professional Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">
                            License Number
                          </p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.licenseNumber || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Heart className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Specialization
                          </p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.specialization || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.experience || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Mail className="h-4 w-4 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {String(selectedUser.email || "")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Rating
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i <
                              Math.floor(
                                parseFloat(String(selectedUser.rating || "0"))
                              )
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {String(selectedUser.rating || "")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
