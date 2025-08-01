"use client";

import React from "react";
import { useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import UserFilter from "@/components/admin/users/admin-user-filters";
import UserDetailEdit from "@/components/admin/users/user-detail-edit";
import AddUser from "@/components/admin/users/add-user";
//import UserStatsCards from "@/components/admin/users/users-stats-cards";
import EmergencyContactDialog from "@/components/admin/users/EmergencyContactDialog";
import UserTable from "@/components/admin/users/userTable";
import UserDelete from "@/components/admin/users/user-delete";

export default function UsersPage() {
  // State for emergency contact modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("Patient"); // Default to Patient
  const [emergencyContactOpen, setEmergencyContactOpen] = React.useState(false);
  const [emergencyContactDetails, setEmergencyContactDetails] =
    React.useState<string | null>(null);
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

  // Filtering logic for role and search
  const filteredUsers = mappedUsers.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      (user.name &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.id && user.id.toString().includes(searchTerm));

    const matchesRole = user.role === selectedRole;
    // You can add more filter logic for status, time, verification if needed
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: mappedUsers.length,
    patients: mappedUsers.filter((u) => u.role === "Patient").length,
    therapists: mappedUsers.filter((u) => u.role === "Therapist").length,
    guardians: mappedUsers.filter((u) => u.role === "Guardian").length,
    managers: mappedUsers.filter((u) => u.role === "Manager").length,
  };

  /*const getRoleColor = (role: string) => {
    switch (role) {
      case "Therapist":
        return "bg-blue-100 text-blue-800";
      case "Guardian":
        return "bg-yellow-100 text-yellow-800";
      case "Patient":
        return "bg-green-100 text-green-800";
      case "Manager":
        return "bg-[#F5F3FB] text-[#8159A8]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };*/

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

  // Dynamic table headers and rows based on user type
  return (
    <div className="max-w-7xl mx-auto">
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
                name: String(newUser.fullName || newUser.fullname || newUser.name || ""),
                email: String(newUser.email || ""),
                phone: newUser.phone as string | undefined,
                role: String(newUser.role || ""),
                createdAt: new Date().toISOString().split("T")[0],
                therapistProfile: newUser.therapistProfile,
                patientProfile: newUser.patientProfile,
                managerProfile: newUser.managerProfile,
              };
              setUsers((prev) => [
                newUserRecord,
                ...prev,
              ]);
            }}
          />
        </div>

        {/* Stats Cards 
        <UserStatsCards stats={stats} />*/}

        {/* Filters */}
        <UserFilter
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          onSearchChange={setSearchTerm}
          onRoleChange={setSelectedRole}
          stats={stats}
          className="mb-6"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <UserTable
            selectedRole={selectedRole}
            filteredUsers={filteredUsers}
            setEditUser={(user) => setEditUser(user)}
            setEditModalOpen={setEditModalOpen}
            setDeleteUser={(user) => setDeleteUser(user)}
            setDeleteModalOpen={setDeleteModalOpen}
            setEmergencyContactDetails={setEmergencyContactDetails}
            setEmergencyContactOpen={setEmergencyContactOpen}
          />

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
          {/* Delete User Modal */}
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
        </div>
      </div>
    </div>
  );
}
