"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter(s => s.status === "Upcoming").length,
    completed: sessions.filter(s => s.status === "Completed").length,
    cancelled: sessions.filter(s => s.status === "Cancelled").length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Therapy Sessions</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <Button className="flex items-center gap-2" style={{ backgroundColor: "#8159A8" }}>
            <Plus className="h-4 w-4" />
            Add New Session
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              {/* <Zap className="h-12 w-12" style={{ color: '#8159A8' }} /> */}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground">10% up this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              {/* <Zap className="h-12 w-12" style={{ color: '#8159A8' }} /> */}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">8% up this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              {/* <Zap className="h-12 w-12" style={{ color: '#8159A8' }} /> */}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-[#8159A8]`}>
                {stats.upcoming}
              </div>
              <p className="text-xs text-muted-foreground">5% up this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: '#8159A8' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
              {/* <Zap className="h-12 w-12" style={{ color: '#8159A8' }} /> */}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Therapist</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{session.patient}</td>
                  <td className="py-4 px-4">{session.therapist}</td>
                  <td className="py-4 px-4">{session.type}</td>
                  <td className="py-4 px-4">{session.date}</td>
                  <td className="py-4 px-4">{session.time}</td>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs">View</Button>
                      <Button size="sm" variant="outline" className="text-xs">Edit</Button>
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
