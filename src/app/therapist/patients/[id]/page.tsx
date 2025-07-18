"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, User, FileText, Activity, Eye, ArrowLeft } from "lucide-react";
import MedicationManagement from "@/components/therapist/MedicationManagement";
import { Medication } from "@/types/medications";

interface TherapySession {
  id: string;
  scheduledAt: string;
  status: string;
  type: string;
  duration?: number;
  therapistName?: string;
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
  const [sessionHistory, setSessionHistory] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("info");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [therapistFilter, setTherapistFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("date-desc");

  // Filter function
  const getFilteredSessions = () => {
    if (!sessionHistory) return [];

    let filtered = [...sessionHistory];

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'last-week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last-month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'last-3-months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'last-6-months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case 'this-year':
          filterDate.setMonth(0, 1);
          break;
      }

      if (dateFilter !== 'this-year') {
        filtered = filtered.filter(session => new Date(session.scheduledAt) >= filterDate);
      } else {
        filtered = filtered.filter(session => new Date(session.scheduledAt).getFullYear() === now.getFullYear());
      }
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(session => session.type === typeFilter);
    }

    // Therapist filter (mock implementation)
    if (therapistFilter) {
      filtered = filtered.filter(session => {
        const therapistName = session.therapistName?.toLowerCase() || '';
        return therapistName.includes(therapistFilter.replace('dr-', ''));
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortFilter) {
        case 'date-asc':
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        case 'date-desc':
          return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      }
    });

    return filtered;
  };

  // Clear filters function
  const clearFilters = () => {
    setStatusFilter("");
    setDateFilter("");
    setTypeFilter("");
    setTherapistFilter("");
    setSortFilter("date-desc");
  };

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
      setSessionHistory(data.patient.therapySessions || []);
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

<<<<<<< HEAD
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
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
          <CardContent className="p-6">
            <Tabs defaultValue="info" value={tab} onValueChange={setTab} className="w-full">              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="info" className="text-xs sm:text-sm">Information</TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs sm:text-sm">Sessions</TabsTrigger>
                <TabsTrigger value="medications" className="text-xs sm:text-sm">Medication</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">Medical History</TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
                <TabsTrigger value="docs" className="text-xs sm:text-sm">Documents</TabsTrigger>
              </TabsList>
=======
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
>>>>>>> 28b45a7719cbffab30ddddccc7d005bed47893e8

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

  {/* Render each session */ }
  {
    sessionHistory.map((session) => (
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
            <span className={`px-2 py-1 rounded text-sm font-medium ${session.progress === 'Excellent'
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
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#8159A8' }}>Session History</h3>
              <p className="text-gray-600 text-sm sm:text-base">Track progress and therapy milestones</p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
                  <CardContent className="p-3">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#8159A8' }}>
                      {getFilteredSessions().length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {statusFilter || dateFilter || typeFilter || therapistFilter ? 'Filtered' : 'Total'} Sessions
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
                  <CardContent className="p-3">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#8159A8' }}>
                      {getFilteredSessions().length > 0 ? Math.round((getFilteredSessions().filter(s => s.status === 'COMPLETED').length / getFilteredSessions().length) * 100) : 0}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
                  <CardContent className="p-3">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#8159A8' }}>
                      {getFilteredSessions().length > 0 ? new Date(getFilteredSessions()[0].scheduledAt).getDate() : "-"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {getFilteredSessions().length > 0 ? new Date(getFilteredSessions()[0].scheduledAt).toLocaleDateString('en-US', { month: 'short' }) : "No Data"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Session Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm min-w-[120px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="APPROVED">Approved</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Period:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm min-w-[130px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">3 Months</option>
                <option value="last-6-months">6 Months</option>
                <option value="this-year">This Year</option>
              </select>
            </div>

            {/* Session Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm min-w-[140px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="GROUP">Group</option>
                <option value="FAMILY">Family</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="FOLLOW_UP">Follow-up</option>
              </select>
            </div>

            {/* Therapist Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Therapist:</label>
              <select
                value={therapistFilter}
                onChange={(e) => setTherapistFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm min-w-[120px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="dr-smith">Dr. Smith</option>
                <option value="dr-johnson">Dr. Johnson</option>
                <option value="dr-williams">Dr. Williams</option>
                <option value="dr-brown">Dr. Brown</option>
                <option value="dr-davis">Dr. Davis</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort:</label>
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm min-w-[120px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
                <option value="status">By Status</option>
                <option value="type">By Type</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-300 ml-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(statusFilter || dateFilter || typeFilter || therapistFilter) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-800">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {statusFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter("")} className="hover:bg-purple-200 rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {dateFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Period: {dateFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <button onClick={() => setDateFilter("")} className="hover:bg-purple-200 rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {typeFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Type: {typeFilter}
                      <button onClick={() => setTypeFilter("")} className="hover:bg-purple-200 rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {therapistFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Therapist: {therapistFilter.replace('dr-', 'Dr. ').replace(/\b\w/g, l => l.toUpperCase())}
                      <button onClick={() => setTherapistFilter("")} className="hover:bg-purple-200 rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Timeline Container */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Session Cards */}
          <div className="space-y-8">
            {getFilteredSessions().length > 0 ? getFilteredSessions().map((session, index) => {
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${session.status === 'COMPLETED' ? 'bg-green-300' :
                        session.status === 'SCHEDULED' || session.status === 'APPROVED' ? 'bg-blue-300' :
                          'bg-red-300'
                      }`}>
                      #{getFilteredSessions().length - index}
                    </div>
                  </div>

                  {/* Session Card */}
                  <Card className="flex-1 w-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 bg-white dark:bg-slate-950">
                    <CardHeader className="pb-4">
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">

                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatDate(session.scheduledAt)} at {formatTimeManual(session.scheduledAt)}
                            </CardTitle>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {session.status === 'COMPLETED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-sm"
                              onClick={() => window.location.href = `/therapist/sessions/${session.id}`}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          )}
                          <Badge className={`font-medium ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              session.status === 'SCHEDULED' || session.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {session.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Session Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5" style={{ color: '#8159A8' }} />
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="text-sm font-medium">{session.type || 'Therapy Session'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-medium">{session.duration || 50} minutes</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                          <div>
                            <p className="text-xs text-gray-500">Therapist</p>
                            <p className="text-sm font-medium">Dr. {session.therapistName || 'Therapist'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Session Details Grid - Only show for completed sessions */}
                      {session.status === 'COMPLETED' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">

                              <span className="text-xs font-medium uppercase">Overall Progress</span>
                            </div>
                            <p className={`font-semibold ${getProgressColor(session.overallProgress || '').split(' ')[1]}`}>
                              {getProgressText(session.overallProgress || '')}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">

                              <span className="text-xs font-medium uppercase">Attendance Status</span>
                            </div>
                            <p className="font-semibold text-gray-900">{getAttendanceText(session.attendanceStatus || '')}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">

                              <span className="text-xs font-medium uppercase">Patient Engagement</span>
                            </div>
                            <p className="font-semibold text-gray-900">{getEngagementText(session.patientEngagement || '')}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">

                              <span className="text-xs font-medium uppercase">Risk Assessment</span>
                            </div>
                            <p className={`font-semibold ${getRiskColor(session.riskAssessment || '')}`}>{getRiskText(session.riskAssessment || '')}</p>
                          </div>
                        </div>
                      )}

                      {/* Session Content - Only show clinical details for completed sessions */}
                      {session.status === 'COMPLETED' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Primary Focus Areas */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">

                              <h5 className="font-semibold text-blue-900">Primary Focus Areas</h5>
                            </div>
                            {session.primaryFocusAreas && parseFocusAreas(session.primaryFocusAreas).length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {parseFocusAreas(session.primaryFocusAreas).map((area, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-blue-700 text-sm italic">No focus areas documented</p>
                            )}
                          </div>

                          {/* Session Notes */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">

                              <h5 className="font-semibold text-yellow-900">Session Notes</h5>
                            </div>
                            {session.sessionNotes ? (
                              <p className="text-yellow-700 text-sm leading-relaxed">{session.sessionNotes}</p>
                            ) : (
                              <p className="text-yellow-700 text-sm italic">No session notes documented</p>
                            )}
                          </div>

                          {/* Next Session Goals */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">

                              <h5 className="font-semibold text-green-900">Next Session Goals</h5>
                            </div>
                            {session.nextSessionGoals ? (
                              <p className="text-green-700 text-sm leading-relaxed">{session.nextSessionGoals}</p>
                            ) : (
                              <p className="text-green-700 text-sm italic">No goals set for next session</p>
                            )}
                          </div>
                        </div>
                      ) : null}

                    </CardContent>
                  </Card>
                </div>
              );
            }) : (
              <Card className="shadow-sm border border-gray-200">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions match your filters.</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filter criteria to see more results.</p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
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
        </TabsContent >

    <TabsContent value="medications" className="pt-6">
<<<<<<< HEAD
  {
    medications && medications.length > 0 ? (
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
  )
  }
=======
          <MedicationManagement 
            patientId={params.id as string} 
            medications={medications}
            onMedicationUpdate={() => fetchMedications(params.id as string)}
          />
>>>>>>> origin/Development
        </TabsContent >

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
      </Tabs >
          </CardContent >
        </Card >
      </div >
    </div >
  );
}
