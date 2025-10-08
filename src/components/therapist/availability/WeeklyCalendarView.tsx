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
  isActive: boolean;
  isFreeSession?: boolean;
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
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ];

  const sessionTimeSlots = Array.from({ length: (22 - 7) }, (_, i) => {
    const startHours = 7 + i;
    const endHours = startHours + 1;
    return {
      startHour: startHours,
      endHour: endHours,
      startTimeString: `${startHours.toString().padStart(2, "0")}:00`,
      endTimeString: `${endHours.toString().padStart(2, "0")}:00`,
      displayTime: formatTimeDisplay(startHours, 0),
      sessionStartTime: `${startHours.toString().padStart(2, "0")}:00`,
      sessionEndTime: `${startHours.toString().padStart(2, "0")}:45`, // 45-minute session
      breakEndTime: `${endHours.toString().padStart(2, "0")}:00` // 15-minute break until next hour
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
    // Find the Monday of the current week
    const firstDay = new Date(startDate);
    const day = firstDay.getDay();
    const diff = day === 0 ? -6 : 1 - day; // if Sunday (0), go back 6 days, else go to Monday
    firstDay.setDate(firstDay.getDate() + diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
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
    // Convert JS day (0=Sunday, 6=Saturday) to our format (1=Monday, 7=Sunday)
    const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    return sessionSlots.filter((slot) => slot.dayOfWeek === dbDay);
  };

  const getSlotPosition = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Calculate position relative to 7:00 AM (420 minutes)
    const calendarStartMinutes = 7 * 60;
    const top = ((startTotalMinutes - calendarStartMinutes) / 60) * 64; // 64px per 60-min slot
    const height = ((endTotalMinutes - startTotalMinutes) / 60) * 64;
    
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
    const weekDate = weekDates[dayIndex];
    const jsDay = weekDate.getDay();
    const dbDay = jsDay === 0 ? 7 : jsDay;
    
    const hasSlot = getSessionSlotsForDay(jsDay).some((slot) => {
      const slotStartMinutes = timeStringToMinutes(slot.startTime);
      const currentSlotStart = sessionTimeSlots[timeSlotIndex].startHour * 60;
      return slotStartMinutes >= currentSlotStart && slotStartMinutes < (currentSlotStart + 60);
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
      
      const startTime = sessionTimeSlots[startTimeIndex].startTimeString;
      const endTime = sessionTimeSlots[endTimeIndex]?.startTimeString || "22:00";
      
      // Convert JS day to database day format (1=Monday, 7=Sunday)
      const weekDate = weekDates[dragStart.dayIndex];
      const jsDay = weekDate.getDay();
      const dbDay = jsDay === 0 ? 7 : jsDay;
      
      onDragSelect(dbDay, startTime, endTime);
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
            {sessionTimeSlots.map((timeSlot) => (
              <div
                key={timeSlot.startTimeString}
                className="h-16 border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {timeSlot.displayTime}
                  </div>
                  <div className="text-xs text-gray-400">
                    45min slot
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Days */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r relative">
              {/* 60-minute session slots */}
              {sessionTimeSlots.map((timeSlot, timeSlotIndex) => {
                const hasSlot = getSessionSlotsForDay(weekDates[dayIndex].getDay()).some((slot) => {
                  const slotStartMinutes = timeStringToMinutes(slot.startTime);
                  const currentSlotStart = timeSlot.startHour * 60;
                  return slotStartMinutes >= currentSlotStart && slotStartMinutes < (currentSlotStart + 60);
                });

                return (
                  <div
                    key={timeSlotIndex}
                    className={`h-16 border-b border-gray-100 transition-colors cursor-pointer group relative ${
                      hasSlot
                        ? "bg-[#8159A8]/10"
                        : isDragSelected(dayIndex, timeSlotIndex)
                        ? "bg-[#8159A8]/30"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseDown={() => handleMouseDown(dayIndex, timeSlotIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, timeSlotIndex)}
                    onClick={() => {
                      if (!hasSlot && onDragSelect) {
                        // Convert JS day to database day format
                        const weekDate = weekDates[dayIndex];
                        const jsDay = weekDate.getDay();
                        const dbDay = jsDay === 0 ? 7 : jsDay;
                        
                        onDragSelect(
                          dbDay,
                          timeSlot.startTimeString,
                          timeSlot.endTimeString
                        );
                      }
                    }}
                  >
                    {!hasSlot && (
                      <div className="flex flex-col items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-4 w-4 text-[#8159A8] mb-1" />
                        <div className="text-xs text-[#8159A8] font-medium">
                          {timeSlot.displayTime}
                        </div>
                        <div className="text-xs text-gray-500">
                          45min session
                        </div>
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
                      !sessionSlot.isActive
                        ? "bg-gray-400 text-gray-100 border-gray-500"
                        : sessionSlot.isFreeSession
                        ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                        : "bg-[#8159A8] text-white border-[#6D4C93] hover:bg-[#6D4C93]"
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
                        {sessionSlot.isFreeSession ? "Free" : "Available"}
                      </div>
                    </div>

                    {/* Session Tooltip */}
                    {hoveredSlot === sessionSlot.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-3 min-w-48 z-20">
                        <div className="text-gray-900">
                          <div className="font-medium text-sm mb-2">45-Minute Session</div>
                          <div className="space-y-1 text-xs">
                            <div><strong>Time:</strong> {formatTime(sessionSlot.startTime)} - {formatTime(sessionSlot.endTime)}</div>
                            <div><strong>Duration:</strong> 45 minutes</div>
                            <div><strong>Type:</strong> 
                              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                sessionSlot.isFreeSession
                                  ? "bg-green-100 text-green-800"
                                  : "bg-[#F5F3FB] text-[#8159A8]"
                              }`}>
                                {sessionSlot.isFreeSession ? "Free Session" : "Paid Session"}
                              </span>
                            </div>
                            <div><strong>Status:</strong> 
                              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                sessionSlot.isActive
                                  ? "bg-blue-100 text-blue-800"
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
              <span>Paid Sessions (45 min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
              <span>Free Sessions (45 min)</span>
            </div>
                        <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded border border-gray-500"></div>
              <span>Inactive Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8159A8]/30 rounded"></div>
              <span>Drag Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Each row = 1 hour (45min session + 15min break)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
