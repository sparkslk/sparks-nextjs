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
  Calendar,
  Plus,
  Save,
  Trash2,
  Copy,
  Settings,
  Info,
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
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isRecurring: boolean;
  recurrencePattern?: {
    type: "daily" | "weekly" | "custom";
    days?: number[]; // For custom patterns
    endDate?: string;
  };
  maxSessions?: number;
  sessionDuration: number; // in minutes
  breakBetweenSessions: number; // in minutes
  isActive: boolean;
}

interface SessionSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isActive: boolean;
  parentAvailabilityId: string;
}

interface AvailabilityStats {
  totalHours: number;
  availableDays: number;
  maxSessionsPerWeek: number;
  averageSessionsPerDay: number;
}

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
    startHour: number;
    selectedWeekStart: Date;
  } | null>(null);

  const todayDayOfWeek = new Date().getDay();

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

  const handleDuplicateSlot = (slot: TimeSlot) => {
    const duplicatedSlot: TimeSlot = {
      ...slot,
      id: Date.now().toString(),
    };
    setTimeSlots([...timeSlots, duplicatedSlot]);
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

  const calculateStats = (): AvailabilityStats => {
    const activeSlots = timeSlots.filter((slot) => slot.isActive);

    const totalHours = activeSlots.reduce((total, slot) => {
      const start = new Date(`1970-01-01T${slot.startTime}:00`);
      const end = new Date(`1970-01-01T${slot.endTime}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

    const availableDays = new Set(activeSlots.map((slot) => slot.dayOfWeek))
      .size;

    const maxSessionsPerWeek = activeSlots.reduce((total, slot) => {
      const start = new Date(`1970-01-01T${slot.startTime}:00`);
      const end = new Date(`1970-01-01T${slot.endTime}:00`);
      const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      const sessionMinutes = slot.sessionDuration + slot.breakBetweenSessions;
      const sessionsPerDay = Math.floor(totalMinutes / sessionMinutes);

      const daysPerWeek = slot.recurrencePattern?.days?.length || 1;
      return total + sessionsPerDay * daysPerWeek;
    }, 0);

    const averageSessionsPerDay =
      availableDays > 0 ? maxSessionsPerWeek / availableDays : 0;

    return {
      totalHours,
      availableDays,
      maxSessionsPerWeek,
      averageSessionsPerDay,
    };
  };

  const generateSessionSlots = (timeSlots: TimeSlot[]): SessionSlot[] => {
    const sessionSlots: SessionSlot[] = [];

    timeSlots.forEach((slot) => {
      if (!slot.isActive) return;

      const days = slot.recurrencePattern?.days || [slot.dayOfWeek];

      days.forEach((dayOfWeek) => {
        const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
        const endTime = new Date(`1970-01-01T${slot.endTime}:00`);

        let currentTime = new Date(startTime);
        let sessionCount = 0;

        while (currentTime < endTime) {
          const sessionEnd = new Date(currentTime);
          sessionEnd.setMinutes(
            currentTime.getMinutes() + slot.sessionDuration
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
            });

            // Move to next session (session duration + break)
            currentTime.setMinutes(
              currentTime.getMinutes() +
                slot.sessionDuration +
                slot.breakBetweenSessions
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
    const sessionsToday = sessionSlots.filter(
      (slot) => slot.dayOfWeek === todayDayOfWeek && slot.isActive
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

  const handleOpenModalWithPrefill = (dayOfWeek: number, startHour: number) => {
    setPrefilledData({ dayOfWeek, startHour, selectedWeekStart });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSlot(null);
    setPrefilledData(null);
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
            onCreateSlot={handleOpenModalWithPrefill}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#8159A8]">
                Availability Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#F5F3FB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-[#8159A8]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No availability set
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
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 border rounded-lg ${
                        slot.isActive
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-300 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {
                                [
                                  "Sunday",
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                ][slot.dayOfWeek]
                              }
                            </h4>
                            <Badge
                              className={
                                slot.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {slot.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {slot.isRecurring && (
                              <Badge variant="outline">Recurring</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Time:</span>
                              <p>
                                {slot.startTime} - {slot.endTime}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">
                                Session Duration:
                              </span>
                              <p>{slot.sessionDuration} minutes</p>
                            </div>
                            <div>
                              <span className="font-medium">Break:</span>
                              <p>{slot.breakBetweenSessions} minutes</p>
                            </div>
                            {slot.recurrencePattern && (
                              <div>
                                <span className="font-medium">Pattern:</span>
                                <p>{slot.recurrencePattern.type}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSlot(slot.id)}
                            className="text-gray-600 hover:text-[#8159A8]"
                          >
                            {slot.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateSlot(slot)}
                            className="text-gray-600 hover:text-[#8159A8]"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSlot(slot)}
                            className="text-gray-600 hover:text-[#8159A8]"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}

export default SetAvailabilityPage;
