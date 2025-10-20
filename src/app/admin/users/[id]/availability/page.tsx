"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  CalendarDays,
  ListChecks,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { WeeklyCalendarView } from "@/components/therapist/availability/WeeklyCalendarView";

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  isBooked: boolean;
  isFree: boolean;
}

interface TherapistInfo {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  licenseNumber?: string;
}

function TherapistAvailabilityViewPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const therapistId = params.id as string;
  
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    if (therapistId) {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapistId]);

  // Therapist header info will be set from the availability API response

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${therapistId}/availability`);
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
        if (data.therapist) {
          setTherapist(data.therapist);
        }
      } else {
        console.error("Failed to fetch availability");
        toast.error("Failed to fetch therapist availability");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to fetch therapist availability");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const convertSlotsToTimeSlots = () => {
    // Get the week range for filtering
    const getWeekRange = (startDate: Date) => {
      const firstDay = new Date(startDate);
      const day = firstDay.getDay();
      const diff = day === 0 ? -6 : 1 - day; // if Sunday (0), go back 6 days, else go to Monday
      firstDay.setDate(firstDay.getDate() + diff);
      firstDay.setHours(0, 0, 0, 0);
      
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      lastDay.setHours(23, 59, 59, 999);
      
      return { start: firstDay, end: lastDay };
    };

    const weekRange = getWeekRange(selectedWeekStart);

    // Filter slots to only include those in the selected week
    const weekSlots = slots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= weekRange.start && slotDate <= weekRange.end;
    });

    // Convert directly without grouping to preserve individual slot information
    const timeSlots: Array<{
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
      isBooked?: boolean;
    }> = [];

    weekSlots.forEach(slot => {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const endHours = hours;
      const endMinutes = minutes + 45;
      const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}:00`;
      const slotDate = new Date(slot.date);
      
      timeSlots.push({
        id: slot.id,
        startTime: slot.startTime,
        endTime,
        dayOfWeek: slotDate.getDay(),
        isRecurring: false,
        isActive: true, // Always true for display, booking status handled separately
        isFreeSession: slot.isFree,
        isBooked: slot.isBooked, // Pass booking status
      });
    });

    return timeSlots;
  };

  // Convert to SessionSlot format (similar to TimeSlot but for sessions)
  const convertSlotsToSessionSlots = () => {
    // Get the week range for filtering
    const getWeekRange = (startDate: Date) => {
      const firstDay = new Date(startDate);
      const day = firstDay.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      firstDay.setDate(firstDay.getDate() + diff);
      firstDay.setHours(0, 0, 0, 0);
      
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      lastDay.setHours(23, 59, 59, 999);
      
      return { start: firstDay, end: lastDay };
    };

    const weekRange = getWeekRange(selectedWeekStart);

    // Filter slots to only include those in the selected week
    const weekSlots = slots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= weekRange.start && slotDate <= weekRange.end;
    });

    return weekSlots.map(slot => {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const endHours = hours;
      const endMinutes = minutes + 45;
      const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}:00`;
      const slotDate = new Date(slot.date);
      
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime,
        dayOfWeek: slotDate.getDay(),
        isActive: true, // Always show as active (not deleted)
        parentAvailabilityId: slot.id,
        isFreeSession: slot.isFree,
        isBooked: slot.isBooked, // Pass booking status separately
      };
    });
  };

  const getFilteredSlots = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;

    if (filter === "upcoming") {
      return slots.filter((slot) => {
        // Future dates are always included
        if (slot.date > today) {
          return true;
        }
        // Today's slots: only include if they haven't started yet
        if (slot.date === today) {
          const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
          const slotTotalMinutes = slotHour * 60 + slotMinute;
          return slotTotalMinutes > currentTotalMinutes;
        }
        // Past dates are excluded
        return false;
      });
    } else if (filter === "past") {
      return slots.filter((slot) => {
        // Past dates are always included
        if (slot.date < today) {
          return true;
        }
        // Today's slots: only include if they have passed
        if (slot.date === today) {
          const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
          const slotTotalMinutes = slotHour * 60 + slotMinute;
          return slotTotalMinutes <= currentTotalMinutes;
        }
        // Future dates are excluded
        return false;
      });
    }
    return slots;
  };

  const groupSlotsByDate = (slots: AvailabilitySlot[]) => {
    const grouped: { [date: string]: AvailabilitySlot[] } = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const filteredSlots = getFilteredSlots();
  const groupedSlots = groupSlotsByDate(filteredSlots);
  const dates = Object.keys(groupedSlots).sort();

  // Calculate stats for upcoming slots only (from the very next slot onwards)
  const getUpcomingSlots = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;

    return slots.filter((slot) => {
      // Future dates are always included
      if (slot.date > today) {
        return true;
      }
      // Today's slots: only include if they haven't started yet
      if (slot.date === today) {
        const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
        const slotTotalMinutes = slotHour * 60 + slotMinute;
        return slotTotalMinutes > currentTotalMinutes;
      }
      // Past dates are excluded
      return false;
    });
  };

  const upcomingSlots = getUpcomingSlots();

  const stats = {
    total: upcomingSlots.length,
    booked: upcomingSlots.filter((s) => s.isBooked).length,
    available: upcomingSlots.filter((s) => !s.isBooked).length,
    free: upcomingSlots.filter((s) => s.isFree && !s.isBooked).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-[#8159A8]">
            {therapist?.name ? therapist.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#8159A8] mb-1">
              {therapist?.name || 'Therapist'} Availability
            </h1>
            <p className="text-gray-600">
              Viewing availability schedule for {therapist?.name || 'this therapist'}
            </p>
            {therapist?.specialization && (
              <p className="text-sm text-gray-500">
                Specialization: {therapist.specialization}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-[#8159A8]">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.booked}</div>
              <p className="text-sm text-gray-600">Booked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <p className="text-sm text-gray-600">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{stats.free}</div>
              <p className="text-sm text-gray-600">Free Sessions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Calendar and List Views */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "list")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="mt-0">
          <WeeklyCalendarView
            timeSlots={convertSlotsToTimeSlots()}
            sessionSlots={convertSlotsToSessionSlots()}
            selectedWeekStart={selectedWeekStart}
            onWeekChange={setSelectedWeekStart}
            onDragSelect={() => {}} // Disabled for view-only
            onSlotClick={() => {}} // Disabled for view-only
          />
        </TabsContent>

        {/* List View Tab */}
        <TabsContent value="list" className="mt-0 space-y-4">
          {/* Filter Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  variant={filter === "upcoming" ? "default" : "outline"}
                  onClick={() => setFilter("upcoming")}
                  className={filter === "upcoming" ? "bg-[#8159A8]" : ""}
                >
                  Upcoming
                </Button>
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-[#8159A8]" : ""}
                >
                  All
                </Button>
                <Button
                  variant={filter === "past" ? "default" : "outline"}
                  onClick={() => setFilter("past")}
                  className={filter === "past" ? "bg-[#8159A8]" : ""}
                >
                  Past
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slots List */}
          {dates.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Availability Slots
                </h3>
                <p className="text-gray-600">
                  This therapist has not set any availability slots yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dates.map((date) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#8159A8]" />
                      {formatDate(date)}
                      <Badge variant="outline">{groupedSlots[date].length} slots</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {groupedSlots[date]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-4 rounded-lg border-2 ${
                              slot.isBooked
                                ? "border-blue-200 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#8159A8]" />
                                <span className="font-semibold">
                                  {formatTime(slot.startTime)}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-xs bg-[#8159A8] text-white"
                              >
                                45min
                              </Badge>
                              {slot.isBooked && (
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                  Booked
                                </Badge>
                              )}
                              {slot.isFree && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                  Free
                                </Badge>
                              )}
                              {!slot.isFree && !slot.isBooked && (
                                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                                  Paid
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TherapistAvailabilityViewPage;
