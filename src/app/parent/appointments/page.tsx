"use client";

import { useState, useEffect } from "react";
import AppointmentsHeader from "@/components/parent/appointments/AppointmentsHeader";
import AppointmentCard from "@/components/parent/appointments/AppointmentCard";
import TherapistModal from "@/components/parent/appointments/TherapistModal";
import EmptyState from "@/components/parent/appointments/EmptyState";
import { Child, Appointment } from "@/types/appointments";

export default function AppointmentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Child['therapist'] | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [highlightedChildId, setHighlightedChildId] = useState<string | null>(null);
  const [showZoomedCard, setShowZoomedCard] = useState(false);

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
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Enhanced Header */}
        <AppointmentsHeader 
          childrenCount={children.length}
          upcomingSessionsCount={appointments.filter(apt => apt.status === 'upcoming').length}
        />

        {/* Children Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => {
            const upcomingAppointments = getChildAppointments(child.id, 'upcoming');
            const pastAppointments = getChildAppointments(child.id, 'past');

            return (
              <AppointmentCard
                key={child.id}
                child={child}
                upcomingAppointments={upcomingAppointments}
                pastAppointments={pastAppointments}
                onTherapistClick={(therapist) => {
                  console.log("Clicked therapist:", therapist);
                  setSelectedTherapist(therapist);
                  setShowTherapistModal(true);
                }}
                formatDate={formatDate}
                isHighlighted={child.id === highlightedChildId && !showZoomedCard}
              />
            );
          })}
        </div>

        {children.length === 0 && <EmptyState type="no-children" />}
      </div>

      {/* Zoomed Card Overlay */}
      {showZoomedCard && highlightedChildId && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackgroundClick}
        >
          <div 
            className="w-full max-w-2xl transform transition-all duration-300 ease-out scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const highlightedChild = getHighlightedChild();
              if (!highlightedChild) return null;
              
              const upcomingAppointments = getChildAppointments(highlightedChild.id, 'upcoming');
              const pastAppointments = getChildAppointments(highlightedChild.id, 'past');
              
              return (
                <AppointmentCard
                  child={highlightedChild}
                  upcomingAppointments={upcomingAppointments}
                  pastAppointments={pastAppointments}
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