"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PatientDetailsPage() {
  const router = useRouter();

  const patient = {
    id: "PT-2024-001",
    firstName: "Vihanga",
    lastName: "Dharmasena",
    initials: "VD",
    dateOfBirth: "2001-03-15",
    age: 24,
    gender: "Male",
    phone: "+94 77 123 4567",
    email: "vihanga.d@email.com",
    emergencyContact: {
      name: "Kumari Dharmasena",
      phone: "+94 71 987 6543",
      relation: "Mother"
    },
    address: "123 Galle Road, Colombo, Western Province 00300",
    registeredDate: "2024-01-15",
    treatmentStarted: "2025-01-04",
    status: "Active",
    lastSession: "2025-06-18",
    nextSession: "2025-06-25"
  };

  const [tab, setTab] = useState("info");

  return (
    <div className="min-h-screen bg-[#f7f5fb] p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← Back to Patients
      </Button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-[#a174c6] text-white text-xl font-semibold w-16 h-16 rounded-full flex items-center justify-center">
            {patient.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#8159A8]">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="text-sm text-gray-600 flex flex-col md:flex-row md:gap-4">
              <span>Age: {patient.age}</span>
              <span>ID: {patient.id}</span>
              <span>Last Session: {patient.lastSession}</span>
              <span>Treatment Started: {patient.treatmentStarted}</span>
            </div>
          </div>
        </div>
        <div className="bg-green-100 text-green-700 font-medium px-4 py-1 rounded-full text-sm">
          {patient.status}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" value={tab} onValueChange={setTab} className="bg-white p-4 rounded-xl shadow-md">
        <TabsList className="flex border-b gap-4 px-2 pb-2">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="tasks">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="docs">Uploaded Documents</TabsTrigger>
        </TabsList>

        {/* Tab Panels */}
        <TabsContent value="info" className="pt-6">
          {/* Personal Info */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Personal Information</h3>
            <p><strong>Full Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Date of Birth:</strong> March 15, 2001 (Age: {patient.age} years)</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
          </section>

          {/* Contact Info */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Contact Information</h3>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Emergency Contact:</strong> {patient.emergencyContact.name} ({patient.emergencyContact.relation}) – {patient.emergencyContact.phone}</p>
            <p><strong>Address:</strong> {patient.address}</p>
          </section>

          {/* Treatment Info */}
          <section>
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Treatment Information</h3>
            <p><strong>Registration Date:</strong> {patient.registeredDate}</p>
            <p><strong>Treatment Status:</strong> {patient.status}</p>
            <p><strong>Next Session:</strong> {patient.nextSession}</p>
          </section>
        </TabsContent>

        <TabsContent value="sessions" className="pt-6">
          <p className="text-muted-foreground">No session history available yet.</p>
        </TabsContent>

        <TabsContent value="medications" className="pt-6">
          <p className="text-muted-foreground">No medications recorded.</p>
        </TabsContent>

        <TabsContent value="history" className="pt-6">
          <p className="text-muted-foreground">No medical history provided.</p>
        </TabsContent>

        <TabsContent value="tasks" className="pt-6">
          <p className="text-muted-foreground">No assigned tasks found.</p>
        </TabsContent>

        <TabsContent value="docs" className="pt-6">
          <p className="text-muted-foreground">No documents uploaded.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
