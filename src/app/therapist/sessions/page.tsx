"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, MapPin, FileText, Pill, CheckSquare, Edit, Eye, CheckCircle, Plus } from "lucide-react";
import { SessionDetailsModal } from "@/components/therapist/SessionDetailsModal";
import { SessionUpdateModal } from "@/components/therapist/SessionUpdateModal";
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
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
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              {session.patientName}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(session.scheduledAt), "MMM dd, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(session.scheduledAt), "hh:mm a")} ({session.duration} min)
              </span>
              {session.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {session.location}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(session.status)}>
            {session.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Type: {session.type}</p>
            {session.objectives.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Objectives: {session.objectives.join(", ")}
              </p>
            )}
          </div>
          
          {/* Show mood and engagement for completed sessions */}
          {session.status === 'COMPLETED' && (session.patientMood || session.engagement) && (
            <div className="flex gap-4 text-sm bg-green-50 p-2 rounded">
              {session.patientMood && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Mood:</span> {session.patientMood}/10
                </span>
              )}
              {session.engagement && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Engagement:</span> {session.engagement}/10
                </span>
              )}
            </div>
          )}

          {session.notes && (
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Session Notes
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{session.notes}</p>
            </div>
          )}

          {/* Show progress notes for completed sessions */}
          {session.status === 'COMPLETED' && session.progressNotes && (
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Progress Notes
              </p>
              <p className="text-sm text-gray-600 mt-1">{session.progressNotes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(session)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            
            {canUpdateSession(session) && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleUpdateSession(session)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Update Session
              </Button>
            )}

            {session.status === 'COMPLETED' && (
              <>
                <Button variant="outline" size="sm">
                  Export Notes
                </Button>
                <Button variant="outline" size="sm">
                  View Patient Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Session Management</h1>
              <p className="text-gray-600 mt-2">
                Manage all your therapy sessions, appointments, notes, and track progress.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/therapist/appointments/new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Session
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{filterSessionsByTab("upcoming").length}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{filterSessionsByTab("completed").length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{filterSessionsByTab("cancelled").length}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(sessions.map(s => s.patientId)).size}
                  </p>
                  <p className="text-sm text-gray-600">Unique Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {filterSessionsByTab("upcoming").length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming sessions scheduled.</p>
                  <p className="text-sm text-gray-500 mt-2">Your scheduled therapy sessions will appear here.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => window.location.href = '/therapist/appointments/new'}
                  >
                    Schedule Your First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filterSessionsByTab("upcoming")
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {filterSessionsByTab("completed").length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No completed sessions yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Completed sessions will appear here after you finish and document them.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {filterSessionsByTab("completed").length} completed sessions
                  </p>
                  <div className="text-sm text-gray-600">
                    This month: {filterSessionsByTab("completed").filter(s => {
                      const sessionDate = new Date(s.scheduledAt);
                      const thisMonth = new Date();
                      return sessionDate.getMonth() === thisMonth.getMonth() && 
                             sessionDate.getFullYear() === thisMonth.getFullYear();
                    }).length}
                  </div>
                </div>
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

        <TabsContent value="cancelled" className="mt-6">
          <div className="space-y-4">
            {filterSessionsByTab("cancelled").length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No cancelled sessions.</p>
                </CardContent>
              </Card>
            ) : (
              filterSessionsByTab("cancelled")
                .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                .map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sessions found.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => window.location.href = '/therapist/appointments/new'}
                  >
                    Schedule Your First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing all {sessions.length} sessions
                  </p>
                  <div className="text-sm text-gray-600">
                    Sorted by most recent
                  </div>
                </div>
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

      {/* Modals */}
      <SessionDetailsModal
        session={selectedSession}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSession(null);
        }}
      />

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
  );
}
