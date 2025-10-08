"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Plus,
  Save,
  CalendarDays,
  ListChecks,
  Timer,
  Hash,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { WeeklyCalendarView } from "@/components/therapist/availability/WeeklyCalendarView";
import { AddAvailabilityModal } from "@/components/therapist/availability/AddAvailabilityModal";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isRecurring: boolean;
  recurrencePattern?: {
    type: "daily" | "weekly" | "custom";
    days?: number[];
    endDate?: string;
  };
  isActive: boolean;
  isFreeSession?: boolean;
  createdAt?: string;
}

interface SessionSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isActive: boolean;
  parentAvailabilityId: string;
  isFreeSession: boolean;
}

// interface AvailabilityStats {
//   totalHours: number;
//   availableDays: number;
//   maxSessionsPerWeek: number;
//   averageSessionsPerDay: number;
// }

function SetAvailabilityPage(): React.JSX.Element {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [prefilledData, setPrefilledData] = useState<{
    dayOfWeek: number;
    startHour?: number;
    startTime?: string;
    endTime?: string;
    selectedWeekStart: Date;
  } | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchAvailability();
    }
  }, [authStatus, router]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/therapist/availability");
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.availability || []);
      } else {
        console.error("Failed to fetch availability");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = (newSlot: Omit<TimeSlot, "id">) => {
    const slot: TimeSlot = {
      ...newSlot,
      id: Date.now().toString(),
    };
    setTimeSlots([...timeSlots, slot]);
    setShowAddModal(false);
  };

  const handleEditTimeSlot = (updatedSlot: TimeSlot) => {
    setTimeSlots(
      timeSlots.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot))
    );
    setEditingSlot(null);
  };

  const handleDeleteTimeSlot = (slotId: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== slotId));
  };

  const handleToggleSlot = (slotId: string) => {
    setTimeSlots(
      timeSlots.map((slot) =>
        slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
      )
    );
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/therapist/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availability: timeSlots
        }),
      });

      if (response.ok) {
        alert("Availability saved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to save availability: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Failed to save availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // const calculateStats = (): AvailabilityStats => {
  //   const activeSlots = timeSlots.filter((slot) => slot.isActive);

  //   const totalHours = activeSlots.reduce((total, slot) => {
  //     const start = new Date(`1970-01-01T${slot.startTime}:00`);
  //     const end = new Date(`1970-01-01T${slot.endTime}:00`);
  //     const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  //     return total + hours;
  //   }, 0);

  //   const availableDays = new Set(activeSlots.map((slot) => slot.dayOfWeek))
  //     .size;

  //   const maxSessionsPerWeek = activeSlots.reduce((total, slot) => {
  //     const start = new Date(`1970-01-01T${slot.startTime}:00`);
  //     const end = new Date(`1970-01-01T${slot.endTime}:00`);
  //     const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  //     const sessionMinutes = slot.sessionDuration + slot.breakBetweenSessions;
  //     const sessionsPerDay = Math.floor(totalMinutes / sessionMinutes);

  //     const daysPerWeek = slot.recurrencePattern?.days?.length || 1;
  //     return total + sessionsPerDay * daysPerWeek;
  //   }, 0);

  //   const averageSessionsPerDay =
  //     availableDays > 0 ? maxSessionsPerWeek / availableDays : 0;

  //   return {
  //     totalHours,
  //     availableDays,
  //     maxSessionsPerWeek,
  //     averageSessionsPerDay,
  //   };
  // };

  const generateSessionSlots = (timeSlots: TimeSlot[]): SessionSlot[] => {
    const sessionSlots: SessionSlot[] = [];
    const SESSION_DURATION = 45; // Fixed 45-minute sessions
    const BREAK_DURATION = 15; // Fixed 15-minute breaks

    timeSlots.forEach((slot) => {
      if (!slot.isActive) return;

      // Get the days this slot applies to
      let applicableDays: number[] = [];
      
      if (slot.recurrencePattern?.days && slot.recurrencePattern.days.length > 0) {
        // Use the specified days from recurrence pattern (already in 1-7 format)
        applicableDays = slot.recurrencePattern.days;
      } else if (slot.isRecurring && slot.recurrencePattern?.type === "daily") {
        // Daily recurrence applies to all days (1-7)
        applicableDays = [1, 2, 3, 4, 5, 6, 7];
      } else {
        // Single day (already in 1-7 format)
        applicableDays = [slot.dayOfWeek];
      }

      applicableDays.forEach((dayOfWeek) => {
        const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
        const endTime = new Date(`1970-01-01T${slot.endTime}:00`);

        const currentTime = new Date(startTime);
        let sessionCount = 0;

        while (currentTime < endTime) {
          const sessionEnd = new Date(currentTime);
          sessionEnd.setMinutes(
            currentTime.getMinutes() + SESSION_DURATION
          );

          if (sessionEnd <= endTime) {
            sessionSlots.push({
              id: `${slot.id}-${dayOfWeek}-${sessionCount}`,
              startTime: `${currentTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${currentTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}`,
              endTime: `${sessionEnd
                .getHours()
                .toString()
                .padStart(2, "0")}:${sessionEnd
                .getMinutes()
                .toString()
                .padStart(2, "0")}`,
              dayOfWeek,
              isActive: slot.isActive,
              parentAvailabilityId: slot.id,
              isFreeSession: slot.isFreeSession || false,
            });

            // Move to next session (45 minutes + 15 minute break)
            currentTime.setMinutes(
              currentTime.getMinutes() + SESSION_DURATION + BREAK_DURATION
            );
            sessionCount++;
          } else {
            break;
          }
        }
      });
    });

    return sessionSlots;
  };

  const sessionSlots = generateSessionSlots(timeSlots);

  const getStats = () => {
    // Convert current JS day (0=Sunday) to DB format (1=Monday, 7=Sunday)
    const todayJsDay = new Date().getDay();
    const todayDbDay = todayJsDay === 0 ? 7 : todayJsDay;
    
    const sessionsToday = sessionSlots.filter(
      (slot) => slot.dayOfWeek === todayDbDay && slot.isActive
    ).length;

    const availableDaysSet = new Set(
      sessionSlots.filter((slot) => slot.isActive).map((slot) => slot.dayOfWeek)
    );
    const availableDays = availableDaysSet.size;

    let totalMinutes = 0;
    sessionSlots.forEach((slot) => {
      if (slot.isActive) {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        totalMinutes += eh * 60 + em - (sh * 60 + sm);
      }
    });
    const totalHours = totalMinutes / 60;

    const totalSessions = sessionSlots.filter((slot) => slot.isActive).length;

    return { sessionsToday, availableDays, totalHours, totalSessions };
  };

  const stats = getStats();

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSlot(null);
    setPrefilledData(null);
  };

  const handleDragSelect = (dayOfWeek: number, startTime: string, endTime: string) => {
    setPrefilledData({ 
      dayOfWeek, 
      startTime, 
      endTime, 
      selectedWeekStart 
    });
    setShowAddModal(true);
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading availability settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#8159A8]">
            Set Availability
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your schedule and set recurring availability patterns
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Availability
          </Button>
          <Button
            onClick={handleSaveAvailability}
            disabled={saving}
            variant="outline"
            className="border-[#8159A8] text-[#8159A8] hover:bg-[#F5F3FB]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8159A8] mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ background: "#F5F3FB" }}>
                <ListChecks className="h-6 w-6" color="#8159A8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Sessions Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.sessionsToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ background: "#F5F3FB" }}>
                <CalendarDays className="h-6 w-6" color="#8159A8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Days (This Week)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.availableDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ background: "#F5F3FB" }}>
                <Timer className="h-6 w-6" color="#8159A8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Hours (This Week)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalHours.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ background: "#F5F3FB" }}>
                <Hash className="h-6 w-6" color="#8159A8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Sessions (This Week)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <WeeklyCalendarView
            timeSlots={timeSlots}
            sessionSlots={sessionSlots}
            selectedWeekStart={selectedWeekStart}
            onWeekChange={setSelectedWeekStart}
            onEditSlot={setEditingSlot}
            onDeleteSlot={handleDeleteTimeSlot}
            onToggleSlot={handleToggleSlot}
            onDragSelect={handleDragSelect}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#8159A8]">
                Session Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionSlots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#F5F3FB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-[#8159A8]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No session slots available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your first availability slot to start accepting
                    appointments
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Availability
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group session slots by day */}
                  {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
                    const daySlots = sessionSlots.filter(slot => slot.dayOfWeek === dayOfWeek && slot.isActive);
                    if (daySlots.length === 0) return null;
                    
                    const dayName = [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday"
                    ][dayOfWeek - 1];

                    return (
                      <div key={dayOfWeek} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          {dayName}
                          <Badge variant="outline" className="text-xs">
                            {daySlots.length} session{daySlots.length !== 1 ? 's' : ''}
                          </Badge>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {daySlots.map((sessionSlot) => (
                            <div
                              key={sessionSlot.id}
                              className="p-3 border rounded bg-white hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm text-gray-900">
                                    {sessionSlot.startTime} - {sessionSlot.endTime}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Individual Session Slot
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    sessionSlot.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {sessionSlot.isActive ? "Available" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Modal */}
      <AddAvailabilityModal
        isOpen={showAddModal || editingSlot !== null}
        onClose={handleCloseModal}
        onSave={(slot) => {
          if ("id" in slot) {
            handleEditTimeSlot(slot);
          } else {
            handleAddTimeSlot(slot);
          }
        }}
        editingSlot={editingSlot}
        prefilledData={prefilledData}
      />
  );

export default SetAvailabilityPage;
    </div>
  );
}

export default SetAvailabilityPage;
