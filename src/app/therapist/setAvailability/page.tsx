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
  Calendar,
  Trash2,
  AlertCircle,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AddAvailabilityModal } from "@/components/therapist/availability/AddAvailabilityModal";
import { WeeklyCalendarView } from "@/components/therapist/availability/WeeklyCalendarView";

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  isBooked: boolean;
  isFree: boolean;
}

interface AvailabilityData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recurrenceType: "None" | "Daily" | "Weekly" | "Monthly" | "Custom";
  selectedDays?: number[];
  isFree: boolean;
}

function SetAvailabilityPageNew(): React.JSX.Element {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");

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
        setSlots(data.slots || []);
      } else {
        console.error("Failed to fetch availability");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async (data: AvailabilityData) => {
    setSaving(true);
    try {
      const response = await fetch("/api/therapist/availability/bulk-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully created ${result.slotsCreated} availability slots!`);
        setShowAddModal(false);
        fetchAvailability();
      } else {
        const errorData = await response.json();
        if (errorData.conflicts) {
          alert(
            `Failed to create slots: ${errorData.error}\n\nFirst ${errorData.conflicts.length} conflicts:\n${errorData.conflicts.join('\n')}`
          );
        } else {
          alert(`Failed to create slots: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error("Error creating availability:", error);
      alert("Failed to create availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    try {
      const response = await fetch(`/api/therapist/availability/${slotId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Slot deleted successfully!");
        fetchAvailability();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete slot: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      alert("Failed to delete slot. Please try again.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all unbooked availability slots?")) {
      return;
    }

    try {
      const response = await fetch("/api/therapist/availability", {
        method: "DELETE",
      });

      if (response.ok) {
        alert("All unbooked slots cleared successfully!");
        fetchAvailability();
      } else {
        const errorData = await response.json();
        alert(`Failed to clear slots: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error clearing slots:", error);
      alert("Failed to clear slots. Please try again.");
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

  // Convert new slot format to old TimeSlot format for calendar
  const convertSlotsToTimeSlots = () => {
    // Group slots by their recurrence pattern (same time, different dates)
    const timeSlotMap = new Map<string, {
      id: string;
      startTime: string;
      endTime: string;
      dates: Date[];
      isFree: boolean;
    }>();

    slots.forEach(slot => {
      const key = `${slot.startTime}-${slot.isFree}`;
      const slotDate = new Date(slot.date);
      
      if (!timeSlotMap.has(key)) {
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const endHours = hours;
        const endMinutes = minutes + 45;
        const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}:00`;
        
        timeSlotMap.set(key, {
          id: slot.id,
          startTime: slot.startTime,
          endTime,
          dates: [slotDate],
          isFree: slot.isFree
        });
      } else {
        timeSlotMap.get(key)!.dates.push(slotDate);
      }
    });

    // Convert to TimeSlot format
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
    }> = [];

    timeSlotMap.forEach((value) => {
      // For each unique date, create a TimeSlot
      value.dates.forEach(date => {
        timeSlots.push({
          id: value.id + '-' + date.toISOString(),
          startTime: value.startTime,
          endTime: value.endTime,
          dayOfWeek: date.getDay(),
          isRecurring: false,
          isActive: true,
          isFreeSession: value.isFree,
        });
      });
    });

    return timeSlots;
  };

  // Convert to SessionSlot format (similar to TimeSlot but for sessions)
  const convertSlotsToSessionSlots = () => {
    return slots.map(slot => {
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
        isActive: !slot.isBooked,
        parentAvailabilityId: slot.id,
        isFreeSession: slot.isFree,
      };
    });
  };

  const getFilteredSlots = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (filter === "upcoming") {
      return slots.filter((slot) => slot.date >= today);
    } else if (filter === "past") {
      return slots.filter((slot) => slot.date < today);
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

  const stats = {
    total: slots.length,
    booked: slots.filter((s) => s.isBooked).length,
    available: slots.filter((s) => !s.isBooked).length,
    free: slots.filter((s) => s.isFree).length,
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
        <h1 className="text-3xl font-bold text-[#8159A8] mb-2">
          Manage Availability
        </h1>
        <p className="text-gray-600">
          Set your available time slots. Each slot is 45 minutes long.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-[#8159A8]">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#8159A8] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-blue-600">{stats.booked}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free Sessions</p>
                <p className="text-2xl font-bold text-amber-600">{stats.free}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Calendar and List Views */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "list")} className="space-y-4">
        <div className="flex justify-between items-center">
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={stats.available === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Unbooked
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#8159A8] hover:bg-[#6D4C93]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Availability
            </Button>
          </div>
        </div>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="mt-0">
          <WeeklyCalendarView
            timeSlots={convertSlotsToTimeSlots()}
            sessionSlots={convertSlotsToSessionSlots()}
            selectedWeekStart={selectedWeekStart}
            onWeekChange={setSelectedWeekStart}
            onDragSelect={(dayOfWeek, startTime, endTime) => {
              // Optional: Handle drag selection
              console.log("Drag select:", { dayOfWeek, startTime, endTime });
            }}
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
                <p className="text-gray-600 mb-4">
                  Click &quot;Add Availability&quot; to create your first time slots.
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#8159A8] hover:bg-[#6D4C93]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Availability
                </Button>
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
                                : "border-gray-200 bg-white hover:border-[#8159A8] transition-colors"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#8159A8]" />
                                <span className="font-semibold">
                                  {formatTime(slot.startTime)}
                                </span>
                              </div>
                              {!slot.isBooked && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

      {/* Add Availability Modal */}
      <AddAvailabilityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAvailability}
      />

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <LoadingSpinner />
              <span className="text-lg">Creating availability slots...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SetAvailabilityPageNew;
