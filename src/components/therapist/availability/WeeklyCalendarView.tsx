"use client";

import { useState } from "react";
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
  Clock,
  Users,
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
  onDragSelect,
}: WeeklyCalendarViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [hoveredAvailability, setHoveredAvailability] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{day: number; timeSlot: number} | null>(null);
  const [dragEnd, setDragEnd] = useState<{day: number; timeSlot: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const getAvailabilityBlocksForDay = (dayOfWeek: number) => {
    console.log(`DEBUG: getAvailabilityBlocksForDay(${dayOfWeek}) called`);
    
    const filtered = timeSlots.filter((slot) => {
      // If slot has recurrence pattern with specific days
      if (slot.recurrencePattern?.days && slot.recurrencePattern.days.length > 0) {
        return slot.recurrencePattern.days.includes(dayOfWeek);
      }
      
      // If slot is recurring but no specific days set, use the original dayOfWeek
      if (slot.isRecurring && slot.recurrencePattern?.type) {
        if (slot.recurrencePattern.type === "daily") {
          return true; // Show on all days for daily recurrence
        }
        
        if (slot.recurrencePattern.type === "weekly") {
          return slot.dayOfWeek === dayOfWeek;
        }
        
        // For custom type, fall back to dayOfWeek if no days specified
        return slot.dayOfWeek === dayOfWeek;
      }
      
      // For non-recurring slots, match the exact day
      return slot.dayOfWeek === dayOfWeek;
    });
    
    console.log(`DEBUG: getAvailabilityBlocksForDay(${dayOfWeek}) - Total slots: ${timeSlots.length}, Filtered: ${filtered.length}`, { filtered });
    return filtered;
  };

  const getSessionSlotsForDay = (dayOfWeek: number) => {
    return sessionSlots.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  // const getAvailabilitySlotById = (parentId: string) => {
  //   return timeSlots.find((slot) => slot.id === parentId);
  // };

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
    const dayStart = 7; // 7 AM start
    const dayEnd = 22; // 10 PM end
    const totalHours = dayEnd - dayStart;

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const topPercent = ((startHour - dayStart) / totalHours) * 100;
    const heightPercent = ((endHour - startHour) / totalHours) * 100;

    return {
      top: `${Math.max(0, topPercent)}%`,
      height: `${Math.max(1, heightPercent)}%`,
    };
  };

  // const handleCellClick = (dayOfWeek: number, hour: number) => {
  //   const existingSlot = getSessionSlotsForDay(dayOfWeek).find((slot) => {
  //     const slotStart = parseInt(slot.startTime.split(":")[0]);
  //     const slotEnd = parseInt(slot.endTime.split(":")[0]);
  //     return hour >= slotStart && hour < slotEnd;
  //   });

  //   if (!existingSlot) {
  //     onCreateSlot(dayOfWeek, hour);
  //   }
  // };

  // const handleCellMouseEnter = (dayOfWeek: number, hour: number) => {
  //   const existingSlot = getSessionSlotsForDay(dayOfWeek).find((slot) => {
  //     const slotStart = parseInt(slot.startTime.split(":")[0]);
  //     const slotEnd = parseInt(slot.endTime.split(":")[0]);
  //     return hour >= slotStart && hour < slotEnd;
  //   });

  //   if (!existingSlot) {
  //     setHoveredAvailability(`${dayOfWeek}-${hour}`);
  //   }
  // };

  // const handleCellMouseLeave = () => {
  //   setHoveredAvailability(null);
  // };

  const handleMouseDown = (dayIndex: number, timeSlotIndex: number) => {
    const hasSlot = getSessionSlotsForDay(weekDates[dayIndex].getDay()).some((slot) => {
      const slotStartMinutes = timeStringToMinutes(slot.startTime);
      const slotEndMinutes = timeStringToMinutes(slot.endTime);
      const currentMinutes = timeSlots30Min[timeSlotIndex].hour * 60 + timeSlots30Min[timeSlotIndex].minute;
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
      
      const startTime = timeSlots30Min[startSlot].timeString;
      const endTime = timeSlots30Min[endSlot]?.timeString || "22:00";
      
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

  // Generate session slots for a given availability block
  const generateSessionSlotsForBlock = (availabilityBlock: TimeSlot) => {
    const start = new Date(`1970-01-01T${availabilityBlock.startTime}:00`);
    const end = new Date(`1970-01-01T${availabilityBlock.endTime}:00`);
    const sessions = [];
    
    const currentTime = new Date(start); // Changed from let to const
    let sessionCount = 0;
    
    while (currentTime < end) {
      const sessionEnd = new Date(currentTime);
      sessionEnd.setMinutes(currentTime.getMinutes() + availabilityBlock.sessionDuration);
      
      if (sessionEnd <= end) {
        sessionCount++;
        sessions.push({
          sessionNumber: sessionCount,
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: sessionEnd.toTimeString().slice(0, 5),
          parentId: availabilityBlock.id
        });
        
        // Move to next session (session + break)
        currentTime.setMinutes(
          currentTime.getMinutes() + 
          availabilityBlock.sessionDuration + 
          availabilityBlock.breakBetweenSessions
        );
      } else {
        // Check if we can fit one more session without trailing break
        const finalSessionEnd = new Date(currentTime.getTime() + availabilityBlock.sessionDuration * 60 * 1000);
        if (finalSessionEnd <= end) {
          sessionCount++;
          sessions.push({
            sessionNumber: sessionCount,
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: finalSessionEnd.toTimeString().slice(0, 5),
            parentId: availabilityBlock.id
          });
        }
        break;
      }
    }
    
    return sessions;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-[#8159A8]">
            Weekly Availability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Click and drag to create new availability blocks. Each cell = 30 minutes.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-8 border-b">
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
          {/* Time labels */}
          <div className="border-r bg-gray-50">
            {timeSlots30Min.map((timeSlot, index) => (
              <div
                key={index}
                className={`h-8 border-b border-gray-100 text-xs text-gray-500 p-1 ${
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
              {/* 30-minute grid cells */}
              {timeSlots30Min.map((timeSlot, timeSlotIndex) => {
                const hasSlot = getSessionSlotsForDay(weekDates[dayIndex].getDay()).some((slot) => {
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
                    className={`h-8 border-b border-gray-100 cursor-pointer transition-colors group ${
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

              {/* Availability Blocks */}
              {getAvailabilityBlocksForDay(weekDates[dayIndex].getDay()).map((availabilityBlock) => {
                const position = getSlotPosition(availabilityBlock.startTime, availabilityBlock.endTime);
                const generatedSessions = generateSessionSlotsForBlock(availabilityBlock);

                return (
                  <div key={`availability-${availabilityBlock.id}`} className="absolute left-0 right-0">
                    {/* Availability Block Background */}
                    <div
                      className={`absolute left-1 right-1 rounded border-2 border-dashed transition-all ${
                        availabilityBlock.isActive
                          ? "border-[#8159A8]/40 bg-[#8159A8]/5"
                          : "border-gray-400/40 bg-gray-100/50"
                      }`}
                      style={position}
                      onMouseEnter={() => setHoveredAvailability(availabilityBlock.id)}
                      onMouseLeave={() => setHoveredAvailability(null)}
                    >
                      {/* Block Header */}
                      <div className="p-1 text-center">
                        <div className="text-xs font-medium text-[#8159A8]">
                          {formatTime(availabilityBlock.startTime)} - {formatTime(availabilityBlock.endTime)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {generatedSessions.length} sessions
                        </div>
                      </div>

                      {/* Hover Actions */}
                      {hoveredAvailability === availabilityBlock.id && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSlot(availabilityBlock.id);
                            }}
                            className="h-6 w-6 p-0 bg-white shadow-sm"
                          >
                            {availabilityBlock.isActive ? (
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
                              onEditSlot(availabilityBlock);
                            }}
                            className="h-6 w-6 p-0 bg-white shadow-sm"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSlot(availabilityBlock.id);
                            }}
                            className="h-6 w-6 p-0 bg-white shadow-sm text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Individual Session Slots */}
                    {generatedSessions.map((session) => {
                      const sessionPosition = getSlotPosition(session.startTime, session.endTime);
                      const sessionId = `${availabilityBlock.id}-session-${session.sessionNumber}`;

                      return (
                        <div
                          key={sessionId}
                          className={`absolute left-2 right-2 rounded border transition-all cursor-pointer z-10 ${
                            availabilityBlock.isActive
                              ? "bg-[#8159A8] text-white border-[#6D4C93] hover:bg-[#6D4C93]"
                              : "bg-gray-400 text-gray-100 border-gray-500"
                          }`}
                          style={sessionPosition}
                          onMouseEnter={() => setHoveredSlot(sessionId)}
                          onMouseLeave={() => setHoveredSlot(null)}
                        >
                          <div className="p-1 text-center">
                            <div className="text-xs font-medium">
                              Session {session.sessionNumber}
                            </div>
                            <div className="text-xs opacity-90">
                              {formatTime(session.startTime)}
                            </div>
                          </div>

                          {/* Session Tooltip */}
                          {hoveredSlot === sessionId && (
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-3 min-w-48 z-20">
                              <div className="space-y-2 text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-[#8159A8]" />
                                  <span className="font-medium">
                                    Session {session.sessionNumber} of {generatedSessions.length}
                                  </span>
                                  <Badge className={
                                    availabilityBlock.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }>
                                    {availabilityBlock.isActive ? "Bookable" : "Inactive"}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm space-y-1">
                                  <div><strong>Time:</strong> {formatTime(session.startTime)} - {formatTime(session.endTime)}</div>
                                  <div><strong>Duration:</strong> {availabilityBlock.sessionDuration} minutes</div>
                                  <div><strong>Break after:</strong> {availabilityBlock.breakBetweenSessions} minutes</div>
                                  {availabilityBlock.rate && (
                                    <div><strong>Rate:</strong> ${availabilityBlock.rate}</div>
                                  )}
                                </div>

                                <div className="pt-2 border-t">
                                  <div className="text-xs text-gray-600">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    Part of {formatTime(availabilityBlock.startTime)} - {formatTime(availabilityBlock.endTime)} block
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Enhanced Legend */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-dashed border-[#8159A8]/40 bg-[#8159A8]/5 rounded"></div>
              <span>Availability Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8159A8] rounded border border-[#6D4C93]"></div>
              <span>Bookable Session Slot</span>
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
              <span>30-minute grid (7 AM - 10 PM)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
