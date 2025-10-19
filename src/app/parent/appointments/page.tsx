"use client";

import { useState, useEffect } from "react";
import AppointmentsHeader from "@/components/parent/appointments/AppointmentsHeader";
import AppointmentCard from "@/components/parent/appointments/AppointmentCard";
import TherapistModal from "@/components/parent/appointments/TherapistModal";
import EmptyState from "@/components/parent/appointments/EmptyState";
import { Child, Appointment } from "@/types/appointments";
// import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SessionBookingModal } from "@/components/parent/SessionBookingModal";
import RescheduleModal from "@/components/parent/appointments/RescheduleModal";
import SessionCancellationDialog from "@/components/parent/SessionCancellationDialog";

export default function AppointmentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Child['therapist'] | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [isRescheduleSectionOpen, setIsRescheduleSectionOpen] = useState(true);
  const [isScheduledSectionOpen, setIsScheduledSectionOpen] = useState(true);
  // const [highlightedChildId, setHighlightedChildId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | "all">("all");
  const [showBookSessionChildId, setShowBookSessionChildId] = useState<string | null>(null);
  const router = useRouter();
  // Reschedule modal state (so RescheduleModal receives appointment and can fetch slots by childId)
  const [selectedSessionToReschedule, setSelectedSessionToReschedule] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Cancel modal state
  const [selectedSessionToCancel, setSelectedSessionToCancel] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchData();
    // Check for highlighted child from URL params
    // const urlParams = new URLSearchParams(window.location.search);
    // const highlightChild = urlParams.get('highlightChild');
    // if (highlightChild) {
    //   setHighlightedChildId(highlightChild);
    //   setSelectedChildId(highlightChild); // Set selector to the highlighted child
    // }
  }, []);

  const fetchData = async () => {
    try {
      // Fetch children data
      const childrenResponse = await fetch("/api/parent/children");
      if (!childrenResponse.ok) {
        throw new Error("Failed to fetch children data");
      }
      const childrenData = await childrenResponse.json();
      console.log("Fetched children data:", childrenData);
      setChildren(childrenData.children || []);

      // Fetch sessions for each child using the individual child sessions API
      const allAppointments: Appointment[] = [];
      const allRescheduleRequests: Appointment[] = [];

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
              sessionNotes?: string;
              therapist: string;
              therapistEmail: string;
              therapistPhone: string;
              specializations: string[];
              mode: string;
              primaryFocusAreas: string[];
              meetingLink?: string | null;
            }) => ({
              id: session.id,
              date: session.date,
              time: session.time, // Use backend-formatted time string directly
              type: session.sessionType,
              status: session.status,
              childId: session.childId,
              duration: session.duration,
              sessionStatus: session.status,
              sessionNotes: session.sessionNotes,
              therapist: session.therapist,
              therapistEmail: session.therapistEmail,
              therapistPhone: session.therapistPhone || '',
              specializations: session.specializations,
              mode: session.mode,
              sessionType: session.sessionType,
              primaryFocusAreas: session.primaryFocusAreas,
              meetingLink: session.meetingLink,
              objectives: []
            })) || [];

            // Separate reschedule requests from regular appointments
            const regularAppointments = childAppointments.filter(session => session.status !== 'RESCHEDULED');
            const rescheduleReqs = childAppointments.filter(session => session.status === 'RESCHEDULED');

            console.log(`Fetched ${childAppointments.length} sessions for child ${child.id}`);
            console.log(`Regular appointments: ${regularAppointments.length}, Reschedule requests: ${rescheduleReqs.length}`);

            // Debug: Log meeting links
            childAppointments.forEach(apt => {
              if (apt.meetingLink) {
                console.log(`Session ${apt.id} has meeting link:`, apt.meetingLink, `(mode: ${apt.mode})`);
              }
            });

            allAppointments.push(...regularAppointments);
            allRescheduleRequests.push(...rescheduleReqs);
          }
        } catch (childError) {
          console.warn(`Failed to fetch sessions for child ${child.id}:`, childError);
        }
      }

      setAppointments(allAppointments);
      setRescheduleRequests(allRescheduleRequests);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load appointments data");
    } finally {
      setLoading(false);
    }
  };

  const getChildAppointments = (childId: string, statuses: Array<'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW'>) => {
    return appointments.filter(apt => apt.childId === childId && statuses.includes(apt.status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleRescheduleRequest = (appointment: Appointment) => {
    setSelectedSessionToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirmed = () => {
    // refresh list after reschedule completes
    fetchData();
    setShowRescheduleModal(false);
    setSelectedSessionToReschedule(null);
  };

  const handleCancelRequest = (appointment: Appointment) => {
    setSelectedSessionToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirmed = () => {
    // refresh list after cancel completes
    fetchData();
    setShowCancelModal(false);
    setSelectedSessionToCancel(null);
  };

  // Reschedule helpers and No-show helpers
  const getChildRescheduleRequests = (childId: string): Appointment[] => {
    return rescheduleRequests.filter(req => req.childId === childId);
  };

  const getAllRescheduleRequests = (): Appointment[] => {
    return rescheduleRequests.map(req => {
      const child = children.find(c => c.id === req.childId);
      return { ...req, childFirstName: child?.firstName, childLastName: child?.lastName };
    });
  };



  const getChildNoShowSessions = (childId: string): Appointment[] => {
    return appointments.filter(apt => apt.childId === childId && apt.status === 'NO_SHOW');
  };

  // Component to render reschedule request cards
  const RescheduleRequestCard = ({ request }: { request: Appointment }) => (
    <Card key={request.id} className="border-0 shadow-lg bg-card/95 backdrop-blur hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedChildId === "all" && request.childFirstName && request.childLastName ?
                    `${request.childFirstName} ${request.childLastName}` :
                    children.find(c => c.id === request.childId)?.firstName + " " + children.find(c => c.id === request.childId)?.lastName
                  }
                </h3>
                <p className="text-sm text-muted-foreground">Therapist: {request.therapist}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-13">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(request.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {request.time} ({request.duration} min)
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {request.type === "With Parent" ? "Family" : "Individual"}
              </div>
            </div>
            {request.sessionNotes && (
              <div className="mt-2 ml-13">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Reschedule reason:</span> {request.sessionNotes}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Reschedule Requested
            </Badge> */}
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={() => handleRescheduleRequest(request)}
            >
              Reschedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Component to render the upcoming appointments with dropdown sections
  const UpcomingAppointmentsWithSections = ({ upcomingAppointments }: { upcomingAppointments: Appointment[] }) => {
    const rescheduleRequests = selectedChildId === "all" ? getAllRescheduleRequests() : getChildRescheduleRequests(selectedChildId);

    if (upcomingAppointments.length === 0 && rescheduleRequests.length === 0) {
      return (
        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No scheduled sessions</h3>
              <p className="text-muted-foreground">
                There are no scheduled or reschedule requests at the moment.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Reschedule Requests Section - Collapsible */}
        {rescheduleRequests.length > 0 && (
          <Card className="shadow-sm border border-yellow-200">
            <CardHeader
              className="cursor-pointer hover:bg-yellow-50/50 transition-colors"
              onClick={() => setIsRescheduleSectionOpen(!isRescheduleSectionOpen)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isRescheduleSectionOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">Pending Reschedule Requests</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {rescheduleRequests.length} pending
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {isRescheduleSectionOpen && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {rescheduleRequests.map((request) => (
                    <RescheduleRequestCard key={request.id} request={request} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Regular Scheduled Sessions - Collapsible */}
        {upcomingAppointments.length > 0 && (
          <Card className="shadow-sm border border-blue-200">
            <CardHeader
              className="cursor-pointer hover:bg-blue-50/50 transition-colors"
              onClick={() => setIsScheduledSectionOpen(!isScheduledSectionOpen)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isScheduledSectionOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">Scheduled Sessions</h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {upcomingAppointments.length} sessions
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {isScheduledSectionOpen && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-0 shadow-md bg-card/95 backdrop-blur hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {selectedChildId === "all" && appointment.childFirstName && appointment.childLastName ?
                                    `${appointment.childFirstName} ${appointment.childLastName}` :
                                    children.find(c => c.id === appointment.childId)?.firstName + " " + children.find(c => c.id === appointment.childId)?.lastName
                                  }
                                </h3>
                                <p className="text-sm text-muted-foreground">Therapist: {appointment.therapist}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-13">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.time} ({appointment.duration} min)
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {appointment.type === "With Parent" ? "Family" : "Individual"}
                              </div>
                              {/* Session Mode Badge
                              {appointment.mode && (
                                <Badge
                                  variant="outline"
                                  className={
                                    appointment.mode === 'ONLINE'
                                      ? 'bg-green-50 text-green-700 border-green-300'
                                      : appointment.mode === 'HYBRID'
                                      ? 'bg-orange-50 text-orange-700 border-orange-300'
                                      : 'bg-blue-50 text-blue-700 border-blue-300'
                                  }
                                >
                                  {appointment.mode === 'ONLINE' && '🎥 Online'}
                                  {appointment.mode === 'HYBRID' && '🔄 Hybrid'}
                                  {appointment.mode === 'IN_PERSON' && '👤 In-Person'}
                                </Badge>
                              )} */}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Scheduled
                            </Badge> */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => handleRescheduleRequest(appointment)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleCancelRequest(appointment)}
                              >
                                Cancel
                              </Button>
                            
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => {
                                    if (appointment.meetingLink) {
                                      window.open(appointment.meetingLink, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                >
                                  Join Session
                                </Button>
                            
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    );
  };

  // const handleBackgroundClick = () => {
  //   setShowZoomedCard(false);
  //   setHighlightedChildId(null);
  //   // Remove URL params
  //   const url = new URL(window.location.href);
  //   url.searchParams.delete('highlightChild');
  //   window.history.replaceState({}, '', url.toString());
  // };

  // const getHighlightedChild = () => {
  //   return children.find(child => child.id === highlightedChildId);
  // };

  if (loading) {
    return <EmptyState type="loading" />;
  }

  if (error) {
    return <EmptyState type="error" error={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
        {/* Enhanced Header */}
        <AppointmentsHeader
          childrenCount={children.length}
          upcomingSessionsCount={appointments.filter(apt => apt.status === 'SCHEDULED').length}
        />

        {/* Schedule Session Section */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pt-2 pb-6">
          <div className="space-y-3">
            {(selectedChildId === "all" ? children : children.filter(child => child.id === selectedChildId)).map(child => (
              <div key={child.id} className="flex items-center justify-between bg-[#F3EAFB] rounded-lg px-4 py-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-semibold text-gray-800">{child.firstName} {child.lastName}</span>
                  <span className="text-gray-500 text-sm">{child.therapist ? `Therapist: ${child.therapist.name || ""}` : 'No therapist assigned'}</span>
                </div>
                {child.therapist ? (
                  <button
                    className="w-40 px-4 py-2 rounded-lg font-semibold transition text-white text-center"
                    style={{ backgroundColor: '#8159A8' }}
                    onClick={() => setShowBookSessionChildId(child.id)}
                  >
                    Book a Session
                  </button>
                ) : (
                  <button
                    className="w-40 px-4 py-2 rounded-lg font-semibold transition text-center border hover:bg-[#f6f1fa]"
                    style={{ color: '#8159A8', borderColor: '#8159A8', backgroundColor: '#fff' }}
                    onClick={() => router.push('/parent/findTherapist')}
                  >
                    Find Therapist
                  </button>
                )}
                {/* SessionBookingModal for this child */}
                <SessionBookingModal
                  open={showBookSessionChildId === child.id}
                  onOpenChange={open => setShowBookSessionChildId(open ? child.id : null)}
                  child={{
                    ...child,
                    therapist: child.therapist
                      ? {
                        ...child.therapist,
                        name: child.therapist.name ?? "",
                        email: child.therapist.email ?? "",
                        // add other required fields with default values if needed
                      }
                      : null,
                  }}
                  onConfirmBooking={() => {
                    // Refresh the data after booking
                    fetchData();
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Child Selection Dropdown */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600">
            {/* User/child icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
            </svg>
          </span>
          <Label htmlFor="child-select" className="text-sm font-medium text-gray-700">Select Child:</Label>
          <div className="relative w-full max-w-xs">
            <select
              id="child-select"
              className="appearance-none w-full border rounded-xl px-4 py-2 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-base font-semibold text-gray-700 transition-all duration-150"
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
            >
              <option value="all">All Sessions</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
            {/* Chevron Down Icon */}
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Appointment Card(s) */}
        {selectedChildId === "all" ? (
          <AppointmentCard
            key="all"
            child={{ id: "all", firstName: "All", lastName: "Children", therapist: null }}
            upcomingAppointments={appointments.filter(apt => apt.status === 'SCHEDULED').map(apt => {
              const child = children.find(c => c.id === apt.childId);
              return { ...apt, childFirstName: child?.firstName, childLastName: child?.lastName };
            })}

            pastAppointments={appointments.filter(apt => apt.status === 'COMPLETED').map(apt => {
              const child = children.find(c => c.id === apt.childId);
              return { ...apt, childFirstName: child?.firstName, childLastName: child?.lastName };
            })}
            cancelledAppointments={appointments.filter(apt => apt.status === 'CANCELLED').map(apt => {
              const child = children.find(c => c.id === apt.childId);
              return { ...apt, childFirstName: child?.firstName, childLastName: child?.lastName };
            })}
            noShowAppointments={appointments.filter(apt => apt.status === 'NO_SHOW').map(apt => {
              const child = children.find(c => c.id === apt.childId);
              return { ...apt, childFirstName: child?.firstName, childLastName: child?.lastName };
            })}
            onTherapistClick={() => { }}
            formatDate={formatDate}
            isHighlighted={false}
            onSessionCancelled={fetchData}
            customUpcomingComponent={
              <UpcomingAppointmentsWithSections
                upcomingAppointments={appointments.filter(apt => apt.status === 'SCHEDULED').map(apt => {
                  const child = children.find(c => c.id === apt.childId);
                  return { ...apt, childFirstName: child?.firstName, childLastName: child?.lastName };
                })}
              />
            }
          />
        ) : (
          (() => {
            const child = children.find(c => c.id === selectedChildId);
            if (!child) return null;
            const upcomingAppointments = getChildAppointments(child.id, ['SCHEDULED']);
            const pastAppointments = getChildAppointments(child.id, ['COMPLETED']);
            const cancelledAppointments = getChildAppointments(child.id, ['CANCELLED']);
            const noShowAppointments = getChildNoShowSessions(selectedChildId);
            return (
              <AppointmentCard
                key={child.id}
                child={child}
                upcomingAppointments={upcomingAppointments}
                pastAppointments={pastAppointments}
                cancelledAppointments={cancelledAppointments}
                noShowAppointments={noShowAppointments}
                onTherapistClick={(therapist) => {
                  setSelectedTherapist(therapist);
                  setShowTherapistModal(true);
                }}
                formatDate={formatDate}
                isHighlighted={false}
                onSessionCancelled={fetchData}
                customUpcomingComponent={
                  <UpcomingAppointmentsWithSections
                    upcomingAppointments={upcomingAppointments}
                  />
                }
              />
            );
          })()
        )}

        {children.length === 0 && <EmptyState type="no-children" />}
      </div>

      {/* Therapist Details Modal */}
      <TherapistModal
        therapist={selectedTherapist}
        isOpen={showTherapistModal}
        onClose={() => setShowTherapistModal(false)}
      />

      {/* Reschedule Modal (opened by page-level handlers) */}
      <RescheduleModal
        appointment={selectedSessionToReschedule}
        open={showRescheduleModal}
        onOpenChange={(open) => {
          setShowRescheduleModal(open);
          if (!open) setSelectedSessionToReschedule(null);
        }}
        onRescheduleSuccess={handleRescheduleConfirmed}
      />

      {/* Cancel Session Modal */}
      <SessionCancellationDialog
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedSessionToCancel(null);
        }}
        session={selectedSessionToCancel ? {
          id: selectedSessionToCancel.id,
          scheduledAt: selectedSessionToCancel.date + 'T' + selectedSessionToCancel.time + ':00',
          patientName: selectedSessionToCancel.childFirstName && selectedSessionToCancel.childLastName
            ? `${selectedSessionToCancel.childFirstName} ${selectedSessionToCancel.childLastName}`
            : children.find(c => c.id === selectedSessionToCancel.childId)?.firstName + " " + children.find(c => c.id === selectedSessionToCancel.childId)?.lastName,
          therapistName: selectedSessionToCancel.therapist
        } : null}
        onSessionCancelled={handleCancelConfirmed}
      />
    </div>
  );
}