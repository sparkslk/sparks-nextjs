"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Calendar, Clock, User, ChevronDown, ChevronUp } from "lucide-react";

interface Session {
  id: string;
  date: string;
  time: string;
  therapist: string;
  mode: string;
  status: 'upcoming' | 'past';
  sessionNotes?: string;
  duration?: number;
  sessionType?: string;
  primaryFocusAreas?: string[];
  homework?: string;
  nextSteps?: string;
}

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  childId: string;
}

export default function SessionDetailsModal({ isOpen, onClose, childName, childId }: SessionDetailsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/parent/children/${childId}/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch sessions`);
      }
      
      const data = await response.json();
      console.log('Session data received:', data);
      
      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        throw new Error(data.message || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError(error instanceof Error ? error.message : "Failed to load session data");
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    if (isOpen && childId) {
      fetchSessions();
    }
  }, [isOpen, childId, fetchSessions]);

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      // Find the session to get session details
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('Session not found');
        return;
      }

      // Check if session is upcoming and within reasonable time frame
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      const now = new Date();
      const timeDifference = sessionDateTime.getTime() - now.getTime();
      const minutesDifference = timeDifference / (1000 * 60);

      // Allow joining 15 minutes before session time
      if (minutesDifference > 15) {
        alert('Session has not started yet. You can join 15 minutes before the scheduled time.');
        return;
      }

      // Redirect to session room or video call
      // This could be a video call service like Zoom, Teams, or a custom implementation
      window.open(`/session/${sessionId}`, '_blank');
      
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#8159A8' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <span className="text-white font-semibold">
                {childName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Session Details - {childName}</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
              <span className="ml-3 text-gray-600">Loading sessions...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchSessions} variant="outline">
                Try Again
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No sessions found for this child.</p>
              <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-100 rounded">
                Debug: Child ID = {childId}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upcoming Sessions */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
                </div>
                {sessions.filter(session => session.status === 'upcoming').length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    No upcoming sessions scheduled
                  </div>
                ) : (
                  sessions.filter(session => session.status === 'upcoming').map((session) => (
                    <Card key={session.id} className="mb-3 border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Date: {formatDate(session.date)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Time: {formatTime(session.time)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>Therapist: {session.therapist}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Duration: {session.duration || 60} minutes</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#8159A8' }}
                            className="text-white hover:opacity-90"
                            onClick={() => handleJoinSession(session.id)}
                          >
                            Join Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Past Sessions */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <h3 className="font-semibold text-gray-900">Past Sessions</h3>
                </div>
                {sessions.filter(session => session.status === 'past').length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    No past sessions found
                  </div>
                ) : (
                  sessions.filter(session => session.status === 'past').map((session) => (
                    <Card key={session.id} className="mb-3 border-l-4 border-l-gray-400">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Date: {formatDate(session.date)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>Therapist: {session.therapist}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Time: {formatTime(session.time)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Duration: {session.duration || 60} minutes</span>
                              </div>
                            </div>
                            {session.sessionNotes && (
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                <span className="text-gray-500">Session Notes:</span>
                                <span className="italic">{session.sessionNotes}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSessionExpansion(session.id)}
                            className="flex items-center space-x-1"
                          >
                            <span>View Details</span>
                            {expandedSessions.has(session.id) ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </Button>
                        </div>
                        {expandedSessions.has(session.id) && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Session Summary</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              {session.sessionNotes || 'No detailed notes available for this session.'}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">Duration:</span> {session.duration ? `${session.duration} minutes` : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Session Type:</span> {session.sessionType || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Primary Focus Areas:</span> {session.primaryFocusAreas?.join(', ') || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Homework:</span> {session.homework || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Next Steps:</span> {session.nextSteps || 'N/A'}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}