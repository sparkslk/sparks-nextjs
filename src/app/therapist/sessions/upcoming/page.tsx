"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, Plus } from "lucide-react";
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
}

export default function UpcomingSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/therapist/sessions");
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const upcomingSessions = data.sessions.filter((session: Session) => 
          new Date(session.scheduledAt) > now && 
          ['SCHEDULED', 'APPROVED', 'CONFIRMED'].includes(session.status)
        );
        setSessions(upcomingSessions);
      }
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading upcoming sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Sessions</h1>
          <p className="text-gray-600 mt-2">
            Your scheduled therapy sessions for the coming days
          </p>
        </div>
        <Button onClick={() => window.location.href = '/therapist/appointments/new'}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule New Session
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming sessions scheduled.</p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = '/therapist/appointments/new'}
              >
                Schedule Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {session.patientName}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
                    </div>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Type: {session.type}</p>
                  {session.objectives.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Objectives: {session.objectives.join(", ")}
                    </p>
                  )}
                  {session.notes && (
                    <p className="text-sm text-gray-600 line-clamp-2">{session.notes}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
