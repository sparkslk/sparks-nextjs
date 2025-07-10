"use client";

import { useState, useEffect } from "react";
import AppointmentsHeader from "@/components/parent/appointments/AppointmentsHeader";
import AppointmentCard from "@/components/parent/appointments/AppointmentCard";
import TherapistModal from "@/components/parent/appointments/TherapistModal";
import EmptyState from "@/components/parent/appointments/EmptyState";
import { Child, Appointment } from "@/types/appointments";
// import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AppointmentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Child['therapist'] | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [highlightedChildId, setHighlightedChildId] = useState<string | null>(null);
  const [showZoomedCard, setShowZoomedCard] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | "all">("all");

  useEffect(() => {
    fetchData();
    
    // Check for highlighted child from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const highlightChild = urlParams.get('highlightChild');
    if (highlightChild) {
      setHighlightedChildId(highlightChild);
      // Show zoomed card after a short delay to allow page to load
      setTimeout(() => setShowZoomedCard(true), 500);
    }
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
              status: session.status,
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

  const getChildAppointments = (childId: string, statuses: Array<'APPROVED' | 'REQUESTED' | 'COMPLETED' | 'CANCELLED'>) => {
    return appointments.filter(apt => apt.childId === childId && statuses.includes(apt.status as 'APPROVED' | 'REQUESTED' | 'COMPLETED' | 'CANCELLED'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const handleBackgroundClick = () => {
    setShowZoomedCard(false);
    setHighlightedChildId(null);
    // Remove URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('highlightChild');
    window.history.replaceState({}, '', url.toString());
  };

  const getHighlightedChild = () => {
    return children.find(child => child.id === highlightedChildId);
  };

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
          upcomingSessionsCount={appointments.filter(apt => ['APPROVED', 'REQUESTED'].includes(apt.status)).length}
        />

        {/* Child Selection Dropdown */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <Label htmlFor="child-select" className="text-sm font-medium text-gray-700">Select Child:</Label>
          <select
            id="child-select"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
          >
            <option value="all">All Appoinments</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Card(s) */}
        {selectedChildId === "all" ? (
          <AppointmentCard
            key="all"
            child={{ id: "all", firstName: "All", lastName: "Children", therapist: null }}
            upcomingAppointments={appointments.filter(apt => ['APPROVED', 'REQUESTED'].includes(apt.status))}
            pastAppointments={appointments.filter(apt => apt.status === 'COMPLETED')}
            cancelledAppointments={appointments.filter(apt => apt.status === 'CANCELLED')}
            onTherapistClick={() => {}}
            formatDate={formatDate}
            isHighlighted={false}
          />
        ) : (
          (() => {
            const child = children.find(c => c.id === selectedChildId);
            if (!child) return null;
            const upcomingAppointments = getChildAppointments(child.id, ['APPROVED', 'REQUESTED']);
            const pastAppointments = getChildAppointments(child.id, ['COMPLETED']);
            const cancelledAppointments = getChildAppointments(child.id, ['CANCELLED']);
            return (
              <AppointmentCard
                key={child.id}
                child={child}
                upcomingAppointments={upcomingAppointments}
                pastAppointments={pastAppointments}
                cancelledAppointments={cancelledAppointments}
                onTherapistClick={(therapist) => {
                  setSelectedTherapist(therapist);
                  setShowTherapistModal(true);
                }}
                formatDate={formatDate}
                isHighlighted={child.id === highlightedChildId && !showZoomedCard}
              />
            );
          })()
        )}

        {children.length === 0 && <EmptyState type="no-children" />}
      </div>

      {/* Zoomed Card Overlay */}
      {showZoomedCard && highlightedChildId && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={handleBackgroundClick}
        >
          <div 
            className="w-full max-w-lg sm:max-w-xl md:max-w-2xl transform transition-all duration-300 ease-out scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const highlightedChild = getHighlightedChild();
              if (!highlightedChild) return null;
              
              const upcomingAppointments = getChildAppointments(highlightedChild.id, ['APPROVED', 'REQUESTED']);
              const pastAppointments = getChildAppointments(highlightedChild.id, ['COMPLETED']);
              const cancelledAppointments = getChildAppointments(highlightedChild.id, ['CANCELLED']);
              
              return (
                <AppointmentCard
                  child={highlightedChild}
                  upcomingAppointments={upcomingAppointments}
                  pastAppointments={pastAppointments}
                  cancelledAppointments={cancelledAppointments}
                  onTherapistClick={(therapist) => {
                    setSelectedTherapist(therapist);
                    setShowTherapistModal(true);
                  }}
                  formatDate={formatDate}
                  isHighlighted={false}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Therapist Details Modal */}
      <TherapistModal
        therapist={selectedTherapist}
        isOpen={showTherapistModal}
        onClose={() => setShowTherapistModal(false)}
      />
    </div>
  );
}