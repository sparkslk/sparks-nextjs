"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  address: string;
  registeredDate: string;
  treatmentStarted: string;
  status: string;
  lastSession: string;
  nextSession: string;
  therapySessions?: any[];
}

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("info");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchPatientData(params.id as string);
    }
  }, [status, params.id, router]);

  const fetchPatientData = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/therapist/patients/${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Patient not found or not assigned to your care");
        }
        throw new Error(`Failed to fetch patient data: ${response.statusText}`);
      }

      const data = await response.json();
      setPatient(data.patient);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Error Loading Patient</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Patient not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Session history data - use actual data from API or fallback
  const sessionHistory = patient.therapySessions || [];

  // For now, keeping the hardcoded data for other sections as they don't exist in the API yet
  // These can be moved to the API later
  
  // Medications data
  const medications = [
    {
      id: 1,
      name: "Adderall XR 20mg",
      morningTime: "8:00 AM",
      eveningTime: "2:00 PM",
      frequency: "Twice Daily",
      duration: "30 days",
      notes: "Start with morning dose to assess tolerance. Monitor for appetite changes and sleep patterns. Patient should take with food to reduce stomach upset."
    },
    {
      id: 2,
      name: "Strattera 40mg",
      morningTime: "9:00 AM",
      eveningTime: "Not Set",
      frequency: "Once Daily",
      duration: "60 days",
      notes: "Non-stimulant alternative. Monitor for mood changes and effectiveness over 4-6 weeks. Can be taken with or without food."
    }
  ];

  // Medical History data
  const medicalHistory = {
    adherenceRate: "89%",
    missedDoses: 12,
    totalDoses: 247,
    currentStreak: 7,
    weeklyPattern: [
      { day: "Mon", status: "taken" },
      { day: "Tue", status: "taken" },
      { day: "Wed", status: "taken" },
      { day: "Thu", status: "taken" },
      { day: "Fri", status: "missed" },
      { day: "Sat", status: "taken" },
      { day: "Sun", status: "taken" }
    ],
    detailedHistory: [
      {
        id: 1,
        date: "June 25, 2025",
        medication: "Adderall XR 20mg",
        time: "8:00 AM & 2:30 PM",
        status: "EXCELLENT",
        notes: "Feeling focused and alert. No side effects noticed. Taking with breakfast as recommended."
      },
      {
        id: 2,
        date: "June 23, 2025",
        medication: "Adderall XR 20mg",
        time: "8:15 AM & Evening: Missed",
        status: "PARTIAL",
        notes: "Forgot evening dose due to busy work meeting. Recommend to set alarms, reminders."
      },
      {
        id: 3,
        date: "June 21, 2025",
        medication: "Adderall XR 20mg",
        time: "7:45 AM & 2:30 PM",
        status: "EXCELLENT",
        notes: "Completely forgot about morning. Need to set multiple reminders."
      },
      {
        id: 4,
        date: "June 20, 2025",
        medication: "Adderall XR 20mg",
        time: "Morning: Missed",
        status: "MISSED",
        notes: "Woke up late and rushed to work. Completely forgot about medication. Need to set automatic reminders."
      },
      {
        id: 5,
        date: "June 18, 2025",
        medication: "Strattera 40mg",
        time: "9:02 AM",
        status: "EXCELLENT",
        notes: "Once daily medication. Patient compliance is Adhered ok. Monitoring for effectiveness and side effects during medication switch."
      }
    ]
  };

  // Assigned Tasks data
  const assignedTasks = [
    {
      id: 1,
      title: "Daily Mindfulness Practice",
      description: "Practice mindfulness meditation for 10 minutes every morning",
      assignedDate: "June 18, 2025",
      dueDate: "July 18, 2025",
      status: "In Progress",
      priority: "High",
      progress: 65,
      category: "Mindfulness",
      instructions: "Use the Headspace app or guided meditation videos. Focus on breathing exercises and body awareness.",
      completedSessions: 13,
      totalSessions: 20,
      lastCompleted: "June 27, 2025",
      notes: "Patient showing good consistency. Reports feeling more calm and focused during work hours."
    },
    {
      id: 2,
      title: "Time Management Tracking",
      description: "Use a planner to break down large tasks into smaller, manageable steps",
      assignedDate: "June 11, 2025",
      dueDate: "July 11, 2025",
      status: "Completed",
      priority: "Medium",
      progress: 100,
      category: "Organization",
      instructions: "Create daily task lists, prioritize activities, and track completion times. Review weekly with therapist.",
      completedSessions: 15,
      totalSessions: 15,
      lastCompleted: "June 25, 2025",
      notes: "Successfully implemented organizational system. Patient reports significant improvement in work productivity."
    },
    {
      id: 3,
      title: "Attention Span Exercises",
      description: "Complete focused attention exercises using cognitive training apps",
      assignedDate: "June 20, 2025",
      dueDate: "July 20, 2025",
      status: "Pending",
      priority: "Medium",
      progress: 25,
      category: "Cognitive Training",
      instructions: "Use Lumosity or similar apps for 15 minutes daily. Focus on attention and memory games.",
      completedSessions: 5,
      totalSessions: 20,
      lastCompleted: "June 26, 2025",
      notes: "Started recently. Initial results show improvement in sustained attention tasks."
    },
    {
      id: 4,
      title: "Sleep Hygiene Implementation",
      description: "Follow sleep routine guidelines to improve rest quality",
      assignedDate: "June 15, 2025",
      dueDate: "July 15, 2025",
      status: "Overdue",
      priority: "High",
      progress: 40,
      category: "Lifestyle",
      instructions: "Maintain consistent bedtime, avoid screens 1 hour before sleep, create relaxing bedtime routine.",
      completedSessions: 8,
      totalSessions: 20,
      lastCompleted: "June 22, 2025",
      notes: "Patient struggling with consistency due to work demands. Need to discuss flexible alternatives."
    }
  ];

  // Uploaded Documents data
  const uploadedDocuments = [
    {
      id: 1,
      name: "Medical History Form.pdf",
      type: "Medical Records",
      uploadDate: "January 15, 2024",
      size: "2.3 MB",
      status: "Verified",
      description: "Complete medical history including previous diagnoses, treatments, and family history",
      uploadedBy: "Patient",
      lastAccessed: "June 18, 2025"
    },
    {
      id: 2,
      name: "Insurance Card - Front & Back.jpg",
      type: "Insurance",
      uploadDate: "January 15, 2024",
      size: "1.8 MB",
      status: "Verified",
      description: "Health insurance card documentation for billing purposes",
      uploadedBy: "Patient",
      lastAccessed: "January 20, 2024"
    },
    {
      id: 3,
      name: "Previous Therapy Records.pdf",
      type: "Therapy Records",
      uploadDate: "January 16, 2024",
      size: "4.7 MB",
      status: "Verified",
      description: "Records from previous therapy sessions with Dr. Sarah Williams (2022-2023)",
      uploadedBy: "Patient",
      lastAccessed: "February 5, 2024"
    },
    {
      id: 4,
      name: "ADHD Assessment Report.pdf",
      type: "Assessment",
      uploadDate: "January 18, 2024",
      size: "3.2 MB",
      status: "Verified",
      description: "Comprehensive ADHD assessment conducted by Dr. Michael Chen in December 2023",
      uploadedBy: "Patient",
      lastAccessed: "June 10, 2025"
    },
    {
      id: 5,
      name: "Emergency Contact Information.pdf",
      type: "Personal",
      uploadDate: "January 15, 2024",
      size: "0.5 MB",
      status: "Verified",
      description: "Emergency contact details and consent forms",
      uploadedBy: "Patient",
      lastAccessed: "March 12, 2024"
    },
    {
      id: 6,
      name: "Work Accommodation Letter.pdf",
      type: "Legal",
      uploadDate: "February 10, 2024",
      size: "1.2 MB",
      status: "Pending Review",
      description: "Letter requesting workplace accommodations for ADHD management",
      uploadedBy: "Patient",
      lastAccessed: "February 12, 2024"
    }
  ];

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
              <span>Next Session: {patient.nextSession}</span>
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
            {/* <p><strong>Full Name:</strong> {patient.firstName} {patient.lastName}</p> */}
            <p><strong>Date of Birth:</strong> {patient.dateOfBirth} ({patient.age} years)</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Address:</strong> {patient.address}</p>
          </section>

  

          {/* Emergency Contact Info */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Emergency Contact</h3>
            <p><strong>Name:</strong> {patient.emergencyContact.name}</p>
            <p><strong>Relationship:</strong> {patient.emergencyContact.relation}</p>
            <p><strong>Phone:</strong> {patient.emergencyContact.phone}</p>
          </section>

          {/* Treatment Info */}
          <section>
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Treatment Information</h3>
            <p><strong>Registration Date:</strong> {patient.registeredDate}</p>
            <p><strong>Treatment Status:</strong> {patient.status}</p>
            {/* <p><strong>Next Session:</strong> {patient.nextSession}</p> */}
          </section>
        </TabsContent>

        <TabsContent value="sessions" className="pt-6">
          {sessionHistory && sessionHistory.length > 0 ? (
            <div className="space-y-6">
              {/* Session History Header */}
              <div className="bg-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Session History</h3>
                    <p className="text-gray-600">Track progress and therapy milestones</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{sessionHistory.length}</div>
                        <div className="text-sm text-gray-600">Total Sessions</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">95%</div>
                        <div className="text-sm text-gray-600">Attendance</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">18</div>
                        <div className="text-sm text-gray-600">Jun 2025</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Session Cards */}
                <div className="space-y-8">
                  {sessionHistory.map((session, index) => (
                    <div key={session.id} className="relative flex gap-6">
                      {/* Timeline Node */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          session.progress === 'Excellent' ? 'bg-green-500' : 
                          session.progress === 'Good' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}>
                          #{session.id}
                        </div>
                      </div>

                      {/* Session Card */}
                      <div className="flex-1 bg-white rounded-xl shadow-md border-l-4 border-[#8159A8] p-6 hover:shadow-lg transition-shadow">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-[#8159A8] mb-1">Session #{session.id}</h4>
                            <p className="text-gray-500 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {session.date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              session.progress === 'Excellent' ? 'bg-green-100 text-green-700' : 
                              session.progress === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {session.progress}
                            </span>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              ✓ {session.attendance}
                            </span>
                          </div>
                        </div>

                        {/* Session Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium uppercase">Duration</span>
                            </div>
                            <p className="font-semibold text-gray-900">{session.duration}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-medium uppercase">Focus Area</span>
                            </div>
                            <p className="font-semibold text-gray-900">{session.focusArea}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 md:col-span-1 col-span-2">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                              </svg>
                              <span className="text-xs font-medium uppercase">Therapist</span>
                            </div>
                            <p className="font-semibold text-gray-900">Dr. Smith</p>
                          </div>
                        </div>

                        {/* Session Content */}
                        <div className="space-y-4">
                          {/* Session Notes */}
                          <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              </svg>
                              <h5 className="font-semibold text-gray-900">Session Notes</h5>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{session.notes}</p>
                          </div>

                          {/* Two Column Layout for Additional Info */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                              {session.mentalStatus && (
                                <div className="bg-gray-50 rounded-lg p-3 border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <h6 className="font-medium text-gray-900">Mental Status</h6>
                                  </div>
                                  <p className="text-gray-700 text-sm">{session.mentalStatus}</p>
                                </div>
                              )}

                              <div className="bg-gray-50 rounded-lg p-3 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                  </svg>
                                  <h6 className="font-medium text-gray-900">Interventions Used</h6>
                                </div>
                                <p className="text-gray-700 text-sm">{session.interventions}</p>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                              <div className="bg-gray-50 rounded-lg p-3 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <h6 className="font-medium text-gray-900">Homework Assigned</h6>
                                </div>
                                <p className="text-gray-700 text-sm">{session.homework}</p>
                              </div>

                              {session.observations && (
                                <div className="bg-gray-50 rounded-lg p-3 border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <h6 className="font-medium text-gray-900">Key Observations</h6>
                                  </div>
                                  <p className="text-gray-700 text-sm">{session.observations}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Next Session Plan */}
                          <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <h5 className="font-semibold text-gray-900">Next Session Plan</h5>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{session.nextPlan}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Notes
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            View Report
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                <div className="text-center mt-8">
                  <Button variant="outline" className="bg-white border-[#8159A8] text-[#8159A8] hover:bg-[#8159A8] hover:text-white">
                    Load Previous Sessions
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-muted-foreground text-lg">No session history available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Sessions will appear here as they are completed.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="medications" className="pt-6">
          {medications && medications.length > 0 ? (
            <div className="space-y-6">
              {/* Medications Header */}
              <div className="bg-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Current Medications</h3>
                    <p className="text-gray-600">Monitor and manage patient prescriptions</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{medications.length}</div>
                        <div className="text-sm text-gray-600">Active Medications</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">89%</div>
                        <div className="text-sm text-gray-600">Adherence Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Medication Button */}
              <div className="flex justify-end">
                <Button className="bg-[#8159A8] hover:bg-[#6d4a8f] text-white">
                  + Add Medication
                </Button>
              </div>

              {/* Medications List */}
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="bg-white border-l-4 border-[#8159A8] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-[#8159A8]">{medication.name}</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                          Unallocate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Morning Time</p>
                        <p className="font-semibold text-gray-900">{medication.morningTime}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Evening Time</p>
                        <p className="font-semibold text-gray-900">{medication.eveningTime}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Frequency</p>
                        <p className="font-semibold text-gray-900">{medication.frequency}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">{medication.duration}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        </svg>
                        <h5 className="font-semibold text-gray-900">Therapist Notes</h5>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{medication.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No medications recorded.</p>
          )}
        </TabsContent>

        <TabsContent value="history" className="pt-6">
          {medicalHistory ? (
            <div className="space-y-6">
              {/* Medical History Header */}
              <div className="bg-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Medical History</h3>
                    <p className="text-gray-600">Track medication adherence and patterns</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{medicalHistory.adherenceRate}</div>
                        <div className="text-sm text-gray-600">Adherence Rate</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{medicalHistory.currentStreak}</div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{medicalHistory.totalDoses}</div>
                        <div className="text-sm text-gray-600">Total Doses</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <select className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm">
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                  <select className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm">
                    <option>All Medications</option>
                    <option>Adderall XR</option>
                    <option>Strattera</option>
                  </select>
                </div>
                <Button variant="outline" size="sm" className="bg-white">Export Report</Button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-green-600">{medicalHistory.adherenceRate}</div>
                  <div className="text-sm text-gray-600">Overall Adherence Rate</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-red-600">{medicalHistory.missedDoses}</div>
                  <div className="text-sm text-gray-600">Missed Doses (30 days)</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-[#8159A8]">{medicalHistory.totalDoses}</div>
                  <div className="text-sm text-gray-600">Total Doses Taken</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-orange-600">{medicalHistory.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak (days)</div>
                </div>
              </div>

              {/* Weekly Adherence Pattern */}
              <div className="bg-white p-6 rounded-xl border shadow-md">
                <h4 className="text-lg font-semibold text-[#8159A8] mb-4">Weekly Adherence Pattern</h4>
                <div className="flex gap-2 mb-4">
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Taken
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    Missed
                  </span>
                </div>
                <div className="flex gap-2">
                  {medicalHistory.weeklyPattern.map((day, index) => (
                    <div key={index} className="flex-1">
                      <div className="text-xs text-center mb-2 font-medium">{day.day}</div>
                      <div className={`h-12 rounded-lg ${
                        day.status === 'taken' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Medication History */}
              <div className="bg-white p-6 rounded-xl border shadow-md">
                <h4 className="text-lg font-semibold text-[#8159A8] mb-2">Detailed Medication History</h4>
                <p className="text-sm text-gray-600 mb-6">Chronological view of all medication events and adherence patterns</p>
                
                <div className="space-y-4">
                  {medicalHistory.detailedHistory.map((entry) => (
                    <div key={entry.id} className="flex gap-4 p-4 border-l-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" 
                         style={{borderLeftColor: 
                           entry.status === 'EXCELLENT' ? '#10b981' : 
                           entry.status === 'PARTIAL' ? '#f59e0b' : '#ef4444'
                         }}>
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        entry.status === 'EXCELLENT' ? 'bg-green-500' : 
                        entry.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{entry.medication}</p>
                            <p className="text-sm text-gray-600">{entry.time}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{entry.date}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              entry.status === 'EXCELLENT' ? 'bg-green-100 text-green-700' : 
                              entry.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {entry.status}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-sm text-gray-700 font-medium mb-1">Patient Notes:</p>
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" className="bg-white border-[#8159A8] text-[#8159A8] hover:bg-[#8159A8] hover:text-white">
                    Load More History
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No medical history provided.</p>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="pt-6">
          {assignedTasks && assignedTasks.length > 0 ? (
            <div className="space-y-6">
              {/* Assigned Tasks Header */}
              <div className="bg-transpaent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Assigned Tasks</h3>
                    <p className="text-gray-600">Monitor patient progress and task completion</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{assignedTasks.length}</div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">
                          {Math.round(assignedTasks.reduce((sum, task) => sum + task.progress, 0) / assignedTasks.length)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Task Button */}
              <div className="flex justify-end">
                <Button className="bg-[#8159A8] hover:bg-[#6d4a8f] text-white">
                  + Assign New Task
                </Button>
              </div>

              {/* Task Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-[#8159A8]">{assignedTasks.length}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {assignedTasks.filter(task => task.status === 'Completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {assignedTasks.filter(task => task.status === 'In Progress').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {assignedTasks.filter(task => task.status === 'Overdue').length}
                  </div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {assignedTasks.map((task) => (
                  <div key={task.id} className="bg-white border-l-4 border-[#8159A8] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-[#8159A8]">{task.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'High' ? 'bg-red-50 text-red-600' :
                            task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress: {task.completedSessions}/{task.totalSessions} sessions</span>
                        <span className="font-semibold">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-[#8159A8] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Task Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Category</p>
                        <p className="font-semibold text-gray-900">{task.category}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Assigned Date</p>
                        <p className="font-semibold text-gray-900">{task.assignedDate}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Due Date</p>
                        <p className="font-semibold text-gray-900">{task.dueDate}</p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <h5 className="font-semibold text-gray-900">Instructions</h5>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{task.instructions}</p>
                    </div>

                    {/* Therapist Notes */}
                    <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        </svg>
                        <h5 className="font-semibold text-gray-900">Therapist Notes</h5>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{task.notes}</p>
                    </div>

                    {/* Last Activity */}
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <span>Last completed: {task.lastCompleted}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">Edit Task</Button>
                        <Button variant="outline" size="sm" className="hover:bg-gray-50">View Details</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No assigned tasks found.</p>
          )}
        </TabsContent>

        <TabsContent value="docs" className="pt-6">
          {uploadedDocuments && uploadedDocuments.length > 0 ? (
            <div className="space-y-6">
              {/* Uploaded Documents Header */}
              <div className="bg-transpaent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Uploaded Documents</h3>
                    <p className="text-gray-600">Manage and review patient documentation</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{uploadedDocuments.length}</div>
                        <div className="text-sm text-gray-600">Total Documents</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">
                          {uploadedDocuments.filter(doc => doc.status === 'Verified').length}
                        </div>
                        <div className="text-sm text-gray-600">Verified</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Documents List */}
              <div className="space-y-4">
                {uploadedDocuments.map((document) => (
                  <div key={document.id} className="bg-white border-l-4 border-[#8159A8] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* File Icon */}
                        <div className="w-16 h-16 bg-[#8159A8] bg-opacity-10 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#8159A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-[#8159A8] truncate">{document.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              document.status === 'Verified' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {document.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{document.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium text-gray-900 ml-1">{document.type}</span>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-gray-500">Size:</span>
                              <span className="font-medium text-gray-900 ml-1">{document.size}</span>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-gray-500">Uploaded:</span>
                              <span className="font-medium text-gray-900 ml-1">{document.uploadDate}</span>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-gray-500">By:</span>
                              <span className="font-medium text-gray-900 ml-1">{document.uploadedBy}</span>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-gray-500">Last accessed:</span>
                              <span className="font-medium text-gray-900 ml-1">{document.lastAccessed}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-6">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-green-50">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              
            </div>
          ) : (
            <p className="text-muted-foreground">No documents uploaded.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
