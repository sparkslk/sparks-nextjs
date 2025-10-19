"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Plus,
  Calendar,
  Trash2,
  CalendarDays,
  ListChecks,
  Edit,
  DollarSign,
  Gift,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AddAvailabilityModal } from "@/components/therapist/availability/AddAvailabilityModal";
import { WeeklyCalendarView } from "@/components/therapist/availability/WeeklyCalendarView";
import { toast } from "sonner";

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
  const [modalInitialData, setModalInitialData] = useState<{
    date?: string;
    startTime?: string;
    endTime?: string;
  } | null>(null);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
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
        toast.success(`Successfully created ${result.slotsCreated} availability slots!`);
        setShowAddModal(false);
        fetchAvailability();
      } else {
        const errorData = await response.json();
        if (errorData.conflicts) {
          toast.error(
            `Failed to create slots: ${errorData.error}. First ${errorData.conflicts.length} conflicts found.`
          );
        } else {
          toast.error(`Failed to create slots: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error("Error creating availability:", error);
      toast.error("Failed to create availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /*const handleDeleteSlot = async (slotId: string) => {
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
  };*/

  const handleClearAll = async () => {
    setConfirmAction({
      title: "Clear All Unbooked Slots",
      message: "Are you sure you want to clear all upcoming unbooked availability slots? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await fetch("/api/therapist/availability", {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("All upcoming unbooked slots cleared successfully!");
            fetchAvailability();
          } else {
            const errorData = await response.json();
            toast.error(`Failed to clear slots: ${errorData.error}`);
          }
        } catch (error) {
          console.error("Error clearing slots:", error);
          toast.error("Failed to clear slots. Please try again.");
        }
      },
    });
    setShowConfirmDialog(true);
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

  // Handle editing a slot (toggle free/paid)
  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setShowEditDialog(true);
  };

  // Toggle free/paid status
  const handleToggleFreeStatus = async () => {
    if (!editingSlot) return;

    try {
      const response = await fetch(`/api/therapist/availability/${editingSlot.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFree: !editingSlot.isFree,
        }),
      });

      if (response.ok) {
        toast.success(`Slot updated to ${!editingSlot.isFree ? "Free" : "Paid"} successfully!`);
        setShowEditDialog(false);
        setEditingSlot(null);
        fetchAvailability();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update slot: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      toast.error("Failed to update slot. Please try again.");
    }
  };

  // Delete slot from edit dialog
  const handleDeleteFromDialog = async () => {
    if (!editingSlot) return;

    setConfirmAction({
      title: "Delete Availability Slot",
      message: `Are you sure you want to delete the slot on ${formatDate(editingSlot.date)} at ${formatTime(editingSlot.startTime)}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/therapist/availability/${editingSlot.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Slot deleted successfully!");
            setShowEditDialog(false);
            setEditingSlot(null);
            fetchAvailability();
          } else {
            const errorData = await response.json();
            toast.error(`Failed to delete slot: ${errorData.error}`);
          }
        } catch (error) {
          console.error("Error deleting slot:", error);
          toast.error("Failed to delete slot. Please try again.");
        }
      },
    });
    setShowConfirmDialog(true);
  };

  // Handle calendar slot selection (when user clicks/drags on calendar)
  const handleCalendarSlotSelect = (dayOfWeek: number, startTime: string, endTime: string) => {
    // Get the week dates
    const getWeekDates = (startDate: Date) => {
      const dates = [];
      const firstDay = new Date(startDate);
      const day = firstDay.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      firstDay.setDate(firstDay.getDate() + diff);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + i);
        dates.push(date);
      }
      return dates;
    };

    const weekDates = getWeekDates(selectedWeekStart);
    
    // Convert dayOfWeek (0=Sunday, 1=Monday, etc.) to array index (0=Monday, 6=Sunday)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const selectedDate = weekDates[dayIndex];
    
    // Format date as YYYY-MM-DD
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Set initial data for modal
    setModalInitialData({
      date: dateStr,
      startTime: startTime,
      endTime: endTime,
    });
    
    // Open modal
    setShowAddModal(true);
  };

  // Convert new slot format to old TimeSlot format for calendar
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
        <h1 className="text-3xl font-bold text-[#8159A8] mb-2">
          Manage Availability
        </h1>
        <p className="text-gray-600">
          Set your available time slots. Each slot is 45 minutes long.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Upcoming Slots</p>
                <p className="text-3xl font-bold text-[#8159A8]">{stats.total}</p>
              </div>
              <Calendar className="h-10 w-10 text-[#8159A8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Booked</p>
                <p className="text-3xl font-bold text-[#8159A8]">{stats.booked}</p>
              </div>
              <Clock className="h-10 w-10 text-[#8159A8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-3xl font-bold text-[#8159A8]">{stats.available}</p>
              </div>
              <Clock className="h-10 w-10 text-[#8159A8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Free Sessions</p>
                <p className="text-3xl font-bold text-[#8159A8]">{stats.free}</p>
              </div>
              <Gift className="h-10 w-10 text-[#8159A8]" />
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
            onDragSelect={handleCalendarSlotSelect}
            onSlotClick={(slotId) => {
              const slot = slots.find(s => s.id === slotId);
              if (slot && !slot.isBooked) {
                handleEditSlot(slot);
              }
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
                            onClick={() => !slot.isBooked && handleEditSlot(slot)}
                            className={`p-4 rounded-lg border-2 cursor-pointer ${
                              slot.isBooked
                                ? "border-blue-200 bg-blue-50 cursor-not-allowed"
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
                                <Edit className="h-4 w-4 text-gray-400" />
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

      {/* Add Availability Modal */}
      <AddAvailabilityModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setModalInitialData(null);
        }}
        onSave={handleAddAvailability}
        initialDate={modalInitialData?.date}
        initialStartTime={modalInitialData?.startTime}
        initialEndTime={modalInitialData?.endTime}
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

      {/* Edit Slot Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Availability Slot</DialogTitle>
            <DialogDescription>
              Change the pricing or delete this availability slot
            </DialogDescription>
          </DialogHeader>

          {editingSlot && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold">{formatDate(editingSlot.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-semibold">{formatTime(editingSlot.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">45 minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Status</p>
                    <Badge variant="outline" className={`${
                      editingSlot.isFree 
                        ? "bg-green-100 text-green-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {editingSlot.isFree ? "Free" : "Paid"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleToggleFreeStatus}
                  variant="outline"
                  className="w-full"
                >
                  {editingSlot.isFree ? (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Make Paid
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Make Free
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDeleteFromDialog}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {confirmAction?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              {confirmAction?.message}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setConfirmAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                confirmAction?.onConfirm();
                setShowConfirmDialog(false);
                setConfirmAction(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SetAvailabilityPageNew;
