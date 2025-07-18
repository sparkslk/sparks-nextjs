"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import UserFilters from "@/components/admin/admin-user-filters";

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [selectedVerification, setSelectedVerification] = useState("All");

  const [users] = useState([
    {
      id: 1,
      name: "Dr. Nimal Perera",
      email: "nimal.perera@email.com",
      role: "Therapist",
      status: "Active",
      joinedDate: "2024-04-15",
      lastActive: "2 hours ago",
      sessions: 127,
      avatar: "NP",
      avatarColor: "bg-[#8159A8]",
      verified: true
    },
    {
      id: 2,
      name: "Amara Gunawardena",
      email: "amara.g@email.com",
      role: "Guardian",
      status: "Pending",
      joinedDate: "2024-06-10",
      lastActive: "1 day ago",
      sessions: "N/A",
      avatar: "AG",
      avatarColor: "bg-[#8159A8]",
      verified: false
    },
    {
      id: 3,
      name: "Sahan Perera",
      email: "sahan.p@email.com",
      role: "Patient",
      status: "Active",
      joinedDate: "2024-03-22",
      lastActive: "5 hours ago",
      sessions: 45,
      avatar: "SP",
      avatarColor: "bg-[#8159A8]",
      verified: false
    },
    {
      id: 4,
      name: "Dr. Kamala Silva",
      email: "kamala.silva@email.com",
      role: "Therapist",
      status: "Active",
      joinedDate: "2024-02-10",
      lastActive: "30 mins ago",
      sessions: 89,
      avatar: "KS",
      avatarColor: "bg-[#8159A8]",
      verified: true
    },
    {
      id: 5,
      name: "Thilaka Bandara",
      email: "thilaka.b@email.com",
      role: "Guardian",
      status: "Active",
      joinedDate: "2024-01-18",
      lastActive: "3 hours ago",
      sessions: "N/A",
      avatar: "TB",
      avatarColor: "bg-[#8159A8]",
      verified: true
    },
    {
      id: 6,
      name: "Ruwan Wijesinghe",
      email: "ruwan.w@email.com",
      role: "Manager",
      status: "Active",
      joinedDate: "2023-12-05",
      lastActive: "1 hour ago",
      sessions: "N/A",
      avatar: "RW",
      avatarColor: "bg-[#8159A8]",
      verified: true
    },
    {
      id: 7,
      name: "Dr. Sunil Jayasinghe",
      email: "sunil.j@email.com",
      role: "Therapist",
      status: "Suspended",
      joinedDate: "2024-05-20",
      lastActive: "1 week ago",
      sessions: 12,
      avatar: "SJ",
      avatarColor: "bg-[#8159A8]",
      verified: false
    }
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);

    const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "All Status" || user.status === selectedStatus;
    const matchesDate = selectedTime === "All Time" || true; // Placeholder
    const matchesVerification =
      selectedVerification === "All" ||
      (selectedVerification === "Verified" && user.verified) ||
      (selectedVerification === "Unverified" && !user.verified);

    return matchesSearch && matchesRole && matchesStatus && matchesDate && matchesVerification;
  });

  const stats = {
    totalUsers: users.length,
    patients: users.filter((u) => u.role === "Patient").length,
    therapists: users.filter((u) => u.role === "Therapist").length,
    guardians: users.filter((u) => u.role === "Guardian").length,
    managers: users.filter((u) => u.role === "Manager").length,
    pending: users.filter((u) => u.status === "Pending").length
  };

  const getRoleColor = (role: string) => {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button className="flex items-center gap-2" style={{ backgroundColor: "#8159A8" }}>
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Filters */}
        <UserFilters
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
          selectedTime={selectedTime}
          selectedVerification={selectedVerification}
          onSearchChange={setSearchTerm}
          onRoleChange={setSelectedRole}
          onStatusChange={setSelectedStatus}
          onTimeChange={setSelectedTime}
          onVerificationChange={setSelectedVerification}
        />

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold" style={{ color: "#8159A8" }}>
              {stats.totalUsers}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-[#8159A8]">{stats.patients}</div>
            <div className="text-sm text-gray-600">Patients</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-[#8159A8]">{stats.therapists}</div>
            <div className="text-sm text-gray-600">Therapists</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-[#8159A8]">{stats.guardians}</div>
            <div className="text-sm text-gray-600">Guardians</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold" style={{ color: "#8159A8" }}>
              {stats.managers}
            </div>
            <div className="text-sm text-gray-600">Managers</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-[#8159A8]">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Joined Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Sessions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-semibold text-sm`}>
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>{user.status}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{user.joinedDate}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{user.lastActive}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{user.sessions}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs ${
                          user.status === "Suspended"
                            ? "text-green-600 hover:text-green-700"
                            : user.status === "Pending"
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-red-600 hover:text-red-700"
                        }`}
                      >
                        {user.status === "Suspended" ? "Reactivate" : user.status === "Pending" ? "Verify" : "Suspend"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
