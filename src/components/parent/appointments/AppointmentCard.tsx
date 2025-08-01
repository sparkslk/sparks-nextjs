"use client";

import { Card,  CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CalendarDays, Video, CheckCircle } from "lucide-react";
import { Child, Appointment } from "@/types/appointments";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AppointmentCardProps {
  child: Child;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  cancelledAppointments: Appointment[];
  onTherapistClick: (therapist: Child['therapist']) => void;
  formatDate: (dateString: string) => string;
  isHighlighted?: boolean;
}

function formatSriLankaDateTime(dateString: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'Asia/Colombo',
  }).format(date);
}

export default function AppointmentCard({ 
  child, 
  upcomingAppointments, 
  pastAppointments, 
  cancelledAppointments,
  onTherapistClick, 
  formatDate,
  isHighlighted = false
}: AppointmentCardProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('all');
    
  // const [therapySessions, setTherapySessions] = useState<any[]>([]);
  // const [sessionsLoading, setSessionsLoading] = useState(false);
  // const [sessionsError, setSessionsError] = useState<string | null>(null);
  // const [showSessionModal, setShowSessionModal] = useState(false);
  // const [selectedSession, setSelectedSession] = useState<any>(null);

  // useEffect(() => {
  //   if (!child?.id || child.id === "all") return;
  //   setSessionsLoading(true);
  //   setSessionsError(null);
  //   fetch(`/api/parent/sessions?childId=${child.id}`)
  //     .then(async (res) => {
  //       if (!res.ok) throw new Error("Failed to fetch session details");
  //       return res.json();
  //     })
  //     .then((data) => {
  //       setTherapySessions(data.sessions || []);
  //       setSessionsLoading(false);
  //     })
  //     .catch((err) => {
  //       setSessionsError(err.message || "Unknown error");
  //       setSessionsLoading(false);
  //     });
  // }, [child?.id]);

  // Filtering logic for appointments
  let filteredUpcoming = upcomingAppointments;
  let filteredPast = pastAppointments;
  let filteredCancelled = cancelledAppointments;

  if (activeTab !== 'all') {
    filteredUpcoming = activeTab === 'upcoming' ? upcomingAppointments : [];
    filteredPast = activeTab === 'completed' ? pastAppointments : [];
    filteredCancelled = activeTab === 'cancelled' ? cancelledAppointments : [];
  }
  // console.log(therapySessions);

  // const handleViewDetails = (appointment: Appointment) => {
  //   console.log(appointment);
  //   // Find the session by appointmentId and childId
  //   // const session = therapySessions.find(
  //   //   (s) => s.id === appointment.id && s.childId === appointment.childId
  //   // );
  //   // console.log("This is the selected session" ,session);
  //   setSelectedSession(appointment || null);
  //   setShowSessionModal(true);
  // };

  const renderUpcomingSessions = () => (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <CalendarDays className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
      </div>
      {filteredUpcoming.length > 0 ? (
        <div className="space-y-3">
          {filteredUpcoming.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card upcoming relative flex flex-col p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow transition-all duration-300 transform text-lg min-h-[160px]"
            >
              {/* Action buttons at bottom right */}
              <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                <button
                  className="flex items-center justify-center gap-2 w-36 h-11 px-4 py-2 rounded-lg border bg-green-100 border-green-300 shadow-sm text-base font-semibold text-green-700 hover:bg-green-200 transition-all duration-150 text-center"
                  style={{ fontWeight: 600 }}
                  onClick={() => {/* reschedule logic here */}}
                >
                  Reschedule
                </button>
                <button
                  className="flex items-center justify-center gap-2 w-36 h-11 px-4 py-2 rounded-lg border bg-red-100 border-red-300 shadow-sm text-base font-semibold text-red-700 hover:bg-red-200 transition-all duration-150 text-center"
                  style={{ fontWeight: 600 }}
                  onClick={() => {/* cancel logic here */}}
                >
                  Cancel
                </button>
              </div>
              {/* Patient name with improved styling */}
              {appointment.childFirstName && appointment.childLastName && (
                <div className="absolute left-4 top-4 right-4 flex items-center justify-between z-10">
                  <div className=" px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Patient</span>
                      <span className="text-sm font-bold text-green-800">
                        {appointment.childFirstName} {appointment.childLastName}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-6 w-full mt-8">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  {appointment.mode === 'Virtual' ? (
                    <Video className="w-7 h-7" style={{ color: '#059669' }} />
                  ) : (
                    <Calendar className="w-7 h-7" style={{ color: '#059669' }} />
                  )}
                </div>
                <div className="flex flex-row gap-6 sm:gap-12 items-center flex-wrap">
                  <div className="flex flex-row items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: '#059669' }} />
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{formatSriLankaDateTime(appointment.date, { dateStyle: 'medium' })}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: '#059669' }} />
                    <span className="text-sm text-gray-500">Time:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.time}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <User className="w-5 h-5" style={{ color: '#059669' }} />
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.type}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.duration} min</span>
                  </div>
                </div>
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
  );

  const renderPastSessions = () => (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <CheckCircle className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Past Sessions</h3>
      </div>
      {filteredPast.length > 0 ? (
        <div className="space-y-3">
          {filteredPast.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card past relative flex flex-col p-4 bg-gradient-to-r from-[var(--color-card)] to-[var(--color-secondary)] rounded-2xl border border-[var(--color-border)] shadow transition-all duration-300 transform text-lg"
              style={{ minHeight: '90px' }}
            >
              {/* Patient name with improved styling */}
              {appointment.childFirstName && appointment.childLastName && (
                <div className="absolute left-4 top-4 right-4 flex items-center justify-between z-10">
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Patient</span>
                      <span className="text-sm font-bold text-gray-800">
                        {appointment.childFirstName} {appointment.childLastName}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-6 w-full mt-8">
                <div className="w-14 h-14 bg-[var(--color-card)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="flex flex-row gap-6 sm:gap-12 items-center flex-wrap">
                  <div className="flex flex-row items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Time:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.time}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.type}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.duration} min</span>
                  </div>
                </div>
              </div>
              {/* View Details button at bottom right */}
              <div className="absolute bottom-4 right-4 flex justify-end">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-base font-semibold text-gray-900 hover:bg-gray-50 transition-all duration-150"
                  style={{ fontWeight: 600 }}
                  onClick={() => window.location.href = `/parent/sessions/${appointment.id}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 4.556 4.694 7.5 9.75 7.5s9.75-2.944 9.75-7.5c0-4.556-4.694-7.5-9.75-7.5S2.25 7.444 2.25 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View Details
                </button>
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
  );

  const renderCancelledSessions = () => (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="w-4 h-4 text-red-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Cancelled Sessions</h3>
      </div>
      {filteredCancelled.length > 0 ? (
        <div className="space-y-3">
          {filteredCancelled.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card cancelled relative flex flex-col p-4 bg-gradient-to-r from-[var(--color-destructive)]/10 to-[var(--color-destructive)]/5 rounded-2xl border border-[var(--color-destructive)] shadow transition-all duration-300 transform text-lg"
              style={{ minHeight: '90px' }}
            >
              {/* Patient name with improved styling */}
              {appointment.childFirstName && appointment.childLastName && (
                <div className="absolute left-4 top-4 right-4 flex items-center justify-between z-10">
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Patient</span>
                      <span className="text-sm font-bold text-red-800">
                        {appointment.childFirstName} {appointment.childLastName}
                      </span>
                    </div>
                  </div>
                  <span className="inline-block bg-red-100 border border-red-300 text-red-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    Cancelled
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-6 w-full mt-8">
                <div className="w-14 h-14 bg-[var(--color-destructive)]/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="flex flex-row gap-6 sm:gap-12 items-center flex-wrap">
                  <div className="flex flex-row items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Time:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.time}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.type}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="font-semibold text-gray-900 text-sm ml-1">{appointment.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gradient-to-r from-gray-50 to-pink-50 rounded-lg text-center border border-red-200">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-red-400" />
          <p className="text-gray-500 text-xs">No cancelled sessions</p>
        </div>
      )}
    </div>
  );

  const renderAllSessions = () => (
    filteredUpcoming.length > 0 || filteredPast.length > 0 || filteredCancelled.length > 0 ? (
      <div className="space-y-4">
        {renderUpcomingSessions()}
        {renderPastSessions()}
        {renderCancelledSessions()}
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
          style={{ backgroundColor: 'var(--color-primary)' }}
          onClick={() => window.location.href = '/parent/findTherapist'}
        >
          {child.therapist ? "Book Session" : "Find a Therapist"}
        </Button>
      </div>
    )
  );

  return (
    <Card className={`appointments-card bg-[var(--color-card)]/80 backdrop-blur-sm shadow-lg border hover:shadow-xl transition-all duration-300 ${
      isHighlighted 
        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-[var(--color-primary)]/20' 
        : 'border-[var(--color-border)]'
    }`}>
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-3">
            {child.id !== "all" && (
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <span className="font-bold text-white text-sm">
                    {child.firstName?.[0]?.toUpperCase()}{child.lastName?.[0]?.toUpperCase()}
                  </span>
                </div>
                {isHighlighted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                )}
              </div>
            )}
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                {child.firstName} {child.lastName}
                {isHighlighted && (
                  <span className="ml-2 text-xs text-purple-600 font-normal">(Selected)</span>
                )}
              </CardTitle>
            </div>
          </div>
          {child.therapist && (
            <Button
              size="sm"
              className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-xs px-3 py-1"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onClick={() => window.location.href = '/parent/bookSession'}
            >
              Book Session
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Therapist Information */}
      {child.therapist && (upcomingAppointments.length > 0 || pastAppointments.length > 0) && (
        <div 
          className="therapist-info p-2 sm:p-3 bg-gradient-to-r from-[var(--color-primary-foreground)] to-[var(--color-secondary)] rounded-lg border cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform mx-2 sm:mx-6 mt-2 mb-2" 
          style={{ borderColor: 'var(--color-primary)' }}
          onClick={() => onTherapistClick(child.therapist)}
        >
          <div className="flex items-center space-x-2">
            <User className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
            <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
              {child.firstName}&apos;s therapist is{' '}
              <span className="font-semibold">
                {child.therapist.name || 'Unknown Therapist'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Tabs for Sessions */}
      <div className="px-2 sm:px-6 pt-2 pb-4">
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'upcoming' | 'completed' | 'cancelled' | 'all')} className="w-full">
          <TabsList className="w-full flex bg-[var(--color-secondary)]/30 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <TabsTrigger value="upcoming" className="flex-1 text-xs sm:text-sm">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 text-xs sm:text-sm">
              Completed ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 text-xs sm:text-sm">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">
              All ({upcomingAppointments.length + pastAppointments.length + cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="px-0 sm:px-4">
            {renderAllSessions()}
          </TabsContent>

          <TabsContent value="upcoming" className="px-0 sm:px-4">
            {renderUpcomingSessions()}
          </TabsContent>

          <TabsContent value="completed" className="px-0 sm:px-4">
            {renderPastSessions()}
          </TabsContent>

          <TabsContent value="cancelled" className="px-0 sm:px-4">
            {renderCancelledSessions()}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}