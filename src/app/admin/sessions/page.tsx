"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import SessionFilters from "@/components/admin/admin-session-filters";

interface TherapySession {
  id: number;
  patient: string;
  therapist: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  type: string;
}

const MOCK_SESSIONS: TherapySession[] = [
  {
    id: 1,
    patient: "Sahan Perera",
    therapist: "Dr. Nimal Perera",
    date: "2025-07-10",
    time: "10:00 AM",
    status: "Upcoming",
    type: "Speech Therapy"
  },
  {
    id: 2,
    patient: "Amara Gunawardena",
    therapist: "Dr. Kamala Silva",
    date: "2025-07-05",
    time: "2:00 PM",
    status: "Completed",
    type: "Occupational Therapy"
  },
  {
    id: 3,
    patient: "Sahan Perera",
    therapist: "Dr. Sunil Jayasinghe",
    date: "2025-07-12",
    time: "9:00 AM",
    status: "Upcoming",
    type: "Behavioral Therapy"
  },
  {
    id: 4,
    patient: "Thilaka Bandara",
    therapist: "Dr. Nimal Perera",
    date: "2025-06-30",
    time: "11:00 AM",
    status: "Completed",
    type: "Speech Therapy"
  },
  {
    id: 5,
    patient: "Ruwan Wijesinghe",
    therapist: "Dr. Kamala Silva",
    date: "2025-07-15",
    time: "3:00 PM",
    status: "Upcoming",
    type: "Occupational Therapy"
  }
];

export default function SessionsPage() {
  const [sessions] = useState<TherapySession[]>(MOCK_SESSIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedType, setSelectedType] = useState("All Types");

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.therapist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "All Status" || session.status === selectedStatus;
      const matchesType = selectedType === "All Types" || session.type === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchTerm, selectedStatus, selectedType]);

  const stats = {
    total: filteredSessions.length,
    upcoming: filteredSessions.filter(s => s.status === "Upcoming").length,
    completed: filteredSessions.filter(s => s.status === "Completed").length,
    cancelled: filteredSessions.filter(s => s.status === "Cancelled").length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Oversight</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground">10% up this month</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">8% up this month</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.upcoming}
              </div>
              <p className="text-xs text-muted-foreground">5% up this month</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.cancelled}
              </div>
              <p className="text-xs text-muted-foreground">3% down this month</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
        <SessionFilters
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          selectedType={selectedType}
          onSearchChange={setSearchTerm}
          onStatusChange={setSelectedStatus}
          onTypeChange={setSelectedType}
        />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-[#f5f3fb] to-[#e9e4f5] border-b-2 border-[#8159A8]">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">Patient</th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">Therapist</th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">Type</th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">Date</th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">Time</th>
                <th className="text-left py-4 px-6 font-bold text-[#8159A8] tracking-wide uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session, idx) => (
                <tr
                  key={session.id}
                  className={`border-b transition-colors duration-200 ${
                    idx % 2 === 0 ? "bg-[#f9f7fc]" : "bg-white"
                  } hover:bg-[#f3eaff]`}
                >
                  <td className="py-4 px-6">{session.patient}</td>
                  <td className="py-4 px-6">{session.therapist}</td>
                  <td className="py-4 px-6">{session.type}</td>
                  <td className="py-4 px-6">{session.date}</td>
                  <td className="py-4 px-6">{session.time}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      session.status === "Upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : session.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {session.status}
                    </span>
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
