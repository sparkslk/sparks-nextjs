"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CalendarDays, MapPin, Video,  CheckCircle, Star, MessageCircle,  Plus } from "lucide-react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  therapist: {
    name: string;
    email: string;
    phone?: string;
    specialization: string;
  } | null;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'past';
  childId: string;
  duration: number;
  sessionStatus: string;
  notes?: string;
  therapist: string;
  therapistEmail: string;
  therapistPhone: string;
  specializations: string[];
  mode: string;
  sessionType: string;
  objectives: string[];
}

export default function AppointmentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch children data
      const childrenResponse = await fetch("/api/parent/children");
      if (!childrenResponse.ok) {
        throw new Error("Failed to fetch children data");
      }
      const childrenData = await childrenResponse.json();
      setChildren(childrenData.children || []);

      // Fetch sessions for each child using the individual child sessions API
      const allAppointments: Appointment[] = [];
      
      for (const child of childrenData.children || []) {
        console.log(`Fetching sessions for child ${child.id} (${child.firstName} ${child.lastName})`);
        console.log(`Child therapist:`, child.therapist);
        try {
          const sessionsResponse = await fetch(`/api/parent/children/${child.id}/sessions`);
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            
            // Transform the detailed session data to appointments format
            const childAppointments: Appointment[] = sessionsData.sessions?.map((session: {
              id: string;
              date: string;
              time: string;
              sessionType: string;
              childId: string;
              duration: number;
              status: string;
              notes?: string;
              therapist: string;
              therapistEmail: string;
              therapistPhone: string;
              specializations: string[];
              mode: string;
              objectives: string[];
            }) => ({
              id: session.id,
              date: session.date,
              time: new Date(`${session.date}T${session.time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              }),
              type: session.sessionType,
              status: session.status as 'upcoming' | 'past',
              childId: session.childId,
              duration: session.duration,
              sessionStatus: session.status,
              notes: session.notes,
              therapist: session.therapist,
              therapistEmail: session.therapistEmail,
              therapistPhone: session.therapistPhone,
              specializations: session.specializations,
              mode: session.mode,
              sessionType: session.sessionType,
              objectives: session.objectives
            })) || [];

            console.log(`Fetched ${childAppointments.length} sessions for child ${child.id}`);
            console.log(childAppointments);
            
            allAppointments.push(...childAppointments);
          }
        } catch (childError) {
          console.warn(`Failed to fetch sessions for child ${child.id}:`, childError);
        }
      }
      
      setAppointments(allAppointments);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load appointments data");
    } finally {
      setLoading(false);
    }
  };

  const getChildAppointments = (childId: string, status: 'upcoming' | 'past') => {
    return appointments.filter(apt => apt.childId === childId && apt.status === status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load appointments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg shadow-md" style={{ backgroundColor: '#8159A8' }}>
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #8159A8, #6B4C93)' }}>
                    Appointments
                  </h1>
                  <p className="mt-1 text-sm" style={{ color: '#8159A8' }}>
                    Manage your children&apos;s therapy sessions with ease
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#8159A8' }}>Total Children</p>
                  <p className="text-lg font-bold" style={{ color: '#8159A8' }}>{children.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#8159A8' }}>Upcoming Sessions</p>
                  <p className="text-lg font-bold" style={{ color: '#8159A8' }}>
                    {appointments.filter(apt => apt.status === 'upcoming').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Children Cards */}
        <div className="space-y-6">
          {children.map((child) => {
            const upcomingAppointments = getChildAppointments(child.id, 'upcoming');
            const pastAppointments = getChildAppointments(child.id, 'past');

            return (
              <Card key={child.id} className="appointments-card bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8159A8' }}>
                          <span className="font-bold text-white text-sm">
                            {child.firstName?.[0]?.toUpperCase()}{child.lastName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        {child.therapist && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {child.firstName} {child.lastName}
                        </CardTitle>
                        {child.therapist && (
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" style={{ color: '#8159A8' }} />
                              <span className="text-xs font-medium text-gray-700">
                                {child.therapist.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-gray-600">
                                {child.therapist.specialization}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-0 hover:opacity-90 transition-all duration-300 shadow-md text-xs px-3 py-1"
                        style={{ backgroundColor: '#8159A8' }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Book Session
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {upcomingAppointments.length > 0 || pastAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {/* Therapist Information */}
                      {(upcomingAppointments.length > 0 || pastAppointments.length > 0) && (
                        <div className="therapist-info p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border" style={{ borderColor: '#8159A8' }}>
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3" style={{ color: '#8159A8' }} />
                            <p className="text-xs" style={{ color: '#8159A8' }}>
                              {child.firstName}&apos;s therapist is{' '}
                              <span className="font-semibold">
                                {upcomingAppointments.length > 0 
                                  ? upcomingAppointments[0].therapist
                                  : pastAppointments[0].therapist
                                }
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Upcoming Sessions */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CalendarDays className="w-4 h-4 text-green-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
                        </div>
                        {upcomingAppointments.length > 0 ? (
                          <div className="space-y-3">
                            {upcomingAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="session-card upcoming flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    {appointment.mode === 'Virtual' ? (
                                      <Video className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <MapPin className="w-5 h-5 text-green-600" />
                                    )}
                                  </div>
                                  <div className="text-xs">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {formatDate(appointment.date)} - {appointment.type}
                                    </p>
                                    <p className="text-gray-600 flex items-center text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {appointment.time} • {appointment.duration} min
                                    </p>
                                    {appointment.therapist && (
                                      <p className="text-gray-600 text-xs mt-1">
                                        <span className="font-medium">Therapist:</span> {appointment.therapist}
                                      </p>
                                    )}
                                    {appointment.mode && (
                                      <p className="text-gray-600 text-xs flex items-center">
                                        <span className="font-medium">Mode:</span> 
                                        <span className="ml-1">{appointment.mode}</span>
                                        {appointment.mode === 'Virtual' && <Video className="w-3 h-3 ml-1" />}
                                        {appointment.mode === 'In-Person' && <MapPin className="w-3 h-3 ml-1" />}
                                      </p>
                                    )}
                                    {appointment.specializations && appointment.specializations.length > 0 && (
                                      <p className="text-gray-600 text-xs">
                                        <span className="font-medium">Specializations:</span> {appointment.specializations.join(', ')}
                                      </p>
                                    )}
                                    {appointment.notes && (
                                      <p className="text-gray-600 text-xs mt-1">
                                        <span className="font-medium">Notes:</span> {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ color: '#8159A8', borderColor: '#8159A8' }}
                                    className="hover:bg-purple-50 text-xs px-2 py-1"
                                  >
                                    Reschedule
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-600 hover:bg-red-50 text-xs px-2 py-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg text-center border border-gray-200">
                            <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500 text-xs">No upcoming sessions scheduled</p>
                          </div>
                        )}
                      </div>

                      {/* Past Sessions */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">Past Sessions</h3>
                        </div>
                        {pastAppointments.length > 0 ? (
                          <div className="space-y-3">
                            {pastAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="session-card past flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div className="text-xs">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {formatDate(appointment.date)} - {appointment.type}
                                    </p>
                                    <p className="text-gray-600 flex items-center text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {appointment.time} • {appointment.duration} min
                                    </p>
                                    {appointment.therapist && (
                                      <p className="text-gray-600 text-xs mt-1">
                                        <span className="font-medium">Therapist:</span> {appointment.therapist}
                                      </p>
                                    )}
                                    {appointment.mode && (
                                      <p className="text-gray-600 text-xs flex items-center">
                                        <span className="font-medium">Mode:</span> 
                                        <span className="ml-1">{appointment.mode}</span>
                                        {appointment.mode === 'Virtual' && <Video className="w-3 h-3 ml-1" />}
                                        {appointment.mode === 'In-Person' && <MapPin className="w-3 h-3 ml-1" />}
                                      </p>
                                    )}
                                    {appointment.specializations && appointment.specializations.length > 0 && (
                                      <p className="text-gray-600 text-xs">
                                        <span className="font-medium">Specializations:</span> {appointment.specializations.join(', ')}
                                      </p>
                                    )}
                                    {appointment.notes && (
                                      <p className="text-gray-600 text-xs mt-1">
                                        <span className="font-medium">Session Notes:</span> {appointment.notes}
                                      </p>
                                    )}
                                    {appointment.objectives && appointment.objectives.length > 0 && (
                                      <p className="text-gray-600 text-xs mt-1">
                                        <span className="font-medium">Objectives:</span> {appointment.objectives.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ color: '#8159A8', borderColor: '#8159A8' }}
                                    className="hover:bg-purple-50 text-xs px-2 py-1"
                                  >
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    View Review
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg text-center border border-gray-200">
                            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500 text-xs">No past sessions</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        No Sessions Found
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {child.therapist 
                          ? "No sessions have been scheduled yet."
                          : "To schedule appointments, you need to connect with a therapist first."
                        }
                      </p>
                      <Button
                        className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-sm"
                        style={{ backgroundColor: '#8159A8' }}
                        onClick={() => window.location.href = '/parent/findTherapist'}
                      >
                        {child.therapist ? "Book Session" : "Find a Therapist"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {children.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8159A8' }}>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No Children Found
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Add children to your account to manage their appointments.
            </p>
            <Button
              className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-sm"
              style={{ backgroundColor: '#8159A8' }}
              onClick={() => window.location.href = '/parent/children'}
            >
              Add Child
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}