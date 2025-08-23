"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
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
  rate?: number;
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
  onEditSlot?: (slot: TimeSlot) => void;
  onDeleteSlot?: (slotId: string) => void;
  onToggleSlot?: (slotId: string) => void;
  onDragSelect?: (dayOfWeek: number, startTime: string, endTime: string) => void;
}

export function WeeklyCalendarView({
  sessionSlots,
  selectedWeekStart,
  onWeekChange,
  onDragSelect,
}: WeeklyCalendarViewProps): React.JSX.Element {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{dayIndex: number, timeIndex: number} | null>(null);
  const [dragEnd, setDragEnd] = useState<{dayIndex: number, timeIndex: number} | null>(null);

  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  const timeSlots30Min = Array.from({ length: (22 - 7) * 2 }, (_, i) => {
    const totalMinutes = 7 * 60 + i * 30;
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
    newDate.setDate(selectedWeekStart.getDate() + (direction === "next" ? 7 : -7));
    onWeekChange(newDate);
  };

  const getSessionSlotsForDay = (dayOfWeek: number) => {
    return sessionSlots.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  const getSlotPosition = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Calculate position relative to 7:00 AM (420 minutes)
    const calendarStartMinutes = 7 * 60;
    const top = ((startTotalMinutes - calendarStartMinutes) / 30) * 32; // 32px per 30-min slot
    const height = ((endTotalMinutes - startTotalMinutes) / 30) * 32;
    
    return { top: `${top}px`, height: `${height}px` };
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return formatTimeDisplay(hour, minute);
  };

  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleMouseDown = (dayIndex: number, timeSlotIndex: number) => {
    const hasSlot = getSessionSlotsForDay(weekDates[dayIndex].getDay()).some((slot) => {
      const slotStartMinutes = timeStringToMinutes(slot.startTime);
      const slotEndMinutes = timeStringToMinutes(slot.endTime);
      const currentMinutes = timeSlots30Min[timeSlotIndex].hour * 60 + timeSlots30Min[timeSlotIndex].minute;
      return currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes;
    });

    if (!hasSlot) {
      setIsDragging(true);
      setDragStart({ dayIndex, timeIndex: timeSlotIndex });
      setDragEnd({ dayIndex, timeIndex: timeSlotIndex });
    }
  };

  const handleMouseEnter = (dayIndex: number, timeSlotIndex: number) => {
    if (isDragging && dragStart && dragStart.dayIndex === dayIndex) {
      setDragEnd({ dayIndex, timeIndex: timeSlotIndex });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && onDragSelect) {
      const startTimeIndex = Math.min(dragStart.timeIndex, dragEnd.timeIndex);
      const endTimeIndex = Math.max(dragStart.timeIndex, dragEnd.timeIndex) + 1;
      
      const startTime = timeSlots30Min[startTimeIndex].timeString;
      const endTime = timeSlots30Min[endTimeIndex]?.timeString || "22:00";
      
      onDragSelect(weekDates[dragStart.dayIndex].getDay(), startTime, endTime);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const isDragSelected = (dayIndex: number, timeSlotIndex: number) => {
    if (!isDragging || !dragStart || !dragEnd || dragStart.dayIndex !== dayIndex) return false;
    
    const minTime = Math.min(dragStart.timeIndex, dragEnd.timeIndex);
    const maxTime = Math.max(dragStart.timeIndex, dragEnd.timeIndex);
    
    return timeSlotIndex >= minTime && timeSlotIndex <= maxTime;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {selectedWeekStart.toLocaleDateString("en-US", { 
              month: "long", 
              day: "numeric",
              year: "numeric"
            })} - {
              new Date(selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
                .toLocaleDateString("en-US", { 
                  month: "long", 
                  day: "numeric",
                  year: "numeric"
                })
            }
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Click and drag to create new availability blocks. Each cell = 30 minutes.
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-auto max-h-[600px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b bg-gray-50 sticky top-0 z-10">
          <div className="p-4 border-r bg-gray-50 text-sm font-medium text-gray-600">
            Time
          </div>
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

        <div
          className="grid grid-cols-8 relative select-none"
          style={{ minHeight: "900px" }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time Labels */}
          <div className="border-r bg-gray-50">
            {timeSlots30Min.map((timeSlot) => (
              <div
                key={timeSlot.timeString}
                className="h-8 border-b border-gray-100 flex items-center justify-end pr-2"
              >
                {timeSlot.minute === 0 && (
                  <span className="text-sm font-medium px-4">
                    {timeSlot.displayTime}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Days */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r relative">
              {/* 30-minute grid cells */}
              {timeSlots30Min.map((timeSlot, timeSlotIndex) => {
                const hasSlot = getSessionSlotsForDay(weekDates[dayIndex].getDay()).some((slot) => {
                  const slotStartMinutes = timeStringToMinutes(slot.startTime);
                  const slotEndMinutes = timeStringToMinutes(slot.endTime);
                  const currentMinutes = timeSlot.hour * 60 + timeSlot.minute;
                  return currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes;
                });

                return (
                  <div
                    key={timeSlotIndex}
                    className={`h-8 border-b border-gray-100 transition-colors cursor-pointer group relative ${
                      hasSlot
                        ? "bg-[#8159A8]/10"
                        : isDragSelected(dayIndex, timeSlotIndex)
                        ? "bg-[#8159A8]/30"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseDown={() => handleMouseDown(dayIndex, timeSlotIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, timeSlotIndex)}
                  >
                    {!hasSlot && !isDragging && (
                      <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {timeSlot.minute === 0 && <Plus className="h-3 w-3 text-[#8159A8]" />}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Session Slots - Individual bookable sessions */}
              {getSessionSlotsForDay(weekDates[dayIndex].getDay()).map((sessionSlot) => {
                const position = getSlotPosition(sessionSlot.startTime, sessionSlot.endTime);

                return (
                  <div
                    key={sessionSlot.id}
                    className={`absolute left-2 right-2 rounded border transition-all cursor-pointer z-10 ${
                      sessionSlot.isActive
                        ? "bg-[#8159A8] text-white border-[#6D4C93] hover:bg-[#6D4C93]"
                        : "bg-gray-400 text-gray-100 border-gray-500"
                    }`}
                    style={position}
                    onMouseEnter={() => setHoveredSlot(sessionSlot.id)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    <div className="p-1 text-center">
                      <div className="text-xs font-medium">
                        {formatTime(sessionSlot.startTime)}
                      </div>
                      <div className="text-xs opacity-90">
                        Available
                      </div>
                    </div>

                    {/* Session Tooltip */}
                    {hoveredSlot === sessionSlot.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-3 min-w-48 z-20">
                        <div className="text-gray-900">
                          <div className="font-medium text-sm mb-2">Session Slot</div>
                          <div className="space-y-1 text-xs">
                            <div><strong>Time:</strong> {formatTime(sessionSlot.startTime)} - {formatTime(sessionSlot.endTime)}</div>
                            <div><strong>Status:</strong> 
                              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                sessionSlot.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {sessionSlot.isActive ? "Available for booking" : "Inactive"}
                              </span>
                            </div>
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

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8159A8] rounded border border-[#6D4C93]"></div>
              <span>Available Session Slot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded border border-gray-500"></div>
              <span>Inactive Session Slot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8159A8]/30 rounded"></div>
              <span>Drag Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Each cell = 30 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
