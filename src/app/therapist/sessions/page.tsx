"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, FileText, Edit, Eye, CheckCircle, Plus, Hourglass , RotateCcw, Video, Search, Filter, X } from "lucide-react";
import { SessionUpdateModal } from "@/components/therapist/SessionUpdateModal";
import { RescheduleModal } from "@/components/therapist/RescheduleModal";
import MedicationManagement from "@/components/therapist/MedicationManagement";
import { Dialog, DialogContent} from "@/components/ui/dialog";
import { Medication } from "@/types/medications";

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
  
  // Add filter state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Add medication management state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationPatientId, setMedicationPatientId] = useState<string | null>(null);
  const [isLoadingMedications, setIsLoadingMedications] = useState(false);

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
        console.log("Fetched sessions data:", data); // Debug log
        console.log("First session:", data.sessions?.[0]); // Debug log
        setSessions(data.sessions || []);
      } else {
        console.error("Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch medications
  const fetchMedications = async (patientId: string) => {
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
  };

  // Add handler for opening medications modal with patient context
  const handleOpenMedicationsModal = useCallback((patientId: string) => {
    setMedicationPatientId(patientId);
    setMedications([]); // Clear previous medications immediately
    setShowMedications(true);
    fetchMedications(patientId); // Then fetch new ones
  }, []);

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
    let filteredSessions;
    switch (tab) {
      case 'scheduled':
        filteredSessions = sessions.filter(session => 
          ['SCHEDULED', 'APPROVED', 'CONFIRMED'].includes(session.status)
        );
        break;
      case 'completed':
        filteredSessions = sessions.filter(session => 
          session.status === 'COMPLETED'
        );
        break;
      case 'cancelled':
        filteredSessions = sessions.filter(session => 
          ['CANCELLED', 'DECLINED'].includes(session.status)
        );
        break;
      case 'no-show':
        filteredSessions = sessions.filter(session => 
          session.status === 'NO_SHOW'
        );
        break;
      case 'all':
        filteredSessions = sessions;
        break;
      default:
        filteredSessions = sessions;
    }

    // Apply search filter
    if (searchTerm) {
      filteredSessions = filteredSessions.filter(session =>
        (session.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (session.patientId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateFrom) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.scheduledAt).toISOString().split('T')[0];
        return sessionDate >= dateFrom;
      });
    }
    if (dateTo) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.scheduledAt).toISOString().split('T')[0];
        return sessionDate <= dateTo;
      });
    }

    // Apply type filter
    if (selectedType && selectedType !== "all") {
      filteredSessions = filteredSessions.filter(session =>
        session.type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    return filteredSessions;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setSelectedType("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || dateFrom || dateTo || (selectedType && selectedType !== "all");

  // Get unique session types for filter dropdown
  const sessionTypes = [...new Set(sessions.map(session => session.type).filter(type => type != null))];

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

  

  const SessionCard = ({ session }: { session: Session }) => {
    // Add debug logging for session data
    console.log("Session data in card:", session);
    
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
                <p className="text-sm text-gray-500">
                  Patient ID: {session.patientId || 'Not available'}
                </p>
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
              <Hourglass  className="w-6 h-6 text-primary" />
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

              {/* Ongoing Sessions: Show Join Session, and Document buttons */}
              {isOngoing && isScheduledStatus && (
                <>
                                    
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

              {/* Completed Sessions (not yet documented): Show and Document buttons */}
              {isCompleted && isScheduledStatus && (
                <>
                  
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
    const openMedicationsModal = (event: CustomEvent) => {
      const patientId = event.detail?.patientId || medicationPatientId;
      if (patientId) {
        handleOpenMedicationsModal(patientId);
      }
    };
    const openTasksModal = () => setShowTasks(true);

    window.addEventListener("openMedicationsModal", openMedicationsModal as EventListener);
    window.addEventListener("openTasksModal", openTasksModal);

    return () => {
      window.removeEventListener("openMedicationsModal", openMedicationsModal as EventListener);
      window.removeEventListener("openTasksModal", openTasksModal);
    };
  }, [medicationPatientId, handleOpenMedicationsModal]);

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
                <h1 className="text-3xl font-bold text-primary dark:text-primary">Session Management</h1>
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="scheduled">
              Scheduled ({filterSessionsByTab("scheduled").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterSessionsByTab("completed").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({filterSessionsByTab("cancelled").length})
            </TabsTrigger>
            <TabsTrigger value="no-show">
              No-Show ({filterSessionsByTab("no-show").length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Sessions ({filterSessionsByTab("all").length})
            </TabsTrigger>
          </TabsList>

          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {[searchTerm, dateFrom, dateTo, selectedType].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Showing {filterSessionsByTab(activeTab).length} of {sessions.length} sessions
              </div>
            </div>

            {showFilters && (
              <Card className="p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Patient name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Date From Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">From Date</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>

                  {/* Date To Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">To Date</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>

                  {/* Session Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Session Type</label>
                    <Select value={selectedType || "all"} onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <TabsContent value="scheduled">
            <div className="space-y-6">
              {filterSessionsByTab("scheduled").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {hasActiveFilters ? "No sessions match your filters" : "No scheduled sessions"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {hasActiveFilters 
                        ? "Try adjusting your search criteria or clearing the filters." 
                        : "Your scheduled therapy sessions will appear here."
                      }
                    </p>
                    {!hasActiveFilters && (
                      <Button 
                        style={{ backgroundColor: '#8159A8' }}
                        className="text-white hover:opacity-90"
                        onClick={() => window.location.href = '/therapist/appointments/new'}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Your First Session
                      </Button>
                    )}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {hasActiveFilters ? "No sessions match your filters" : "No completed sessions yet"}
                    </h3>
                    <p className="text-gray-500">
                      {hasActiveFilters 
                        ? "Try adjusting your search criteria or clearing the filters." 
                        : "Completed sessions will appear here after you finish and document them."
                      }
                    </p>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {hasActiveFilters ? "No sessions match your filters" : "No cancelled sessions"}
                    </h3>
                    <p className="text-gray-500">
                      {hasActiveFilters 
                        ? "Try adjusting your search criteria or clearing the filters." 
                        : "Great! You haven't had any cancelled sessions."
                      }
                    </p>
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

          <TabsContent value="no-show">
            <div className="space-y-6">
              {filterSessionsByTab("no-show").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {hasActiveFilters ? "No sessions match your filters" : "No no-show sessions"}
                    </h3>
                    <p className="text-gray-500">
                      {hasActiveFilters 
                        ? "Try adjusting your search criteria or clearing the filters." 
                        : "Great! You haven't had any no-show sessions."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filterSessionsByTab("no-show")
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
              {filterSessionsByTab("all").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {hasActiveFilters ? "No sessions match your filters" : "No sessions found"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {hasActiveFilters 
                        ? "Try adjusting your search criteria or clearing the filters." 
                        : "Start by scheduling your first therapy session."
                      }
                    </p>
                    {!hasActiveFilters && (
                      <Button 
                        style={{ backgroundColor: '#8159A8' }}
                        className="text-white hover:opacity-90"
                        onClick={() => window.location.href = '/therapist/appointments/new'}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Your First Session
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filterSessionsByTab("all")
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

        {/* Updated Medications Modal with MedicationManagement component */}
        <Dialog open={showMedications} onOpenChange={setShowMedications}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
              {isLoadingMedications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8159A8]"></div>
                  <span className="ml-2">Loading medications...</span>
                </div>
              ) : medicationPatientId ? (
                <MedicationManagement 
                  patientId={medicationPatientId}
                  medications={medications}
                  onMedicationUpdate={() => fetchMedications(medicationPatientId)}
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTasks} onOpenChange={setShowTasks}>
          <DialogContent className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <Button
                style={{ backgroundColor: "#8159A8", color: "#fff" }}
                className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow hover:brightness-110"
                // onClick={() => setShowAssignTask(true)}
              >
                <Plus className="w-5 h-5" />
                Assign a new Task
              </Button>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-sm">
                  {hardcodedTasks.filter(t => t.status === "Pending").length} Pending
                </Badge>
                <Badge variant="outline" className="text-sm bg-green-50 text-green-700">
                  {hardcodedTasks.filter(t => t.status === "Completed").length} Completed
                </Badge>
              </div>
            </div>
            <div className="space-y-6">
              {hardcodedTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No tasks assigned.</p>
                  </CardContent>
                </Card>
              ) : 
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
                      <div className="text-xs text-[#8159A8] font-medium">
                        Assigned: {task.assignedDate}
                        {task.completedDate && (
                          <span className="ml-3">
                            Completed: {task.completedDate}
                          </span>
                        )}
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
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 px-3 py-1 text-xs font-semibold"
                      >
                        View Assessment
                      </Button>
                    </div>
                  </div>
                ))
              }
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

