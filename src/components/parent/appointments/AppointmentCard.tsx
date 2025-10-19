import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CalendarDays, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Child, Appointment } from "@/types/appointments";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import RescheduleModal from "./RescheduleModal";
import SessionCancellationDialog from "../SessionCancellationDialog";

interface AppointmentCardProps {
  child: Child;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  cancelledAppointments: Appointment[];
  noShowAppointments: Appointment[];
  onTherapistClick: (therapist: Child['therapist']) => void;
  formatDate: (dateString: string) => string;
  isHighlighted?: boolean;
  onSessionCancelled?: () => void;
  customUpcomingComponent?: React.ReactNode;
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
  noShowAppointments,
  onTherapistClick,
  isHighlighted = false,
  onSessionCancelled,
  customUpcomingComponent
}: AppointmentCardProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'no-show' | 'all'>('all');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedSessionToCancel, setSelectedSessionToCancel] = useState<Appointment | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSessionToReschedule, setSelectedSessionToReschedule] = useState<Appointment | null>(null);
  const [showRateChangeDialog, setShowRateChangeDialog] = useState(false);
  const [rateChangeInfo, setRateChangeInfo] = useState<{
    therapistName: string;
    patientName: string;
    originalRate: number;
    currentRate: number;
  } | null>(null);
  const [checkingReschedule, setCheckingReschedule] = useState(false);

  // New collapsible states for All tab
  const [isPastOpen, setIsPastOpen] = useState<boolean>(false);
  const [isCancelledOpen, setIsCancelledOpen] = useState<boolean>(false);
  const [isNoShowOpen, setIsNoShowOpen] = useState<boolean>(false);

  // Filtering logic for appointments
  let filteredUpcoming = upcomingAppointments;
  let filteredPast = pastAppointments;
  let filteredCancelled = cancelledAppointments;
  let filteredNoShow = noShowAppointments;

  if (activeTab !== 'all') {
    filteredUpcoming = activeTab === 'upcoming' ? upcomingAppointments : [];
    filteredPast = activeTab === 'completed' ? pastAppointments : [];
    filteredCancelled = activeTab === 'cancelled' ? cancelledAppointments : [];
    filteredNoShow = activeTab === 'no-show' ? noShowAppointments : [];
  }
  // console.log(therapySessions);

  const handleCancelSession = (appointment: Appointment) => {
    setSelectedSessionToCancel(appointment);
    setShowCancelDialog(true);
  };

  const handleRescheduleSession = async (appointment: Appointment) => {
    setCheckingReschedule(true);

    try {
      // Check if rescheduling is allowed before opening the modal
      const response = await fetch('/api/parent/sessions/check-reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: appointment.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error: ${result.error}`);
        return;
      }

      if (result.canReschedule) {
        // Rate hasn't changed - proceed with reschedule modal
        setSelectedSessionToReschedule(appointment);
        setShowRescheduleModal(true);
      } else if (result.reason === 'RATE_CHANGED') {
        // Rate has changed - show notice dialog
        setRateChangeInfo({
          therapistName: result.therapistName,
          patientName: result.patientName,
          originalRate: result.originalRate,
          currentRate: result.currentRate,
        });
        setShowRateChangeDialog(true);
      } else {
        // Other reasons (cancelled, completed, etc.)
        alert(result.message);
      }
    } catch (error) {
      console.error('Error checking reschedule eligibility:', error);
      alert('An error occurred while checking if the session can be rescheduled');
    } finally {
      setCheckingReschedule(false);
    }
  };

  const renderUpcomingSessions = () => (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <CalendarDays className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Scheduled Sessions</h3>
      </div>
      {filteredUpcoming.length > 0 ? (
        <div className="space-y-3">
          {filteredUpcoming.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card upcoming relative flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow transition-all duration-300 hover:shadow-lg min-w-0"
            >
              {/* Left side - Avatar and Session Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    {appointment.childFirstName} {appointment.childLastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Therapist: {child.therapist?.name || 'Therapist'}
                  </p>
                </div>
              </div>

              {/* Middle - Session Details */}
              <div className="flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatSriLankaDateTime(appointment.date, { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.time} ({appointment.duration} min)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.type}</span>
                </div>
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleRescheduleSession(appointment)}
                  disabled={checkingReschedule}
                >
                  {checkingReschedule ? 'Checking...' : 'Reschedule'}
                </button>
                <button
                  className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                  onClick={() => handleCancelSession(appointment)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-green-50 border border-green-200 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium"
                >
                  Join Session
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg text-center border border-gray-200">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 text-xs">No scheduled sessions scheduled</p>
        </div>
      )}
    </div>
  );

  // Adjusted renderPastSessions to optionally hide the header so it can be used inside collapsible wrapper
  const renderPastSessions = (showHeader = true) => (
    <div>
      {showHeader && (
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Past Sessions</h3>
        </div>
      )}
      {filteredPast.length > 0 ? (
        <div className="space-y-3">
          {filteredPast.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card past relative flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow transition-all duration-300 hover:shadow-lg min-w-0"
            >
              {/* Left side - Avatar and Session Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    {appointment.childFirstName} {appointment.childLastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Therapist: {child.therapist?.name || 'Therapist'}
                  </p>
                </div>
              </div>

              {/* Middle - Session Details */}
              <div className="flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatSriLankaDateTime(appointment.date, { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.time} ({appointment.duration} min)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.type}</span>
                </div>
              </div>

              {/* Right side - Action Button */}
              <div className="flex items-center space-x-2">
                <button
                  className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                  onClick={() => window.location.href = `/parent/sessions/${appointment.id}`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg text-center border border-gray-200">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 text-xs">No completed sessions</p>
        </div>
      )}
    </div>
  );

  // Adjusted renderCancelledSessions to optionally hide the header so it can be used inside collapsible wrapper
  const renderCancelledSessions = (showHeader = true) => (
    <div>
      {showHeader && (
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-red-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Cancelled Sessions</h3>
        </div>
      )}
      {filteredCancelled.length > 0 ? (
        <div className="space-y-3">
          {filteredCancelled.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card cancelled relative flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow transition-all duration-300 hover:shadow-lg min-w-0"
            >
              {/* Left side - Avatar and Session Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    {appointment.childFirstName} {appointment.childLastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Therapist: {child.therapist?.name || 'Therapist'}
                  </p>
                </div>
              </div>

              {/* Middle - Session Details */}
              <div className="flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatSriLankaDateTime(appointment.date, { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.time} ({appointment.duration} min)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.type}</span>
                </div>
              </div>

              {/* Right side - Status Badge */}
              <div className="flex items-center space-x-2">
                <span className="inline-block bg-red-100 border border-red-300 text-red-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Cancelled
                </span>
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

  // Adjusted renderNoShowSessions to optionally hide the header so it can be used inside collapsible wrapper
  const renderNoShowSessions = (showHeader = true) => (
    <div>
      {showHeader && (
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-orange-600" />
          <h3 className="font-semibold text-gray-900 text-sm">No Show Sessions</h3>
        </div>
      )}
      {filteredNoShow.length > 0 ? (
        <div className="space-y-3">
          {filteredNoShow.map((appointment: Appointment & { childFirstName?: string; childLastName?: string }) => (
            <div
              key={appointment.id}
              className="session-card no-show relative flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow transition-all duration-300 hover:shadow-lg min-w-0"
            >
              {/* Left side - Avatar and Session Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    {appointment.childFirstName} {appointment.childLastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Therapist: {child.therapist?.name || 'Therapist'}
                  </p>
                </div>
              </div>

              {/* Middle - Session Details */}
              <div className="flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatSriLankaDateTime(appointment.date, { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.time} ({appointment.duration} min)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{appointment.type}</span>
                </div>
              </div>

              {/* Right side - Status Badge */}
              <div className="flex items-center space-x-2">
                <span className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  No Show
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg text-center border border-gray-200">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 text-xs">No no-show sessions</p>
        </div>
      )}
    </div>
  );

  const renderAllSessions = () => (
    filteredUpcoming.length > 0 || filteredPast.length > 0 || filteredCancelled.length > 0 || filteredNoShow.length > 0 ? (
      <div className="space-y-4">
        {customUpcomingComponent || renderUpcomingSessions()}

        {/* Collapsible Past Sessions */}
        <div className="border rounded-2xl bg-[var(--color-secondary)]/5 p-0">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsPastOpen(!isPastOpen)}
          >
            <div className="flex items-center gap-3">
              {isPastOpen ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
              <h3 className="text-sm font-semibold text-gray-900">Past Sessions</h3>
            </div>
            <div className="text-sm text-gray-600">{filteredPast.length}</div>
          </div>
          {isPastOpen && <div className="px-4 pb-4 pt-0">{renderPastSessions(false)}</div>}
        </div>

        {/* Collapsible Cancelled Sessions */}
        <div className="border rounded-2xl bg-[var(--color-secondary)]/5 p-0">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsCancelledOpen(!isCancelledOpen)}
          >
            <div className="flex items-center gap-3">
              {isCancelledOpen ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
              <h3 className="text-sm font-semibold text-gray-900">Cancelled Sessions</h3>
            </div>
            <div className="text-sm text-gray-600">{filteredCancelled.length}</div>
          </div>
          {isCancelledOpen && <div className="px-4 pb-4 pt-0">{renderCancelledSessions(false)}</div>}
        </div>

        {/* Collapsible No Show Sessions */}
        <div className="border rounded-2xl bg-[var(--color-secondary)]/5 p-0">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsNoShowOpen(!isNoShowOpen)}
          >
            <div className="flex items-center gap-3">
              {isNoShowOpen ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
              <h3 className="text-sm font-semibold text-gray-900">No Show Sessions</h3>
            </div>
            <div className="text-sm text-gray-600">{filteredNoShow.length}</div>
          </div>
          {isNoShowOpen && <div className="px-4 pb-4 pt-0">{renderNoShowSessions(false)}</div>}
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
          style={{ backgroundColor: 'var(--color-primary)' }}
          onClick={() => window.location.href = '/parent/findTherapist'}
        >
          {child.therapist ? "Book Session" : "Find a Therapist"}
        </Button>
      </div>
    )
  );

  return (
    <Card className={`appointments-card bg-[var(--color-card)]/80 backdrop-blur-sm shadow-lg border hover:shadow-xl transition-all duration-300 ${isHighlighted
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
          {/* {child.therapist && (
            <Button
              size="sm"
              className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-xs px-3 py-1"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onClick={() => window.location.href = '/parent/bookSession'}
            >
              Book Session
            </Button>
          )} */}
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
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'upcoming' | 'completed' | 'cancelled' | 'no-show' | 'all')} className="w-full">
          <TabsList className="w-full flex bg-[var(--color-secondary)]/30 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <TabsTrigger value="upcoming" className="flex-1 text-xs sm:text-sm">
              Scheduled ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 text-xs sm:text-sm">
              Completed ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 text-xs sm:text-sm">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="no-show" className="flex-1 text-xs sm:text-sm">
              No Show ({noShowAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">
              All ({upcomingAppointments.length + pastAppointments.length + cancelledAppointments.length + noShowAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="px-0 sm:px-4">
            {renderAllSessions()}
          </TabsContent>

          <TabsContent value="upcoming" className="px-0 sm:px-4">
            {customUpcomingComponent || renderUpcomingSessions()}
          </TabsContent>

          <TabsContent value="completed" className="px-0 sm:px-4">
            {renderPastSessions()}
          </TabsContent>

          <TabsContent value="cancelled" className="px-0 sm:px-4">
            {renderCancelledSessions()}
          </TabsContent>

          <TabsContent value="no-show" className="px-0 sm:px-4">
            {renderNoShowSessions()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Session Dialog */}
      <SessionCancellationDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setSelectedSessionToCancel(null);
        }}
        session={selectedSessionToCancel ? {
          id: selectedSessionToCancel.id,
          scheduledAt: selectedSessionToCancel.date,
          patientName: `${child.firstName} ${child.lastName}`,
          therapistName: child.therapist?.name || 'Therapist'
        } : null}
        onSessionCancelled={() => {
          setShowCancelDialog(false);
          setSelectedSessionToCancel(null);
          setShowSuccessDialog(true);
          onSessionCancelled?.();
        }}
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Session Cancelled Successfully!</DialogTitle>
            <DialogDescription>
              Your therapy session has been cancelled and the therapist has been notified.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              The page will refresh automatically in a moment...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate Change Notice Dialog */}
      <Dialog open={showRateChangeDialog} onOpenChange={setShowRateChangeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-600">Rate Change Notice</DialogTitle>
            <DialogDescription>
              The therapist has updated their session rates since your original booking.
            </DialogDescription>
          </DialogHeader>

          {rateChangeInfo && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="text-sm"><strong>Patient:</strong> {rateChangeInfo.patientName}</p>
                  <p className="text-sm"><strong>Therapist:</strong> {rateChangeInfo.therapistName}</p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">Original Rate:</p>
                      <p className="font-semibold text-green-600">LKR {rateChangeInfo.originalRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Current Rate:</p>
                      <p className="font-semibold text-amber-600">LKR {rateChangeInfo.currentRate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">What you can do:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• If you can&apos;t attend the scheduled session, please cancel this appointment</li>
                  <li>• Make a new booking at the current rate of LKR {rateChangeInfo.currentRate}</li>
                  <li>• Contact the therapist directly to discuss the rate change</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRateChangeDialog(false)}
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <RescheduleModal
        open={showRescheduleModal}
        onOpenChange={setShowRescheduleModal}
        appointment={selectedSessionToReschedule}
        onRescheduleSuccess={() => {
          setSelectedSessionToReschedule(null);
          if (onSessionCancelled) {
            onSessionCancelled();
          } else {
            window.location.reload();
          }
        }}
      />

      {/* Cancel Session Modal */}
      <SessionCancellationDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setSelectedSessionToCancel(null);
        }}
        session={selectedSessionToCancel ? {
          id: selectedSessionToCancel.id,
          scheduledAt: selectedSessionToCancel.date + 'T' + selectedSessionToCancel.time + ':00',
          patientName: selectedSessionToCancel.childFirstName && selectedSessionToCancel.childLastName
            ? `${selectedSessionToCancel.childFirstName} ${selectedSessionToCancel.childLastName}`
            : 'Patient',
          therapistName: selectedSessionToCancel.therapist
        } : null}
        onSessionCancelled={() => {
          setShowCancelDialog(false);
          setSelectedSessionToCancel(null);
          if (onSessionCancelled) {
            onSessionCancelled();
          } else {
            window.location.reload();
          }
        }}
      />
    </Card>
  );
}