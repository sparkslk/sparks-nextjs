"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SessionUpdateModal } from "@/components/therapist/SessionUpdateModal";
import { 
  Calendar,  
  User, 
  FileText, 
  Pill, 
  CheckSquare, 
  ArrowLeft,
  Phone,
  Mail,
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  Edit
} from "lucide-react";
import { format, differenceInYears } from "date-fns";

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
    treatments: Treatment[];
    assessments: Assessment[];
    treatmentPlans: TreatmentPlan[];
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

interface Treatment {
  id: string;
  name: string;
  description: string;
  instructions?: string;
  frequency?: string;
  dosage?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  treatmentPlan: {
    title: string;
    description: string;
  };
}

interface Assessment {
  id: string;
  type: string;
  title: string;
  description?: string;
  score?: number;
  interpretation?: string;
  recommendations?: string;
  assessmentDate: string;
}

interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  goals: string[];
  startDate: string;
  targetEndDate?: string;
  isActive: boolean;
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

export default function SessionDetailsPage() {
  const [session, setSession] = useState<DetailedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("clinical");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

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
      const response = await fetch(`/api/therapist/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      } else {
        setError("Failed to fetch session details");
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      setError("An error occurred while fetching session details");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId, fetchSessionDetails]);

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

  const getTaskStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock3 className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return 'bg-red-100 text-red-800';
      case 4:
        return 'bg-orange-100 text-orange-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/40 animate-ping"></div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Loading session details...</h3>
              <p className="mt-2 text-muted-foreground">Please wait while we fetch the detailed information.</p>
            </div>
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
            {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sessions</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-medium">Session Details</span>
            </div> */}
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
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
                {/* <Button variant="outline" size="sm" className="hover:bg-purple-50 border-purple-200 bg-purple-25">
                <Download className="w-4 h-4 mr-2" />
                Export Session
                </Button> */}
            </div>
          </div>
          
          {/* Session Details - Full Width */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10 w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Patient</p>
                <p className="text-base font-semibold text-foreground capitalize truncate">{session.patientName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="text-base font-semibold text-foreground capitalize truncate">{session.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock3 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Duration</p>
                <p className="text-base font-semibold text-foreground">{session.duration} min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="text-base font-semibold text-foreground truncate">
                  {formatDate(session.scheduledAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock3 className="w-4 h-4 text-purple-600 flex-shrink-0" />
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


      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clinical">
            Clinical Documentation
          </TabsTrigger>
          <TabsTrigger value="treatments">
            Medications
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
          </TabsTrigger>
        </TabsList>

        {/* Clinical Documentation Tab */}
        <TabsContent value="clinical" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clinical Assessment */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-xl">
                  {/* <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div> */}
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
                  {/* <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div> */}
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
                
                {/* Action Button */}
                <div className="pt-4 border-t border-border">
                  <Button 
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Clinical Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patient Info Tab */}
        <TabsContent value="patient" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-sm">{session.patient.firstName} {session.patient.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-sm">{calculateAge(session.patient.dateOfBirth)} years old</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                    <p className="text-sm">
                      {format(new Date(session.patient.dateOfBirth), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gender</p>
                    <p className="text-sm capitalize">{session.patient.gender.toLowerCase()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {session.patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{session.patient.phone}</p>
                      </div>
                    </div>
                  )}
                  {session.patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{session.patient.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {session.patient.medicalHistory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm whitespace-pre-wrap">{session.patient.medicalHistory}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Medications Tab - Session-Related Changes */}
        <TabsContent value="treatments" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Medication Updates for This Session</h3>
              <Badge variant="outline" className="text-sm">
                {session.patient.treatments.filter(t => t.isActive).length} Active
              </Badge>
            </div>
            
            {session.patient.treatments.length === 0 ? (                <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No medications on record.</p>
                </CardContent>
              </Card>
            ) : (
              session.patient.treatments.map((treatment) => (
                <Card key={treatment.id} className={treatment.isActive ? "border-l-4 border-l-green-500" : "border-l-4 border-l-gray-300"}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        {treatment.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={treatment.isActive ? "default" : "secondary"}>
                          {treatment.isActive ? "Active" : "Discontinued"}
                        </Badge>
                        {new Date(treatment.startDate) >= new Date(session.scheduledAt) && (
                          <Badge className="bg-primary/10 text-primary">
                            New in Session
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{treatment.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {treatment.dosage && (
                        <div>
                          <p className="font-medium text-muted-foreground">Dosage</p>
                          <p className="font-medium text-primary">{treatment.dosage}</p>
                        </div>
                      )}
                      {treatment.frequency && (
                        <div>
                          <p className="font-medium text-muted-foreground">Frequency</p>
                          <p className="font-medium text-primary capitalize">{treatment.frequency}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-muted-foreground">Start Date</p>
                        <p className={`font-medium ${new Date(treatment.startDate) >= new Date(session.scheduledAt) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {format(new Date(treatment.startDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {treatment.endDate && (
                        <div>
                          <p className="font-medium text-muted-foreground">End Date</p>
                          <p className="font-medium text-red-600">{format(new Date(treatment.endDate), "MMM dd, yyyy")}</p>
                        </div>
                      )}
                    </div>

                    {treatment.instructions && (
                      <div className="bg-primary/5 p-3 rounded">
                        <p className="text-sm font-medium text-primary">Special Instructions</p>
                        <p className="text-sm text-muted-foreground">{treatment.instructions}</p>
                      </div>
                    )}

                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm font-medium text-foreground">Treatment Plan</p>
                      <p className="text-sm text-muted-foreground">{treatment.treatmentPlan.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{treatment.treatmentPlan.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tasks Tab - Session-Related Changes */}
        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Task Updates for This Session</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-sm">
                  {session.patient.tasks.filter(task => task.status === 'PENDING').length} Pending
                </Badge>
                <Badge variant="outline" className="text-sm bg-green-50 text-green-700">
                  {session.patient.tasks.filter(task => task.status === 'COMPLETED').length} Completed
                </Badge>
              </div>
            </div>
            
            {session.patient.tasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks assigned.</p>
                </CardContent>
              </Card>
            ) : (
              session.patient.tasks.map((task) => (
                <Card key={task.id} className={`${
                  task.status === 'COMPLETED' ? 'border-l-4 border-l-green-500 bg-green-50/30' :
                  task.status === 'OVERDUE' ? 'border-l-4 border-l-red-500 bg-red-50/30' :
                  'border-l-4 border-l-blue-500'
                }`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        {getTaskStatusIcon(task.status)}
                        {task.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          Priority {task.priority}
                        </Badge>
                        <Badge variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {new Date(task.createdAt) >= new Date(session.scheduledAt) && (
                          <Badge className="bg-primary/10 text-primary">
                            Assigned in Session
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {task.dueDate && (
                        <div>
                          <p className="font-medium text-muted-foreground">Due Date</p>
                          <p className={`font-medium ${
                            new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-foreground'
                          }`}>
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-muted-foreground">Assigned</p>
                        <p className={`font-medium ${
                          new Date(task.createdAt) >= new Date(session.scheduledAt) ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {format(new Date(task.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {task.completedAt && (
                        <div>
                          <p className="font-medium text-muted-foreground">Completed</p>
                          <p className="font-medium text-green-600">
                            {format(new Date(task.completedAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>

                    {task.instructions && (
                      <div className="bg-primary/5 p-3 rounded">
                        <p className="text-sm font-medium text-primary">Instructions</p>
                        <p className="text-sm text-muted-foreground">{task.instructions}</p>
                      </div>
                    )}

                    {task.completionNotes && (
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm font-medium text-green-900">Completion Notes</p>
                        <p className="text-sm text-green-800">{task.completionNotes}</p>
                      </div>
                    )}

                    {task.isRecurring && (
                      <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-2 rounded">
                        <Clock3 className="w-4 h-4" />
                        <span>Recurring task - {task.recurringPattern}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

      </Tabs>
      </div>
      
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
