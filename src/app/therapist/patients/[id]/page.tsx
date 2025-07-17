"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

<<<<<<< HEAD
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

  // Session history data - set to empty array or null to show "no history" message
  const sessionHistory = [
    {
      id: 24,
      date: "June 18, 2025",
      duration: "60 minutes",
      focusArea: "Managing work distractions",
      attendance: "Attended",
      progress: "Excellent",
      notes: "Patient showed significant improvement in focus and attention. Discussed coping strategies for managing distractions at work.",
      mentalStatus: "Alert, cooperative, mood stable, no signs of distress.",
      interventions: "Cognitive restructuring, behavioral rehearsal, mindfulness techniques.",
      homework: "Daily mindfulness practice, 10 minutes",
      observations: "Patient appears more confident, using learned strategies independently. Marked improvement in attention; minor difficulties with task initiation remain.",
      nextPlan: "Review mindfulness practice, introduce time management tools."
    },
    {
      id: 23,
      date: "June 11, 2025",
      duration: "60 minutes",
      focusArea: "Organizational strategies",
      attendance: "Attended",
      progress: "Good",
      notes: "Focused on developing organizational systems. Patient engaged well with task-breaking exercises and showed enthusiasm for implementing new strategies.",
      interventions: "Task organization techniques, priority matrix, time-blocking strategies.",
      homework: "Set up daily planner system; practice breaking large tasks into smaller steps",
      nextPlan: "Review organizational system implementation, address any challenges."
    }
  ];

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
=======
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
>>>>>>> origin/Development

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
          {sessionHistory && sessionHistory.length > 0 ? (
            <div className="space-y-6">
              {/* Session History Header */}
<<<<<<< HEAD
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#8159A8]">Session History</h3>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span><strong>Total Sessions:</strong> {sessionHistory.length}</span>
                  <span><strong>Attendance Rate:</strong> 95%</span>
                  <span><strong>Last Session:</strong> Jun 18, 2025</span>
                </div>
              </div>

              {/* Render each session */}
              {sessionHistory.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-[#8159A8]">Session #{session.id}</h4>
                    <span className="text-sm text-gray-500">{session.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">DURATION</p>
                      <p className="font-medium">{session.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">FOCUS AREA</p>
                      <p className="font-medium">{session.focusArea}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">ATTENDANCE</p>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                        ✓ {session.attendance}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">PROGRESS</p>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        session.progress === 'Excellent' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {session.progress}
                      </span>
                    </div>
                  </div>
=======
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
>>>>>>> origin/Development

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Session Notes</h5>
                      <p className="text-gray-600 text-sm">{session.notes}</p>
                    </div>

                    {session.mentalStatus && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">🧠 Mental Status</h5>
                        <p className="text-gray-600 text-sm">{session.mentalStatus}</p>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">🔧 Interventions Used</h5>
                      <p className="text-gray-600 text-sm">{session.interventions}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">📚 Homework Assigned</h5>
                      <p className="text-gray-600 text-sm">{session.homework}</p>
                    </div>

                    {session.observations && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">� Key Observations</h5>
                        <p className="text-gray-600 text-sm">{session.observations}</p>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">📅 Next Session Plan</h5>
                      <p className="text-gray-600 text-sm">{session.nextPlan}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">📝 Edit Notes</Button>
                    <Button variant="outline" size="sm">📊 View Full Report</Button>
                    <Button variant="outline" size="sm">📄 Export PDF</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No session history available yet.</p>
          )}
        </TabsContent>

        <TabsContent value="medications" className="pt-6">
<<<<<<< HEAD
          {medications && medications.length > 0 ? (
            <div className="space-y-6">
              {/* Header with Add Medication button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-[#8159A8]">Current Medications</h3>
                <Button className="bg-[#8159A8] hover:bg-[#6d4a8f] text-white">
                  + Add Medication
                </Button>
              </div>

              {/* Medications List */}
              {medications.map((medication) => (
                <div key={medication.id} className="bg-white border-l-4 border-[#8159A8] rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-[#8159A8]">{medication.name}</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                        Unallocate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Morning Time</p>
                      <p className="font-medium">{medication.morningTime}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Evening Time</p>
                      <p className="font-medium">{medication.eveningTime}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Frequency</p>
                      <p className="font-medium">{medication.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Duration</p>
                      <p className="font-medium">{medication.duration}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">Therapist Notes</h5>
                    <p className="text-gray-600 text-sm">{medication.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No medications recorded.</p>
          )}
=======
          <MedicationManagement 
            patientId={params.id as string} 
            medications={medications}
            onMedicationUpdate={() => fetchMedications(params.id as string)}
          />
>>>>>>> origin/Development
        </TabsContent>

        <TabsContent value="history" className="pt-6">
          {medicalHistory ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-[#8159A8]">Medical History</h3>
                <div className="flex gap-2">
                  <select className="border rounded px-3 py-1 text-sm">
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                  <select className="border rounded px-3 py-1 text-sm">
                    <option>All Medications</option>
                    <option>Adderall XR</option>
                    <option>Strattera</option>
                  </select>
                  <Button variant="outline" size="sm">Export Report</Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-green-600">{medicalHistory.adherenceRate}</div>
                  <div className="text-sm text-gray-600">Overall Adherence Rate</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-red-600">{medicalHistory.missedDoses}</div>
                  <div className="text-sm text-gray-600">Missed Doses (30 days)</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-[#8159A8]">{medicalHistory.totalDoses}</div>
                  <div className="text-sm text-gray-600">Total Doses Taken</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-orange-600">{medicalHistory.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak (days)</div>
                </div>
              </div>

              {/* Weekly Adherence Pattern */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold mb-4">Weekly Adherence Pattern</h4>
                <div className="flex gap-2 mb-2">
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Morning Dose
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Evening Dose
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    Missed
                  </span>
                </div>
                <div className="flex gap-1">
                  {medicalHistory.weeklyPattern.map((day, index) => (
                    <div key={index} className="flex-1">
                      <div className="text-xs text-center mb-1">{day.day}</div>
                      <div className={`h-8 rounded ${
                        day.status === 'taken' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Medication History */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold mb-4">Detailed Medication History</h4>
                <p className="text-sm text-gray-600 mb-6">Chronological view of all medication events and adherence patterns</p>
                
                <div className="space-y-4">
                  {medicalHistory.detailedHistory.map((entry) => (
                    <div key={entry.id} className="flex gap-4 p-4 border-l-4 rounded-lg bg-gray-50" 
                         style={{borderLeftColor: 
                           entry.status === 'EXCELLENT' ? '#10b981' : 
                           entry.status === 'PARTIAL' ? '#f59e0b' : '#ef4444'
                         }}>
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        entry.status === 'EXCELLENT' ? 'bg-green-500' : 
                        entry.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{entry.medication}</p>
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
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm text-gray-700"><strong>Patient Notes:</strong></p>
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline">Load More History</Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No medical history provided.</p>
          )}
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
