"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MedicationManagement from "@/components/therapist/MedicationManagement";
import { Medication } from "@/types/medications";

interface TherapySession {
  id: string;
  scheduledAt: string;
  status: string;
  type: string;
  duration?: number;
  attendanceStatus?: string;
  overallProgress?: string;
  patientEngagement?: string;
  riskAssessment?: string;
  primaryFocusAreas?: string;
  sessionNotes?: string;
  nextSessionGoals?: string;
}

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
  therapySessions?: TherapySession[];
}

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
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
      fetchMedications(params.id as string);
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

  const fetchMedications = async (patientId: string) => {
    try {
      const response = await fetch(`/api/therapist/patients/${patientId}/medications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      } else {
        console.error("Failed to fetch medications:", response.statusText);
        // Don't set error here as medications are optional
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
      // Don't set error here as medications are optional
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
    <div className="min-h-screen bg-[#f7f5fb] p-3 sm:p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 sm:mb-6">
        ← Back to Patients
      </Button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#a174c6] text-white text-lg font-semibold w-12 h-12 rounded-full flex items-center justify-center">
                {patient.initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#8159A8]">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-xs text-gray-600">Age: {patient.age}</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full text-xs">
              {patient.status}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <span>ID: {patient.id}</span>
            <span>Last: {patient.lastSession}</span>
            <span className="col-span-2">Next: {patient.nextSession}</span>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="bg-[#a174c6] text-white text-xl font-semibold w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center">
              {patient.initials}
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-[#8159A8]">
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
          <div className="bg-green-100 text-green-700 font-medium px-3 lg:px-4 py-1 rounded-full text-sm">
            {patient.status}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" value={tab} onValueChange={setTab} className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
        <TabsList className="flex flex-wrap border-b gap-1 sm:gap-2 px-1 sm:px-2 pb-2">
          <TabsTrigger value="info" className="text-xs sm:text-sm flex-shrink-0">Infomation</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs sm:text-sm flex-shrink-0">Sessions</TabsTrigger>
          <TabsTrigger value="medications" className="text-xs sm:text-sm flex-shrink-0">Medication</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm flex-shrink-0">Medical History</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm flex-shrink-0">Tasks</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs sm:text-sm flex-shrink-0">Documents</TabsTrigger>
        </TabsList>

        {/* Tab Panels */}
        <TabsContent value="info" className="pt-4 sm:pt-6">
          {/* Personal Info */}
          <section className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Personal Information</h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Date of Birth:</strong> {patient.dateOfBirth} ({patient.age} years)</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>Phone:</strong> {patient.phone}</p>
              <p><strong>Email:</strong> <span className="break-all">{patient.email}</span></p>
              <p><strong>Address:</strong> {patient.address}</p>
            </div>
          </section>

          {/* Emergency Contact Info */}
          <section className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Emergency Contact</h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Name:</strong> {patient.emergencyContact.name}</p>
              <p><strong>Relationship:</strong> {patient.emergencyContact.relation}</p>
              <p><strong>Phone:</strong> {patient.emergencyContact.phone}</p>
            </div>
          </section>

          {/* Treatment Info */}
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Treatment Information</h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Registration Date:</strong> {patient.registeredDate}</p>
              <p><strong>Treatment Status:</strong> {patient.status}</p>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="sessions" className="pt-4 sm:pt-6">
          {sessionHistory && sessionHistory.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Session History Header */}
              <div className="bg-transparent">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#8159A8]">Session History</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Track progress and therapy milestones</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border">
                        <div className="text-lg sm:text-2xl font-bold text-[#8159A8]">{sessionHistory.length}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Sessions</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border">
                        <div className="text-lg sm:text-2xl font-bold text-[#8159A8]">
                          {sessionHistory.length > 0 ? Math.round((sessionHistory.filter(s => s.status === 'COMPLETED').length / sessionHistory.length) * 100) : 0}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border">
                        <div className="text-lg sm:text-2xl font-bold text-[#8159A8]">
                          {sessionHistory.length > 0 ? new Date(sessionHistory[0].scheduledAt).getDate() : "-"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {sessionHistory.length > 0 ? new Date(sessionHistory[0].scheduledAt).toLocaleDateString('en-US', { month: 'short' }) : "No Data"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Session Cards */}
                <div className="space-y-8">
                  {sessionHistory.map((session, index) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'COMPLETED':
                          return 'bg-green-400';
                        case 'SCHEDULED':
                        case 'APPROVED':
                          return 'bg-blue-400';
                        case 'CANCELLED':
                        case 'NO_SHOW':
                          return 'bg-red-400';
                        default:
                          return 'bg-gray-400';
                      }
                    };

                    const getProgressText = (overallProgress: string) => {
                      switch (overallProgress) {
                        case 'EXCELLENT':
                          return 'Excellent';
                        case 'GOOD':
                          return 'Good';
                        case 'FAIR':
                          return 'Fair';
                        case 'POOR':
                          return 'Poor';
                        case 'CONCERNING':
                          return 'Concerning';
                        default:
                          return 'Not Documented';
                      }
                    };

                    const getProgressColor = (overallProgress: string) => {
                      switch (overallProgress) {
                        case 'EXCELLENT':
                          return 'bg-green-100 text-green-700';
                        case 'GOOD':
                          return 'bg-blue-100 text-blue-700';
                        case 'FAIR':
                          return 'bg-yellow-100 text-yellow-700';
                        case 'POOR':
                          return 'bg-orange-100 text-orange-700';
                        case 'CONCERNING':
                          return 'bg-red-100 text-red-700';
                        default:
                          return 'bg-gray-100 text-gray-700';
                      }
                    };

                    const getEngagementText = (engagement: string) => {
                      switch (engagement) {
                        case 'HIGH':
                          return 'High';
                        case 'MEDIUM':
                          return 'Medium';
                        case 'LOW':
                          return 'Low';
                        case 'RESISTANT':
                          return 'Resistant';
                        default:
                          return 'Not Rated';
                      }
                    };

                    const getAttendanceText = (attendance: string) => {
                      switch (attendance) {
                        case 'PRESENT':
                          return 'Present';
                        case 'LATE':
                          return 'Late';
                        case 'NO_SHOW':
                          return 'No Show';
                        case 'CANCELLED':
                          return 'Cancelled';
                        default:
                          return 'Not Recorded';
                      }
                    };

                    const getRiskText = (risk: string) => {
                      switch (risk) {
                        case 'NONE':
                          return 'None';
                        case 'LOW':
                          return 'Low';
                        case 'MEDIUM':
                          return 'Medium';
                        case 'HIGH':
                          return 'High';
                        default:
                          return 'Not Assessed';
                      }
                    };

                    const getRiskColor = (risk: string) => {
                      switch (risk) {
                        case 'NONE':
                          return 'text-green-700';
                        case 'LOW':
                          return 'text-blue-700';
                        case 'MEDIUM':
                          return 'text-yellow-700';
                        case 'HIGH':
                          return 'text-red-700';
                        default:
                          return 'text-gray-700';
                      }
                    };

                    // Helper function to safely parse and format dates (from sessions page)
                    const formatDate = (dateString: string) => {
                      return new Date(dateString).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    };

                    const formatTime = (dateString: string) => {
                      return new Date(dateString).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                    };

                    const formatTimeManual = (dateString: string) => {
                      // Extract just the time part manually to avoid timezone issues
                      if (dateString.includes('T')) {
                        const timePart = dateString.split('T')[1];
                        const timeOnly = timePart.split('.')[0]; // Remove milliseconds if present
                        const finalTime = timeOnly.split('Z')[0]; // Remove Z if present
                        
                        // Convert to 24-hour format
                        const [hours, minutes] = finalTime.split(':');
                        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                      }
                      
                      // Fallback to original method
                      return formatTime(dateString);
                    };

                    const parseFocusAreas = (focusAreasString: string) => {
                      try {
                        const parsed = JSON.parse(focusAreasString);
                        return Array.isArray(parsed) ? parsed : [];
                      } catch {
                        return [];
                      }
                    };

                    return (
                      <div key={session.id} className="relative flex gap-6">
                        {/* Timeline Node */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${getStatusColor(session.status)}`}>
                            #{index + 1}
                          </div>
                        </div>

                        {/* Session Card */}
                        <div className="flex-1 bg-purple-50 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-[#8159A8] mb-1">Session - {session.type || 'Therapy Session'}</h4>
                              <p className="text-gray-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {formatDate(session.scheduledAt)} at {formatTimeManual(session.scheduledAt)}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {session.status === 'COMPLETED' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center gap-2"
                                  onClick={() => window.location.href = `/therapist/sessions/${session.id}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Details
                                </Button>
                              )}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                session.status === 'SCHEDULED' || session.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {session.status.replace('_', ' ')}
                              </span>
                              
                            </div>
                          </div>

                          {/* Session Details Grid - Only show for completed sessions */}
                          {session.status === 'COMPLETED' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 17a1 1 0 01-.293-.707L9 12.586l-1.293 1.293a1 1 0 01-1.414-1.414L9 10.757a2 2 0 012.828 0l2.828 2.829a1 1 0 01-1.414 1.414L12 12.586l-3.707 3.707A1 1 0 018 17z" />
                                  </svg>
                                  <span className="text-xs font-medium uppercase">Progress</span>
                                </div>
                                <p className={`font-semibold ${getProgressColor(session.overallProgress || '').split(' ')[1]}`}>
                                  {getProgressText(session.overallProgress || '')}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                  </svg>
                                  <span className="text-xs font-medium uppercase">Attendance</span>
                                </div>
                                <p className="font-semibold text-gray-900">{getAttendanceText(session.attendanceStatus || '')}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs font-medium uppercase">Engagement</span>
                                </div>
                                <p className="font-semibold text-gray-900">{getEngagementText(session.patientEngagement || '')}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs font-medium uppercase">Risk Level</span>
                                </div>
                                <p className={`font-semibold ${getRiskColor(session.riskAssessment || '')}`}>{getRiskText(session.riskAssessment || '')}</p>
                              </div>
                            </div>
                          )}

                          {/* Session Content - Only show clinical details for completed sessions */}
                          {session.status === 'COMPLETED' ? (
                            <div className="space-y-4">
                              {/* Focus Areas */}
                              {session.primaryFocusAreas && parseFocusAreas(session.primaryFocusAreas).length > 0 && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h5 className="font-semibold text-blue-900">Primary Focus Areas</h5>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {parseFocusAreas(session.primaryFocusAreas).map((area, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                                        {area}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Session Notes */}

                              {/* Progress Notes (fallback) */}

                              {/* Next Session Goals */}
                              {session.nextSessionGoals && (
                                <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <h5 className="font-semibold text-green-900">Next Session Goals</h5>
                                  </div>
                                  <p className="text-green-700 text-sm leading-relaxed">{session.nextSessionGoals}</p>
                                </div>
                              )}
                            </div>
                          ) : null}

                          
                        </div>
                      </div>
                    );
                  })}
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
          <MedicationManagement 
            patientId={params.id as string} 
            medications={medications}
            onMedicationUpdate={() => fetchMedications(params.id as string)}
          />
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
