"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText, CheckCircle } from "lucide-react";
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

export default function CompletedSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/therapist/sessions");
      if (response.ok) {
        const data = await response.json();
        const completedSessions = data.sessions.filter((session: Session) => 
          session.status === 'COMPLETED'
        );
        setSessions(completedSessions);
      }
    } catch (error) {
      console.error("Error fetching completed sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading completed sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Completed Sessions</h1>
        <p className="text-gray-600 mt-2">
          Review your completed therapy sessions and track patient progress
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-sm text-gray-600">Total Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => {
                    const sessionDate = new Date(s.scheduledAt);
                    const thisMonth = new Date();
                    return sessionDate.getMonth() === thisMonth.getMonth() && 
                           sessionDate.getFullYear() === thisMonth.getFullYear();
                  }).length}
                </p>
                <p className="text-sm text-gray-600">This Month</p>
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

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No completed sessions yet.</p>
              <p className="text-sm text-gray-500 mt-2">Completed sessions will appear here after you finish and document them.</p>
            </CardContent>
          </Card>
        ) : (
          sessions
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
            .map((session) => (
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
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Type: {session.type}</p>
                  
                  {session.objectives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Session Objectives:</p>
                      <p className="text-sm text-gray-600">{session.objectives.join(", ")}</p>
                    </div>
                  )}

                  {(session.patientMood || session.engagement) && (
                    <div className="flex gap-4 text-sm">
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

                  {session.progressNotes && (
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Progress Notes
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{session.progressNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Full Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Notes
                    </Button>
                    <Button variant="outline" size="sm">
                      View Patient Profile
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
