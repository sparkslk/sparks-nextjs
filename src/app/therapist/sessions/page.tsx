"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, FileText, Edit, Eye, CheckCircle, Plus, Activity, RotateCcw, X, Video, ArrowRight } from "lucide-react";
import { SessionUpdateModal } from "@/components/therapist/SessionUpdateModal";
import { RescheduleModal } from "@/components/therapist/RescheduleModal";
import { Dialog } from "@/components/ui/dialog";

interface Session {
  id: string;
  patientName: string;
  patientId: string;
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
}

export default function TherapistSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("scheduled");
  const [showMedications, setShowMedications] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  // Hardcoded data for medications and tasks
  const hardcodedMedications = [
    {
      id: "1",
      name: "Methylphenidate",
      dosage: "7",
      frequency: "Twice daily",
      mealTiming: "Before meals",
      startDate: "2025-07-07",
      endDate: "2025-07-12",
      prescribedBy: "Ravindi Fernando",
      instructions: "Take with a full glass of water. Do not exceed recommended dose.",
      isActive: true,
    },
    {
      id: "2",
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      mealTiming: "After meals",
      startDate: "2025-07-01",
      endDate: "2025-07-10",
      prescribedBy: "Dr. Nimal Perera",
      instructions: "Complete the full course even if you feel better.",
      isActive: true,
    }
  ];

  const hardcodedTasks = [
    {
      id: "1",
      title: "Auditory Processing - Listening Task",
      assignedDate: "2024-07-10",
      completedDate: "2024-07-22",
      status: "Completed",
      score: 78,
    },
    {
      id: "2",
      title: "Visual Perception - Picture Description",
      assignedDate: "2024-07-08",
      status: "Pending",
    }
  ];

  // Helper function to safely parse and format dates (similar to parent tasks page)
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/therapist/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        console.error("Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
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

  const filterSessionsByTab = (tab: string) => {
    switch (tab) {
      case 'scheduled':
        return sessions.filter(session => 
          ['SCHEDULED', 'APPROVED', 'CONFIRMED'].includes(session.status)
        );
      case 'completed':
        return sessions.filter(session => 
          session.status === 'COMPLETED'
        );
      case 'cancelled':
        return sessions.filter(session => 
          ['CANCELLED', 'DECLINED', 'NO_SHOW'].includes(session.status)
        );
      case 'all':
        return sessions;
      default:
        return sessions;
    }
  };

  const isSessionPast = (session: Session) => {
    // Parse the session time but treat it as local time instead of UTC
    const sessionTimeString = session.scheduledAt;
    
    // If the time has 'Z' or timezone info, we need to handle it carefully
    let sessionTime;
    if (sessionTimeString.includes('T') && sessionTimeString.includes('Z')) {
      // Remove the 'Z' and treat as local time
      const localTimeString = sessionTimeString.replace('Z', '');
      sessionTime = new Date(localTimeString);
    } else {
      sessionTime = new Date(sessionTimeString);
    }
    
    const now = new Date();
    
    return sessionTime <= now;
  };

  const isSessionOngoing = (session: Session) => {
    // Parse the session time but treat it as local time instead of UTC
    const sessionTimeString = session.scheduledAt;
    
    let sessionTime;
    if (sessionTimeString.includes('T') && sessionTimeString.includes('Z')) {
      const localTimeString = sessionTimeString.replace('Z', '');
      sessionTime = new Date(localTimeString);
    } else {
      sessionTime = new Date(sessionTimeString);
    }
    
    const now = new Date();
    const sessionEndTime = new Date(sessionTime.getTime() + (session.duration * 60 * 1000)); // Add duration in milliseconds
    
    // Session is ongoing if current time is between start and end time
    return sessionTime <= now && now <= sessionEndTime;
  };

  const isSessionCompleted = (session: Session) => {
    // Parse the session time but treat it as local time instead of UTC
    const sessionTimeString = session.scheduledAt;
    
    let sessionTime;
    if (sessionTimeString.includes('T') && sessionTimeString.includes('Z')) {
      const localTimeString = sessionTimeString.replace('Z', '');
      sessionTime = new Date(localTimeString);
    } else {
      sessionTime = new Date(sessionTimeString);
    }
    
    const now = new Date();
    const sessionEndTime = new Date(sessionTime.getTime() + (session.duration * 60 * 1000)); // Add duration in milliseconds
    
    // Session is completed if current time is past the end time
    return now > sessionEndTime;
  };

  const handleViewDetails = (session: Session) => {
    window.location.href = `/therapist/sessions/${session.id}`;
  };

  const handleUpdateSession = (session: Session) => {
    setSelectedSession(session);
    setIsUpdateModalOpen(true);
  };

  const handleSessionUpdated = () => {
    fetchSessions();
    setIsUpdateModalOpen(false);
    setSelectedSession(null);
  };

  const handleRescheduleSession = (session: Session) => {
    setSelectedSession(session);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleConfirmed = () => {
    fetchSessions();
    setIsRescheduleModalOpen(false);
    setSelectedSession(null);
  };

  

  const handleJoinSession = (session: Session) => {
    // For now, just show an alert - will implement video call functionality later
    alert(`Joining session with ${session.patientName}...`);
  };

  const handleMoveToCompleted = (session: Session) => {
    // For now, just show an alert - will implement move to completed functionality later
    if (confirm(`Mark session with ${session.patientName} as completed?`)) {
      alert(`Session with ${session.patientName} has been marked as completed`);
    }
  };

  const SessionCard = ({ session }: { session: Session }) => {
    const isPast = isSessionPast(session);
    const isOngoing = isSessionOngoing(session);
    const isCompleted = isSessionCompleted(session);
    const needsDocumentation = isCompleted && ['SCHEDULED', 'APPROVED', 'CONFIRMED'].includes(session.status);
    const isFutureSession = !isPast;
    const isScheduledStatus = ['SCHEDULED', 'APPROVED', 'CONFIRMED'].includes(session.status);
    
    // Determine card styling based on session state
    let cardStyling = 'border-gray-100 bg-primary-foreground'; // Default for future sessions
    if (isOngoing) {
      cardStyling = 'border-green-200 bg-green-50/30'; // Green for ongoing sessions
    } else if (needsDocumentation) {
      cardStyling = 'border-orange-200 bg-orange-50/30'; // Orange for sessions needing documentation
    }
    
    return (
      <Card className={`shadow-sm hover:shadow-md transition-all duration-300 border ${cardStyling} dark:bg-slate-950`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" 
                   style={{ background: 'linear-gradient(to bottom right, #8159A8, #6b46a0)' }}>
                {session.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">{session.patientName}</CardTitle>
                <p className="text-sm text-gray-500">Patient ID: {session.patientId}</p>
                {isOngoing && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-green-700 font-medium">Session in progress</p>
                  </div>
                )}
                {needsDocumentation && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-orange-700 font-medium">Session completed - Documentation required</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getStatusColor(session.status)} font-medium`}>
                {session.status.replace('_', ' ')}
              </Badge>
              {isOngoing && (
                <Badge className="bg-green-100 text-green-800 font-medium text-xs">
                  In Progress
                </Badge>
              )}
              {needsDocumentation && (
                <Badge className="bg-orange-100 text-orange-800 font-medium text-xs">
                  Needs Documentation
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">{formatDate(session.scheduledAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium">{formatTimeManual(session.scheduledAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium capitalize">{session.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">{session.duration} min</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <div className="flex flex-wrap gap-2">
              {/* Future Sessions: Show Reschedule and Cancel buttons */}
              {isFutureSession && isScheduledStatus && (
                <>
                  <Button
                    onClick={() => handleRescheduleSession(session)}
                    variant="outline"
                    className="text-sm border-black-300 text-black-700 hover:bg-purple-50"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                </>
              )}

              {/* Ongoing Sessions: Show Join Session, Move to Completed, and Document buttons */}
              {isOngoing && isScheduledStatus && (
                <>
                  
                  
                  <Button
                    onClick={() => handleMoveToCompleted(session)}
                    variant="outline"
                    className="text-sm border-green-300 text-green-700 hover:bg-green-50"
                    size="sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Move to Completed
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateSession(session)}
                    className="text-purple-700 hover:opacity-90 text-sm"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Document Session
                  </Button>
                  <Button
                    onClick={() => handleJoinSession(session)}
                    style={{ backgroundColor: '#8159A8' }}
                    className="text-white hover:opacity-90 text-sm"
                    size="sm"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                  
                </>
              )}

              {/* Completed Sessions (not yet documented): Show Move to Completed and Document buttons */}
              {isCompleted && isScheduledStatus && (
                <>
                  <Button
                    onClick={() => handleMoveToCompleted(session)}
                    variant="outline"
                    className="text-sm border-green-300 text-green-700 hover:bg-green-50"
                    size="sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Move to Completed
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateSession(session)}
                    className="text-purple-700 hover:opacity-90 text-sm"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Document Session
                  </Button>
                </>
              )}

              {!isScheduledStatus &&
                !['CANCELLED', 'DECLINED', 'NO_SHOW'].includes(session.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(session)}
                    className="text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto"></div>
              <h3 className="mt-4 text-lg font-medium text-foreground">Loading sessions...</h3>
              <p className="mt-2 text-muted-foreground">Please wait while we fetch your therapy sessions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Session Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your therapy sessions and track patient progress
              </p>
            </div>
            
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Next Upcoming Session */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Next Session</p>
                  {filterSessionsByTab("scheduled").length > 0 ? (
                    <>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {(() => {
                          const nextSession = filterSessionsByTab("scheduled")
                            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
                          return formatDateTime(nextSession.scheduledAt);
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const nextSession = filterSessionsByTab("scheduled")
                            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
                          return nextSession.patientName;
                        })()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-gray-900 mt-1">No sessions</p>
                      <p className="text-xs text-gray-500 mt-1">scheduled</p>
                    </>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  <Calendar 
                    className="h-12 w-12 transition-all duration-300"
                    style={{ color: '#8159A8' }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Sessions */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {filterSessionsByTab("completed").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This month: {filterSessionsByTab("completed").filter(s => {
                      const sessionDate = new Date(s.scheduledAt);
                      const thisMonth = new Date();
                      return sessionDate.getMonth() === thisMonth.getMonth() && 
                             sessionDate.getFullYear() === thisMonth.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <CheckCircle 
                    className="h-12 w-12 transition-all duration-300"
                    style={{ color: '#8159A8' }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Patients */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(sessions.map(s => s.patientId)).size}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Unique patients served</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <User 
                    className="h-12 w-12 transition-all duration-300"
                    style={{ color: '#8159A8' }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="scheduled">
              Scheduled ({filterSessionsByTab("scheduled").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterSessionsByTab("completed").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({filterSessionsByTab("cancelled").length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Sessions ({sessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled">
            <div className="space-y-6">
              {filterSessionsByTab("scheduled").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled sessions</h3>
                    <p className="text-gray-500 mb-6">Your scheduled therapy sessions will appear here.</p>
                    <Button 
                      style={{ backgroundColor: '#8159A8' }}
                      className="text-white hover:opacity-90"
                      onClick={() => window.location.href = '/therapist/appointments/new'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Your First Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filterSessionsByTab("scheduled")
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-6">
              {filterSessionsByTab("completed").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed sessions yet</h3>
                    <p className="text-gray-500">Completed sessions will appear here after you finish and document them.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filterSessionsByTab("completed")
                    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                    .map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="space-y-6">
              {filterSessionsByTab("cancelled").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled sessions</h3>
                    <p className="text-gray-500">Great! You haven&apos;t had any cancelled sessions.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filterSessionsByTab("cancelled")
                    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                    .map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-6">
              {sessions.length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                    <p className="text-gray-500 mb-6">Start by scheduling your first therapy session.</p>
                    <Button 
                      style={{ backgroundColor: '#8159A8' }}
                      className="text-white hover:opacity-90"
                      onClick={() => window.location.href = '/therapist/appointments/new'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Your First Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {sessions
                    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                    .map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Session Update Modal */}
        <SessionUpdateModal
          session={selectedSession}
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedSession(null);
          }}
          onSessionUpdated={handleSessionUpdated}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          session={selectedSession}
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setSelectedSession(null);
          }}
          onRescheduleConfirmed={handleRescheduleConfirmed}
        />

        <Dialog open={showMedications} onOpenChange={setShowMedications}>
          {/* ...same content as in [id]/page.tsx... */}
        </Dialog>

        <Dialog open={showTasks} onOpenChange={setShowTasks}>
          {/* ...same content as in [id]/page.tsx... */}
        </Dialog>
      </div>
    </div>
  );
}
