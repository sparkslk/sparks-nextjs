"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionUpdateModal } from "@/components/therapist/SessionUpdateModal";
import MedicationManagement from "@/components/therapist/MedicationManagement";
import { Medication } from "@/types/medications";
import {
  Calendar,
  User,
  FileText,
  CheckSquare,
  ArrowLeft,
  AlertCircle,
  Clock3,
  Edit,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DetailedSession {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  location?: string;
  notes?: string;
  objectives: string[];
  patientMood?: number;
  engagement?: number;
  progressNotes?: string;
  // Clinical documentation fields
  attendanceStatus?: string;
  overallProgress?: string;
  patientEngagement?: string;
  riskAssessment?: string;
  primaryFocusAreas?: string[];
  sessionNotes?: string;
  nextSessionGoals?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    email?: string;
    medicalHistory?: string;
    tasks: Task[];
  };
  sessionHistory: SessionHistory[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  status: string;
  priority: number;
  isRecurring: boolean;
  recurringPattern?: string;
  completedAt?: string;
  completionNotes?: string;
  createdAt: string;
}

interface SessionHistory {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  patientMood?: number;
  engagement?: number;
}

// Remove hardcodedMedications array as we'll use real data

const hardcodedTasks = [
  {
    id: "1",
    title: "Auditory Processing - Listening Task",
    assignedDate: "2024-07-10",
    completedDate: "2024-07-22",
    deadline: "2024-08-22",
    status: "Completed",
    score: 78,
  },
  {
    id: "2",
    title: "Visual Perception - Picture Description",
    assignedDate: "2024-07-08",
    deadline: "2024-06-15",
    status: "Pending",
  }
];

export default function SessionDetailsPage() {
  const { status: authStatus } = useSession();
  const [session, setSession] = useState<DetailedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  
  // Add medications state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoadingMedications, setIsLoadingMedications] = useState(false);
  
  // Remove medication-related states that are now handled by MedicationManagement
  // const [showAddMedication, setShowAddMedication] = useState(false);
  // const [showEditMedication, setShowEditMedication] = useState(false);
  // const [editMedication, setEditMedication] = useState<EditMedication | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  // Debug logging
  console.log("Component mounted/re-rendered");
  console.log("Auth status:", authStatus);
  console.log("Session ID from params:", sessionId);
  console.log("Params object:", params);
  console.log("Current loading state:", loading);
  console.log("Current error state:", error);
  console.log("Current session state:", session);

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

  const fetchSessionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log("Fetching session details for ID:", sessionId);
      
      const response = await fetch(`/api/therapist/sessions/${sessionId}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Session data received:", data);
        setSession(data.session);
      } else {
        const errorData = await response.text();
        console.error("Failed to fetch session details:", response.status, errorData);
        setError(`Failed to fetch session details: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      setError(`An error occurred while fetching session details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Add function to fetch medications
  const fetchMedications = useCallback(async (patientId: string) => {
    try {
      setIsLoadingMedications(true);
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
        setMedications([]);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
      setMedications([]);
    } finally {
      setIsLoadingMedications(false);
    }
  }, []);

  useEffect(() => {
    console.log("useEffect triggered with sessionId:", sessionId, "auth status:", authStatus);
    
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && sessionId && sessionId !== 'undefined') {
      fetchSessionDetails();
    } else if (authStatus === "authenticated") {
      console.error("Session ID is missing or invalid:", sessionId);
      setError("Session ID is missing");
      setLoading(false);
    }
    // If still loading auth, don't do anything yet
  }, [sessionId, authStatus, fetchSessionDetails, router]);

  // Fetch medications when session is loaded
  useEffect(() => {
    if (session?.patientId) {
      fetchMedications(session.patientId);
    }
  }, [session?.patientId, fetchMedications]);

  const handleSessionUpdated = () => {
    // Refresh the session details after update
    fetchSessionDetails();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-gray-100 text-gray-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const availableTasks = [
    {
      id: "a1",
      type: "Listening Task",
      typeColor: "bg-blue-100 text-blue-700",
      title: "Auditory Processing - Listening Task",
      description: "Audio-based assessment to evaluate listening comprehension, auditory memory, and processing speed through various listening exercises.",
      assignedCount: 2,
    },
    {
      id: "a2",
      type: "Picture Description",
      typeColor: "bg-green-100 text-green-700",
      title: "Visual Perception - Picture Description",
      description: "Assessment involving detailed description of complex images to evaluate visual processing, attention to detail, and verbal expression skills.",
      assignedCount: 3,
    },
    {
      id: "a3",
      type: "Find Differences",
      typeColor: "bg-orange-100 text-orange-700",
      title: "Attention & Focus - Find the Differences",
      description: "Visual attention task requiring patients to identify differences between similar images to assess concentration and visual attention skills.",
      assignedCount: 2,
      latestScore: "91%",
    },
  ];

  useEffect(() => {
    const openMedicationsModal = () => setShowMedications(true);
    const openTasksModal = () => setShowTasks(true);

    window.addEventListener("openMedicationsModal", openMedicationsModal);
    window.addEventListener("openTasksModal", openTasksModal);

    return () => {
      window.removeEventListener("openMedicationsModal", openMedicationsModal);
      window.removeEventListener("openTasksModal", openTasksModal);
    };
  }, []);

  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/40 animate-ping"></div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {authStatus === "loading" ? "Authenticating..." : "Loading session details..."}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {authStatus === "loading" ? "Please wait while we verify your credentials." : "Please wait while we fetch the detailed information."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600">Please log in to access this page</p>
            <Button 
              onClick={() => router.push("/login")} 
              className="mt-4"
              variant="outline"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600">{error || "Session not found"}</p>
            <Button 
              onClick={() => router.back()} 
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="hover:bg-primary/10 border-primary/20 text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
          </div>
          
          <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-[#8159A8] bg-clip-text text-transparent">
          Session Details
        </h1>
        
        <div className="flex gap-3">
            <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsUpdateModalOpen(true)}
            className="hover:bg-purple-50 border-purple-200 bg-purple-25"
            >
            <Edit className="w-4 h-4 mr-2" />
            Edit
            </Button>
            <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/therapist/patients/${session.patientId}`)}
            className="hover:bg-purple-50 border-purple-200 bg-purple-25"
            >
            <User className="w-4 h-4 mr-2" />
            View Profile
            </Button>
        </div>
          </div>
          
          {/* Session Details - Full Width */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border border-primary/10 w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="bg-[#FAF8FB] rounded-full p-1 flex items-center justify-center">
            <User className="w-4 h-4 text-[#8159A8]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Patient</p>
            <p className="text-base font-semibold text-foreground capitalize truncate">{session.patientName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="bg-[#FAF8FB] rounded-full p-1 flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#8159A8]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Type</p>
            <p className="text-base font-semibold text-foreground capitalize truncate">{session.type}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="bg-[#FAF8FB] rounded-full p-1 flex items-center justify-center">
            <Clock3 className="w-4 h-4 text-[#8159A8]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Duration</p>
            <p className="text-base font-semibold text-foreground">{session.duration} min</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="bg-[#FAF8FB] rounded-full p-1 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#8159A8]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Date</p>
            <p className="text-base font-semibold text-foreground truncate">
          {formatDate(session.scheduledAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="bg-[#FAF8FB] rounded-full p-1 flex items-center justify-center">
            <Clock3 className="w-4 h-4 text-[#8159A8]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Time</p>
            <p className="text-base font-semibold text-foreground">
          {formatTimeManual(session.scheduledAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center flex-shrink-0">
          <Badge className={`${getStatusColor(session.status)} px-4 py-2 text-sm font-medium shadow-sm whitespace-nowrap`}>
            {session.status.replace('_', ' ')}
          </Badge>
        </div>
          </div>
        </div>

        {/* Clinical Documentation Section (always visible) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clinical Assessment */}
          <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-3 text-xl">
            Clinical Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
          <p className="text-sm font-medium text-muted-foreground">Attendance Status</p>
          <Badge className={`${
            session.attendanceStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
            session.attendanceStatus === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
            session.attendanceStatus === 'NO_SHOW' ? 'bg-red-100 text-red-800' :
            session.attendanceStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
            'bg-gray-100 text-gray-600'
          } text-xs`}>
            {session.attendanceStatus || 'Not Documented'}
          </Badge>
            </div>
            <div>
          <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
          <Badge className={`${
            session.overallProgress === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
            session.overallProgress === 'GOOD' ? 'bg-blue-100 text-blue-800' :
            session.overallProgress === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
            session.overallProgress === 'POOR' ? 'bg-orange-100 text-orange-800' :
            session.overallProgress === 'CONCERNING' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-600'
          } text-xs`}>
            {session.overallProgress || 'Not Assessed'}
          </Badge>
            </div>
            <div>
          <p className="text-sm font-medium text-muted-foreground">Patient Engagement</p>
          <Badge className={`${
            session.patientEngagement === 'HIGH' ? 'bg-green-100 text-green-800' :
            session.patientEngagement === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
            session.patientEngagement === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
            session.patientEngagement === 'RESISTANT' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-600'
          } text-xs`}>
            {session.patientEngagement || 'Not Assessed'}
          </Badge>
            </div>
            <div>
          <p className="text-sm font-medium text-muted-foreground">Risk Assessment</p>
          <Badge className={`${
            session.riskAssessment === 'HIGH' ? 'bg-red-100 text-red-800' :
            session.riskAssessment === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
            session.riskAssessment === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
            session.riskAssessment === 'NONE' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-600'
          } text-xs`}>
            {session.riskAssessment || 'Not Assessed'}
          </Badge>
            </div>
          </div>
          
          {/* Focus Areas */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Primary Focus Areas</p>
            {session.primaryFocusAreas && session.primaryFocusAreas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {session.primaryFocusAreas.map((area, index) => (
              <Badge key={index} variant="outline" className="text-xs">
            {area}
              </Badge>
            ))}
          </div>
            ) : (
          <p className="text-sm text-muted-foreground">No focus areas documented</p>
            )}
          </div>
        </CardContent>
          </Card>

          {/* Session Notes */}
          <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-3 text-xl">
            Session Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Clinical Observations</p>
            {session.sessionNotes ? (
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{session.sessionNotes}</p>
          </div>
            ) : (
          <p className="text-sm text-muted-foreground">No clinical observations recorded</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Next Session Goals</p>
            {session.nextSessionGoals ? (
          <div className="bg-blue-50 rounded-md p-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{session.nextSessionGoals}</p>
          </div>
            ) : (
          <p className="text-sm text-muted-foreground">No goals set for next session</p>
            )}
          </div>
          
          
        </CardContent>
          </Card>
        </div>
        {/* Medications and Tasks Buttons */}
        <div className="flex gap-4 justify-end mt-8">
          <Button 
        style={{ backgroundColor: "#8159A8", color: "#fff", border: "none" }}
        className="hover:brightness-110 shadow-md font-semibold px-6 py-2 rounded-lg transition-all duration-150"
        onClick={() => setShowMedications(true)}
          >
        View Medications
          </Button>
          <Button 
        style={{ backgroundColor: "#8159A8", color: "#fff", border: "none" }}
        className="hover:brightness-110 shadow-md font-semibold px-6 py-2 rounded-lg transition-all duration-150"
        onClick={() => setShowTasks(true)}
          >
        View Assigned Assessments
          </Button>
        </div>
      </div>

      {/* Updated Medications Modal with MedicationManagement component */}
      <Dialog open={showMedications} onOpenChange={setShowMedications}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
            {isLoadingMedications ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8159A8]"></div>
                <span className="ml-2">Loading medications...</span>
              </div>
            ) : session?.patientId ? (
              <MedicationManagement 
                patientId={session.patientId}
                medications={medications}
                onMedicationUpdate={() => fetchMedications(session.patientId)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tasks Modal */}
      <Dialog open={showTasks} onOpenChange={setShowTasks}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assessment Updates for This Patient</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between mb-4">
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm">
                {hardcodedTasks.filter(t => t.status === "Pending").length} Pending
              </Badge>
              <Badge variant="outline" className="text-sm bg-green-50 text-green-700">
                {hardcodedTasks.filter(t => t.status === "Completed").length} Completed
              </Badge>
            </div>
            <Button
              style={{ backgroundColor: "#8159A8", color: "#fff" }}
              className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow hover:brightness-110"
              onClick={() => setShowAssignTask(true)}
            >
              <Plus className="w-5 h-5" />
              Assign a new Assessment
            </Button>
          </div>
          <div className="space-y-6">
            {hardcodedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks assigned.</p>
                </CardContent>
              </Card>
            ) : (
              hardcodedTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#fcfafd] rounded-xl shadow-sm px-6 py-4"
                  style={{ borderBottom: idx !== hardcodedTasks.length - 1 ? "1px solid #f0eef5" : undefined }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base md:text-xl font-semibold text-[#8159A8]">{task.title}</span>
                      {task.status === "Completed" && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                      {task.status === "Pending" && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                      {"score" in task && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Score: {task.score}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-black font-medium">
                      Assigned: {format(new Date(task.assignedDate), "MMM dd, yyyy")}
                      {task.completedDate && (
                      <span className="ml-3">
                        Completed: {format(new Date(task.completedDate), "MMM dd, yyyy")}
                      </span>
                      )}
                      <span className="ml-3">
                      Deadline: {format(new Date(task.deadline), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <Button
                      variant="outline"
                      className="border-red-400 text-red-700 hover:bg-red-50 px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: "#EF4444" }}
                    >
                      Unassign
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

     {/* Assign Task Modal */}
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

      {/* Session Update Modal */}
      <SessionUpdateModal
        session={session}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSessionUpdated={handleSessionUpdated}
      />
    </div>
  );
}
