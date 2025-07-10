"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  Pill, 
  CheckSquare, 
  Target, 
  TrendingUp, 
  ArrowLeft,
  Phone,
  Mail,
  Heart,
  Brain,
  Activity,
  Download,
  FileImage,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3
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
  const [activeTab, setActiveTab] = useState("overview");
  
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
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
              Back to Sessions
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sessions</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-medium">Session Details</span>
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-3">
                Session Details
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground flex items-center gap-2 text-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  {session.patientName}
                </p>
                <Badge className={`${getStatusColor(session.status)} px-4 py-2 text-sm font-medium shadow-sm`}>
                  {session.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => router.push(`/therapist/patients/${session.patientId}`)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                View Patient Profile
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-muted border-border">
                <Download className="w-4 h-4 mr-2" />
                Export Session
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-muted border-border">
                <FileImage className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background shadow-md rounded-lg p-1 mb-8">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            Session Details
          </TabsTrigger>
          <TabsTrigger value="treatments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            Medications
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            Session Notes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Session Details Only */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session Information */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg border-0 bg-gradient-to-r from-background to-primary/5">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    Session Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Patient</p>
                      <p className="text-sm font-medium text-primary">{session.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Session Status</p>
                      <Badge className={`${getStatusColor(session.status)} text-xs`}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date</p>
                      <p className="text-sm">
                        {format(new Date(session.scheduledAt), "EEEE, MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time</p>
                      <p className="text-sm">
                        {format(new Date(session.scheduledAt), "hh:mm a")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm">{session.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-sm capitalize">{session.type}</p>
                    </div>
                  </div>
                  
                  {session.location && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </p>
                      <p className="text-sm">{session.location}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Objectives */}
              {session.objectives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Session Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {session.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Progress Tracking Sidebar */}
            <div className="space-y-6">
              {/* Mood & Engagement */}
              {(session.patientMood || session.engagement) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Session Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {session.patientMood && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium">Patient Mood</p>
                          <span className="text-sm font-medium">{session.patientMood}/10</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(session.patientMood / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {session.engagement && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium">Engagement Level</p>
                          <span className="text-sm font-medium">{session.engagement}/10</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(session.engagement / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Session Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Medications Updated</span>
                    <span className="text-sm font-medium">
                      {session.patient.treatments.filter(t => t.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasks Assigned</span>
                    <span className="text-sm font-medium">
                      {session.patient.tasks.filter(task => task.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasks Completed</span>
                    <span className="text-sm font-medium">
                      {session.patient.tasks.filter(task => task.status === 'COMPLETED').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
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

        {/* Session Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="space-y-6">
            {/* Session Notes */}
            {session.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Session Notes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Detailed notes from this session</p>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{session.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Notes */}
            {session.progressNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Progress Notes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Patient progress and observations</p>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{session.progressNotes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* If no notes available */}
            {!session.notes && !session.progressNotes && (                <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No session notes recorded</p>
                  <p className="text-sm text-muted-foreground">Session notes and progress observations will appear here</p>
                </CardContent>
              </Card>
            )}

            {/* Session Objectives (if available) */}
            {session.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Session Objectives Review
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Goals set for this session</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm leading-relaxed">{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
