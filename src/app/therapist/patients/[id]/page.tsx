"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, User, FileText,  Eye, ArrowLeft, Plus } from "lucide-react";
import MedicationManagement from "@/components/therapist/MedicationManagement";
import { Medication } from "@/types/medications";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image"; // Add this import for the Image component

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

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  // Optional image URL for patient avatar/profile picture
  image?: string;
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
  const [showAssignTask, setShowAssignTask] = useState(false);

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


  // Assigned Tasks data
  const assignedAssessments = [
  {
    id: "1",
    title: "Auditory Processing - Listening Task",
    type: "LISTENING_TASK",
    assignedDate: "July 10, 2024",
    deadline: "July 25, 2024", // <-- Added deadline
    status: "Completed",
    score: 78,
    completedAt: "July 22, 2024",
  },
  {
    id: "2",
    title: "Visual Perception - Picture Description",
    type: "PICTURE_DESCRIPTION",
    assignedDate: "July 8, 2024",
    deadline: "July 20, 2024", // <-- Added deadline
    status: "Pending",
    score: null,
    completedAt: null,
  },
];

  // Uploaded Documents data
  const uploadedDocuments = [
    {
      id: 1,
      name: "Medical History Form.pdf",
      type: "Medical Records",
      uploadDate: "January 15, 2024",
      size: "2.3 MB",
      description: "Complete medical history including previous diagnoses, treatments, and family history",
      uploadedBy: "Patient"
    },
    
    {
      id: 2,
      name: "Previous Therapy Records.pdf",
      type: "Therapy Records",
      uploadDate: "January 16, 2024",
      size: "4.7 MB",
      description: "Records from previous therapy sessions with Dr. Ravindi Fernando (2022-2023)",
      uploadedBy: "Patient"
    },
    {
      id: 3,
      name: "ADHD Assessment Report.pdf",
      type: "Assessment",
      uploadDate: "January 18, 2024",
      size: "3.2 MB",
      description: "Comprehensive ADHD assessment conducted by Dr. Anuki Wanniarachchi 2023",
      uploadedBy: "Patient"
    },
   
  ];

  const availableTasks = [
    {
      id: "1",
      type: "LISTENING_TASK",
      typeColor: "bg-blue-100 text-blue-700",
      title: "Auditory Processing - Listening Task",
      description: "Assess auditory processing skills with a focused listening task.",
      assignedCount: 12,
      latestScore: 85,
    },
    {
      id: "2",
      type: "PICTURE_DESCRIPTION",
      typeColor: "bg-purple-100 text-purple-700",
      title: "Visual Perception - Picture Description",
      description: "Evaluate visual perception by describing a complex picture.",
      assignedCount: 8,
      latestScore: 90,
    },
    // Add more tasks as needed
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="mb-6 hover:shadow-md transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </Button>

        {/* Header */}
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950 mb-6">
          <CardContent className="p-6">
            {/* Mobile Layout */}
            <div className="flex flex-col space-y-4 sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#a174c6] text-white text-lg font-semibold flex items-center justify-center">
                    {patient.image ? (
                      <Image
                        src={patient.image}
                        alt={`${patient.firstName} ${patient.lastName}`}
                        className="object-cover"
                        fill
                        sizes="48px"
                      />
                    ) : (
                      patient.initials
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#8159A8]">
                      {patient.firstName} {patient.lastName}
                    </h2>
                    <p className="text-xs text-gray-600">Age: {patient.age}</p>
                  </div>
                </div>
                {/* Removed status badge */}
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
                <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden bg-[#a174c6] text-white text-xl font-semibold flex items-center justify-center">
                  {patient.image ? (
                    <Image
                      src={patient.image}
                      alt={`${patient.firstName} ${patient.lastName}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 1024px) 48px, 64px"
                    />
                  ) : (
                    patient.initials
                  )}
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
              {/* Removed status badge */}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
          <CardContent className="p-6">
            <Tabs defaultValue="info" value={tab} onValueChange={setTab} className="w-full">              
                <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="info" className="text-xs sm:text-sm">Information</TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs sm:text-sm">Sessions</TabsTrigger>
                <TabsTrigger value="medications" className="text-xs sm:text-sm">Medication</TabsTrigger>
                <TabsTrigger value="assessments" className="text-xs sm:text-sm">Assessments</TabsTrigger>
{/*                 <TabsTrigger value="docs" className="text-xs sm:text-sm">Documents</TabsTrigger>
 */}              </TabsList>

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
                    <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#8159A8' }}>Session History</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Track progress and therapy milestones</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-4 text-center">
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
                      <option value="Individual">Individual</option>
                      <option value="With Guardian">With Guardian</option>
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
                    // const getStatusColor = (status: string) => {
                    //   switch (status) {
                    //     case 'COMPLETED':
                    //       return 'bg-green-400';
                    //     case 'SCHEDULED':
                    //     case 'APPROVED':
                    //       return 'bg-blue-400';
                    //     case 'CANCELLED':
                    //     case 'NO_SHOW':
                    //       return 'bg-red-400';
                    //     default:
                    //       return 'bg-gray-400';
                    //   }
                    // };

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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                            session.status === 'COMPLETED' ? 'bg-green-300' :
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
                                <Badge className={`font-medium ${
                                  session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
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
                                )
                                }
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

                {/* Load More Button */}
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    className="hover:shadow-md transition-all duration-200"
                    style={{ borderColor: '#8159A8', color: '#8159A8' }}
                  >
                    Load Previous Sessions
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No session history available yet.</h3>
                <p className="text-gray-500">Sessions will appear here as they are completed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="medications" className="pt-6">
          <MedicationManagement 
            patientId={params.id as string} 
            medications={medications}
            onMedicationUpdate={() => fetchMedications(params.id as string)}
          />       
        </TabsContent>

      

        <TabsContent value="assessments" className="pt-6">
          {assignedAssessments && assignedAssessments.length > 0 ? (
            <div className="space-y-6">
              {/* Assigned Assessments Header */}
              <div className="bg-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Assigned Assessments</h3>
                    <p className="text-gray-600">Assessments assigned by the therapist</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">{assignedAssessments.length}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">
                          {assignedAssessments.filter(a => a.status === 'Completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-2xl font-bold text-[#8159A8]">
                          {assignedAssessments.length > 0
                            ? Math.round(
                                (assignedAssessments.filter(a => a.status === 'Completed').length /
                                  assignedAssessments.length) *
                                  100
                              )
                            : 0}
                        %
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end py-4">
                  <Button
                  style={{ backgroundColor: "#8159A8", color: "#fff" }}
                  className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow hover:brightness-110"
                  onClick={() => setShowAssignTask(true)}
                  >
                  <Plus className="w-5 h-5" />
                  Assign a new Assessment
                  </Button>
                </div>
              </div>

              {/* Assessments List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="bg-[#FAF8FB] rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow flex flex-col h-full border border-[#e9e1f3]"
                  >
                    {/* Badges on top */}
                    <div className="flex gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          assessment.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {assessment.status}
                      </span>
                    </div>
                    {/* Title below badges */}
                    <h4 className="text-lg font-semibold text-[#8159A8] mb-2 truncate">{assessment.title}</h4>
                    <div className="flex flex-col gap-1 text-sm text-gray-700 flex-1 mt-1">
                      <div>
                        <span className="font-medium text-black">Assigned:</span> {assessment.assignedDate}
                      </div>
                      <div>
                        <span className="font-medium text-black">Deadline:</span> {assessment.deadline}
                      </div>
                      {assessment.completedAt && (
                      <div>
                        <div>
                        <span className="font-medium text-black">Completed:</span> {assessment.completedAt}
                        </div>
                        <div>
                        <span className="font-medium text-black">Score: </span> {assessment.score}
                        </div>
                      </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="flex-1 flex justify-end">
                        {assessment.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-red-50 text-red-600"
                            onClick={() => {
                              // TODO: Replace with API call to unassign the assessment
                              alert(`Unassigned "${assessment.title}" (mock action)`);
                            }}
                          >
                            Unassign
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No assigned assessments found.</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50"
                      onClick={() => window.location.href = `/therapist/documents/upload`}
                    >
                      Upload Document
                    </Button>
                  </div>
                </div>
              </div>

              
              {/* Documents List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedDocuments.map((document) => (
                  <div key={document.id} className="bg-[#FAF8FB] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col h-full border border-[#e9e1f3]">
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-[#8159A8] truncate">{document.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">{document.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
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
                      </div>
                       
                       
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="hover:bg-blue-50 flex-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-green-50 flex-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </Button>
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
          </CardContent>
        </Card>
      </div>

      {/* Assign Task Dialog - Place this outside of the main content, just before the closing </div> */}
      <Dialog open={showAssignTask} onOpenChange={setShowAssignTask}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign an Assessment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableTasks.map((task) => (
              <div key={task.id} className="bg-[#fcfafd] rounded-2xl shadow p-6 flex flex-col h-full border border-[#f0eef5]">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${task.typeColor}`}>
                    {task.type}
                  </span>
                </div>
                <div className="font-bold text-lg text-[#3b2562] mb-2">{task.title}</div>
                <div className="text-sm text-gray-600 mb-4 flex-1">{task.description}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <User className="w-4 h-4" />
                  {task.assignedCount} patients assigned
                  {task.latestScore && (
                    <>
                      <span className="mx-2">|</span>
                      <FileText className="w-4 h-4" />
                      Latest Score: {task.latestScore}
                    </>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    className="border-green-400 text-green-700 hover:bg-green-50 px-3 py-1 text-s font-semibold"
                    style={{ borderColor: "#1ac600ff" }}
                    // onClick={() => handleAssignTask(task.id)}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              style={{ backgroundColor: "#8159A8", color: "#fff" }}
              className="font-semibold px-6 py-2 rounded-lg"
              onClick={() => setShowAssignTask(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
