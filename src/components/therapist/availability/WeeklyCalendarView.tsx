"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
} from "lucide-react";

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
  sessionDuration: number;
  breakBetweenSessions: number;
  isActive: boolean;
  rate?: number; // New field for session rate
}

interface SessionSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isActive: boolean;
  parentAvailabilityId: string;
}

interface WeeklyCalendarViewProps {
  timeSlots: TimeSlot[];
  sessionSlots: SessionSlot[];
  selectedWeekStart: Date;
  onWeekChange: (date: Date) => void;
  onEditSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onToggleSlot: (slotId: string) => void;
  onCreateSlot: (dayOfWeek: number, startHour: number) => void;
  onDragSelect?: (dayOfWeek: number, startTime: string, endTime: string) => void; // New prop
}

export function WeeklyCalendarView({
  timeSlots,
  sessionSlots,
  selectedWeekStart,
  onWeekChange,
  onEditSlot,
  onDeleteSlot,
  onToggleSlot,
  onCreateSlot,
  onDragSelect,
}: WeeklyCalendarViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);
  const [dragStart, setDragStart] = useState<{day: number; timeSlot: number} | null>(null);
  const [dragEnd, setDragEnd] = useState<{day: number; timeSlot: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Updated time slots for 15-minute increments from 7 AM to 10 PM
  const timeSlots15Min = Array.from({ length: (22 - 7) * 4 }, (_, i) => {
    const totalMinutes = 7 * 60 + i * 30; // Start from 7 AM
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      hour: hours,
      minute: minutes,
      timeString: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
      displayTime: formatTimeDisplay(hours, minutes)
    };
  });

  function formatTimeDisplay(hours: number, minutes: number): string {
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    const minuteStr = minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
    return `${hour12}${minuteStr} ${ampm}`;
  }

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeekStart);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(
      selectedWeekStart.getDate() + (direction === "next" ? 7 : -7)
    );
    onWeekChange(newDate);
  };

  const getSessionSlotsForDay = (dayOfWeek: number) => {
    return sessionSlots.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  const getAvailabilitySlotById = (parentId: string) => {
    return timeSlots.find((slot) => slot.id === parentId);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSlotPosition = (startTime: string, endTime: string) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    return {
      top: `${(startHour / 24) * 100}%`,
      height: `${((endHour - startHour) / 24) * 100}%`,
    };
  };

  const handleCellClick = (dayOfWeek: number, hour: number) => {
    const existingSlot = getSessionSlotsForDay(dayOfWeek).find((slot) => {
      const slotStart = parseInt(slot.startTime.split(":")[0]);
      const slotEnd = parseInt(slot.endTime.split(":")[0]);
      return hour >= slotStart && hour < slotEnd;
    });

    if (!existingSlot) {
      onCreateSlot(dayOfWeek, hour);
    }
  };

  const handleCellMouseEnter = (dayOfWeek: number, hour: number) => {
    const existingSlot = getSessionSlotsForDay(dayOfWeek).find((slot) => {
      const slotStart = parseInt(slot.startTime.split(":")[0]);
      const slotEnd = parseInt(slot.endTime.split(":")[0]);
      return hour >= slotStart && hour < slotEnd;
    });

    if (!existingSlot) {
      setHoveredCell({ day: dayOfWeek, hour });
    }
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleMouseDown = (dayIndex: number, timeSlotIndex: number) => {
    const hasSlot = getSessionSlotsForDay(dayIndex).some((slot) => {
      const slotStartMinutes = timeStringToMinutes(slot.startTime);
      const slotEndMinutes = timeStringToMinutes(slot.endTime);
      const currentMinutes = timeSlots15Min[timeSlotIndex].hour * 60 + timeSlots15Min[timeSlotIndex].minute;
      return currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes;
    });

    if (!hasSlot) {
      setDragStart({ day: dayIndex, timeSlot: timeSlotIndex });
      setDragEnd({ day: dayIndex, timeSlot: timeSlotIndex });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (dayIndex: number, timeSlotIndex: number) => {
    if (isDragging && dragStart && dragStart.day === dayIndex) {
      setDragEnd({ day: dayIndex, timeSlot: timeSlotIndex });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && onDragSelect) {
      const startSlot = Math.min(dragStart.timeSlot, dragEnd.timeSlot);
      const endSlot = Math.max(dragStart.timeSlot, dragEnd.timeSlot) + 1;
      
      const startTime = timeSlots15Min[startSlot].timeString;
      const endTime = timeSlots15Min[endSlot]?.timeString || "22:00";
      
      onDragSelect(dragStart.day, startTime, endTime);
    }
    
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  };

  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getDragSelection = () => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    
    const startSlot = Math.min(dragStart.timeSlot, dragEnd.timeSlot);
    const endSlot = Math.max(dragStart.timeSlot, dragEnd.timeSlot);
    
    return { day: dragStart.day, startSlot, endSlot };
  };

  const dragSelection = getDragSelection();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-[#8159A8]">
            Weekly Availability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              {weekDates[0].toLocaleDateString()} -{" "}
              {weekDates[6].toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Click and drag to select time ranges. Each cell represents 30 minutes.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-8 border-b">
          {/* Time column header */}
          <div className="p-4 border-r bg-gray-50 text-sm font-medium text-gray-600">
            Time
          </div>
          {/* Day headers */}
          {days.map((day, index) => (
            <div key={day} className="p-4 border-r bg-gray-50 text-center">
              <div className="text-sm font-medium text-gray-900">{day}</div>
              <div className="text-xs text-gray-500 mt-1">
                {weekDates[index].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          className="grid grid-cols-8 relative select-none"
          style={{ minHeight: "900px" }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time labels */}
          <div className="border-r bg-gray-50">
            {timeSlots15Min.map((timeSlot, index) => (
              <div
                key={index}
                className={`h-4 border-b border-gray-100 text-xs text-gray-500 p-1 ${
                  timeSlot.minute === 0 ? 'font-medium border-b-2 border-gray-200' : ''
                }`}
              >
                {timeSlot.minute === 0 ? timeSlot.displayTime : ''}
              </div>
            ))}
          </div>

          {/* Days */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r relative">
              {/* 15-minute grid cells */}
              {timeSlots15Min.map((timeSlot, timeSlotIndex) => {
                const hasSlot = getSessionSlotsForDay(dayIndex).some((slot) => {
                  const slotStartMinutes = timeStringToMinutes(slot.startTime);
                  const slotEndMinutes = timeStringToMinutes(slot.endTime);
                  const currentMinutes = timeSlot.hour * 60 + timeSlot.minute;
                  return currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes;
                });

                const isDragSelected = dragSelection && 
                  dragSelection.day === dayIndex && 
                  timeSlotIndex >= dragSelection.startSlot && 
                  timeSlotIndex <= dragSelection.endSlot;

                return (
                  <div
                    key={timeSlotIndex}
                    className={`h-4 border-b border-gray-100 cursor-pointer transition-colors group ${
                      isDragSelected
                        ? "bg-[#8159A8]/30"
                        : hasSlot
                        ? "cursor-default"
                        : "hover:bg-[#8159A8]/10"
                    } ${timeSlot.minute === 0 ? 'border-b-2 border-gray-200' : ''}`}
                    onMouseDown={() => handleMouseDown(dayIndex, timeSlotIndex)}
                    onMouseMove={() => handleMouseMove(dayIndex, timeSlotIndex)}
                  >
                    {!hasSlot && !isDragging && (
                      <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {timeSlot.minute === 0 && <Plus className="h-3 w-3 text-[#8159A8]" />}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Session slots */}
              {getSessionSlotsForDay(dayIndex).map((sessionSlot) => {
                const position = getSlotPosition(
                  sessionSlot.startTime,
                  sessionSlot.endTime
                );
                const parentSlot = getAvailabilitySlotById(
                  sessionSlot.parentAvailabilityId
                );

                return (
                  <div
                    key={sessionSlot.id}
                    className={`absolute left-1 right-1 rounded p-1 text-xs cursor-pointer transition-all border ${
                      sessionSlot.isActive
                        ? "bg-[#8159A8] text-white hover:bg-[#6D4C93] border-[#6D4C93]"
                        : "bg-gray-300 text-gray-600 hover:bg-gray-400 border-gray-400"
                    }`}
                    style={position}
                    onMouseEnter={() => setHoveredSlot(sessionSlot.id)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    <div className="font-medium text-center">
                      {formatTime(sessionSlot.startTime)}
                    </div>
                    <div className="opacity-90 text-center text-[10px]">
                      {parentSlot?.sessionDuration}min
                    </div>

                    {hoveredSlot === sessionSlot.id && parentSlot && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-3 min-w-48 z-20">
                        <div className="space-y-2 text-gray-900">
                          <div className="flex items-center gap-2">
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
                          <div>
                            <strong>Session Time:</strong>{" "}
                            {formatTime(sessionSlot.startTime)} -{" "}
                            {formatTime(sessionSlot.endTime)}
                          </div>
                          <div>
                            <strong>Duration:</strong>{" "}
                            {parentSlot.sessionDuration} minutes
                          </div>
                          <div>
                            <strong>Break After:</strong>{" "}
                            {parentSlot.breakBetweenSessions} minutes
                          </div>
                          {parentSlot.isRecurring && (
                            <div>
                              <Badge variant="outline">Recurring Session</Badge>
                            </div>
                          )}

                          <div className="flex gap-1 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSlot(parentSlot.id);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              {sessionSlot.isActive ? (
                                <ToggleRight className="h-3 w-3" />
                              ) : (
                                <ToggleLeft className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSlot(parentSlot);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSlot(parentSlot.id);
                              }}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Updated Legend */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8159A8] rounded border border-[#6D4C93]"></div>
              <span>Available Session Slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded border border-gray-400"></div>
              <span>Inactive Session Slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8159A8]/30 rounded"></div>
              <span>Drag Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚫</span>
              <span>Each row = 15 minutes (7 AM - 10 PM)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
