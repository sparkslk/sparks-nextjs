"use client";

import { useState, useEffect } from "react";
import AppointmentsHeader from "@/components/parent/appointments/AppointmentsHeader";
import AppointmentCard from "@/components/parent/appointments/AppointmentCard";
import TherapistModal from "@/components/parent/appointments/TherapistModal";
import EmptyState from "@/components/parent/appointments/EmptyState";
import { Child, Appointment } from "@/types/appointments";
// import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Child['therapist'] | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  // const [highlightedChildId, setHighlightedChildId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | "all">("all");
  const router = useRouter();

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
              therapistPBune: string;
              specializations: string[];
              mode: string;
              objectives: string[];
            }) => ({
              id: session.id,
              date: session.date,
              time: session.time, // Use backend-formatted time string directly
              type: session.sessionType,
              status: session.status,
              childId: session.childId,
              duration: session.duration,
              sessionStatus: session.status,
              notes: session.notes,
              therapist: session.therapist,
              therapistEmail: session.therapistEmail,
              // therapistPhone: session.therapistPhone,
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

  const getChildAppointments = (childId: string, statuses: Array<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>) => {
    return appointments.filter(apt => apt.childId === childId && statuses.includes(apt.status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
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
                <span className="text-gray-500 text-sm">{child.therapist ? `Therapist: ${child.therapist.name || child.therapist}` : 'No therapist assigned'}</span>
              </div>
              {child.therapist ? (
                <button
                  className="w-40 px-4 py-2 rounded-lg font-semibold transition text-white text-center"
                  style={{ backgroundColor: '#8159A8' }}
                  onClick={() => {/* Implement schedule logic here */}}
                >
                  Schedule Session
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
              <option value="all">All Appoinments</option>
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
            onTherapistClick={() => {}}
            formatDate={formatDate}
            isHighlighted={false}
          />
        ) : (
          (() => {
            const child = children.find(c => c.id === selectedChildId);
            if (!child) return null;
            const upcomingAppointments = getChildAppointments(child.id, ['SCHEDULED']);
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
                isHighlighted={false}
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
    </div>
  );
}