"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, MapPin, FileText, Edit, Eye, CheckCircle, Plus, Activity } from "lucide-react";
import { SessionUpdateModal } from "@/components/therapist/SessionUpdateModal";
import { StatsCard } from "@/components/ui/stats-card";
import { format } from "date-fns";

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

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

export default function TherapistSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

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
    const now = new Date();
    switch (tab) {
      case 'upcoming':
        return sessions.filter(session => 
          new Date(session.scheduledAt) > now && 
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

  const canUpdateSession = (session: Session) => {
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    return sessionTime <= now && session.status === 'SCHEDULED';
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

  const SessionCard = ({ session }: { session: Session }) => (
    <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 bg-primary-foreground dark:bg-slate-950">
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
            </div>
          </div>
          <Badge className={`${getStatusColor(session.status)} font-medium`}>
            {session.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium">{format(new Date(session.scheduledAt), "MMM dd, yyyy")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-medium">{format(new Date(session.scheduledAt), "hh:mm a")}</p>
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
            <div className="flex items-center gap-2 col-span-2 md:col-span-1 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(session)}
              className="text-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            </div>
        </div>

        

    
      </CardContent>
    </Card>
  );

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
            <Button 
              onClick={() => window.location.href = '/therapist/appointments/new'}
              style={{ backgroundColor: '#8159A8' }}
              className="text-white hover:opacity-90 transition-all duration-200 hover:shadow-md"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule New Session
            </Button>
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
                  {filterSessionsByTab("upcoming").length > 0 ? (
                    <>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {(() => {
                          const nextSession = filterSessionsByTab("upcoming")
                            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
                          return format(new Date(nextSession.scheduledAt), "MMM dd, hh:mm a");
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const nextSession = filterSessionsByTab("upcoming")
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
            <TabsTrigger value="upcoming">
              Upcoming ({filterSessionsByTab("upcoming").length})
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

          <TabsContent value="upcoming">
            <div className="space-y-6">
              {filterSessionsByTab("upcoming").length === 0 ? (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
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
                  {filterSessionsByTab("upcoming")
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
                    <p className="text-gray-500">Great! You haven't had any cancelled sessions.</p>
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
      </div>
    </div>
  );
}
