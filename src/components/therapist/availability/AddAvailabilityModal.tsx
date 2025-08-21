"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, Users } from "lucide-react";

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

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: TimeSlot | Omit<TimeSlot, "id">) => void;
  editingSlot?: TimeSlot | null;
  prefilledData?: {
    dayOfWeek: number;
    startTime?: string;
    endTime?: string;
    selectedWeekStart: Date;
  } | null;
}

interface SessionPreview {
  sessionNumber: number;
  startTime: string;
  endTime: string;
  displayStart: string;
  displayEnd: string;
}

interface SchedulePreset {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  breakBetweenSessions: number;
  color: string;
}

export function AddAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  editingSlot,
  prefilledData,
}: AddAvailabilityModalProps) {
  const [formData, setFormData] = useState({
    startTime: "09:00",
    endTime: "17:00",
    dayOfWeek: 1,
    isRecurring: false,
    recurrenceType: "weekly" as "daily" | "weekly" | "custom",
    selectedDays: [1] as number[],
    endDate: "",
    sessionDuration: 60,
    breakBetweenSessions: 15,
    isActive: true,
    rate: 120,
    overrideDefaultRate: false,
  });

  const days = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const timeSlots = Array.from({ length: (22 - 7) * 4 }, (_, i) => {
    const totalMinutes = 7 * 60 + i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  });

  const schedulePresets: SchedulePreset[] = [
    {
      id: "business-hours",
      name: "Business Hours",
      description: "Standard 9-5 with lunch break",
      startTime: "09:00",
      endTime: "17:00",
      sessionDuration: 60,
      breakBetweenSessions: 15,
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: "morning-sessions",
      name: "Morning Sessions",
      description: "Early bird appointments",
      startTime: "08:00",
      endTime: "12:00",
      sessionDuration: 90,
      breakBetweenSessions: 30,
      color: "bg-green-100 text-green-800"
    },
    {
      id: "evening-sessions",
      name: "Evening Sessions",
      description: "After-work appointments",
      startTime: "17:00",
      endTime: "21:00",
      sessionDuration: 60,
      breakBetweenSessions: 15,
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: "intensive-day",
      name: "Intensive Day",
      description: "Longer sessions, fewer breaks",
      startTime: "10:00",
      endTime: "16:00",
      sessionDuration: 120,
      breakBetweenSessions: 30,
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const generateSessionPreview = (): { sessions: SessionPreview[], unusedMinutes: number, warnings: string[] } => {
    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (totalMinutes <= 0) {
      return { sessions: [], unusedMinutes: 0, warnings: ["End time must be after start time"] };
    }

    const sessionMinutes = formData.sessionDuration;
    const breakMinutes = formData.breakBetweenSessions;
    const slotDuration = sessionMinutes + breakMinutes;
    
    const sessions: SessionPreview[] = [];
    const warnings: string[] = [];
    let currentTime = new Date(start);
    let sessionCount = 0;

    // Generate sessions with breaks
    while (true) {
      const sessionEnd = new Date(currentTime.getTime() + sessionMinutes * 60 * 1000);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
      
      // Check if session fits
      if (sessionEnd <= end) {
        sessionCount++;
        sessions.push({
          sessionNumber: sessionCount,
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: sessionEnd.toTimeString().slice(0, 5),
          displayStart: formatTime(currentTime.toTimeString().slice(0, 5)),
          displayEnd: formatTime(sessionEnd.toTimeString().slice(0, 5))
        });

        // Check if there's room for another session after the break
        if (slotEnd <= end) {
          currentTime = new Date(slotEnd);
        } else {
          // No room for break + next session, but check if we can fit one more session
          const nextSessionEnd = new Date(sessionEnd.getTime() + sessionMinutes * 60 * 1000);
          if (nextSessionEnd <= end) {
            sessionCount++;
            sessions.push({
              sessionNumber: sessionCount,
              startTime: sessionEnd.toTimeString().slice(0, 5),
              endTime: nextSessionEnd.toTimeString().slice(0, 5),
              displayStart: formatTime(sessionEnd.toTimeString().slice(0, 5)),
              displayEnd: formatTime(nextSessionEnd.toTimeString().slice(0, 5))
            });
          }
          break;
        }
      } else {
        break;
      }
    }

    // Calculate unused time
    const lastSessionEnd = sessions.length > 0 
      ? new Date(`1970-01-01T${sessions[sessions.length - 1].endTime}:00`)
      : start;
    const unusedMinutes = (end.getTime() - lastSessionEnd.getTime()) / (1000 * 60);

    // Add warnings
    if (unusedMinutes >= sessionMinutes) {
      warnings.push(`${unusedMinutes} minutes unused - consider adjusting times or session length`);
    }
    
    if (sessions.length === 0) {
      warnings.push("No sessions can fit in this time block");
    }

    if (formData.sessionDuration < 30) {
      warnings.push("Sessions shorter than 30 minutes may not be practical");
    }

    if (formData.breakBetweenSessions === 0 && sessions.length > 1) {
      warnings.push("Consider adding breaks between sessions");
    }

    return { sessions, unusedMinutes, warnings };
  };

  const { sessions, unusedMinutes, warnings } = generateSessionPreview();

  useEffect(() => {
    if (editingSlot) {
      setFormData({
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        dayOfWeek: editingSlot.dayOfWeek,
        isRecurring: editingSlot.isRecurring,
        recurrenceType: editingSlot.recurrencePattern?.type || "weekly",
        selectedDays: editingSlot.recurrencePattern?.days || [editingSlot.dayOfWeek],
        endDate: editingSlot.recurrencePattern?.endDate || "",
        sessionDuration: editingSlot.sessionDuration,
        breakBetweenSessions: editingSlot.breakBetweenSessions,
        isActive: editingSlot.isActive,
        rate: editingSlot.rate || 120,
        overrideDefaultRate: Boolean(editingSlot.rate),
      });
    } else if (prefilledData) {
      setFormData({
        startTime: prefilledData.startTime || "09:00",
        endTime: prefilledData.endTime || "10:00",
        dayOfWeek: prefilledData.dayOfWeek,
        isRecurring: false,
        recurrenceType: "weekly",
        selectedDays: [prefilledData.dayOfWeek],
        endDate: "",
        sessionDuration: 60,
        breakBetweenSessions: 15,
        isActive: true,
        rate: 120,
        overrideDefaultRate: false,
      });
    }
  }, [editingSlot, isOpen, prefilledData]);

  const handleSave = () => {
    if (warnings.some(w => w.includes("No sessions can fit") || w.includes("End time must be after"))) {
      return; // Don't save if there are critical errors
    }

    const slot: Omit<TimeSlot, "id"> = {
      startTime: formData.startTime,
      endTime: formData.endTime,
      dayOfWeek: formData.dayOfWeek,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.isRecurring
        ? {
            type: formData.recurrenceType,
            days: formData.selectedDays,
            endDate: formData.endDate || undefined,
          }
        : undefined,
      sessionDuration: formData.sessionDuration,
      breakBetweenSessions: formData.breakBetweenSessions,
      isActive: formData.isActive,
      rate: formData.overrideDefaultRate ? formData.rate : undefined,
    };

    if (editingSlot) {
      onSave({ ...slot, id: editingSlot.id });
    } else {
      onSave(slot);
    }
  };

  const applyPreset = (preset: SchedulePreset) => {
    setFormData({
      ...formData,
      startTime: preset.startTime,
      endTime: preset.endTime,
      sessionDuration: preset.sessionDuration,
      breakBetweenSessions: preset.breakBetweenSessions,
    });
  };

  const handleDayToggle = (dayValue: number) => {
    if (formData.selectedDays.includes(dayValue)) {
      setFormData({
        ...formData,
        selectedDays: formData.selectedDays.filter((d) => d !== dayValue),
      });
    } else {
      setFormData({
        ...formData,
        selectedDays: [...formData.selectedDays, dayValue].sort(),
      });
    }
  };

  const setQuickSchedule = (type: "weekdays" | "weekends" | "daily") => {
    let selectedDays: number[] = [];
    switch (type) {
      case "weekdays": selectedDays = [1, 2, 3, 4, 5]; break;
      case "weekends": selectedDays = [0, 6]; break;
      case "daily": selectedDays = [0, 1, 2, 3, 4, 5, 6]; break;
    }
    setFormData({ ...formData, isRecurring: true, recurrenceType: "custom", selectedDays });
  };

  const calculateWeeklyStats = () => {
    const daysPerWeek = formData.isRecurring ? formData.selectedDays.length : 1;
    const sessionsPerDay = sessions.length;
    const totalSessions = sessionsPerDay * daysPerWeek;
    const revenue = totalSessions * formData.rate;
    const hoursPerDay = sessions.reduce((total, session) => {
      const start = new Date(`1970-01-01T${session.startTime}:00`);
      const end = new Date(`1970-01-01T${session.endTime}:00`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    const totalHours = hoursPerDay * daysPerWeek;

    return { totalSessions, revenue, totalHours, sessionsPerDay };
  };

  const stats = calculateWeeklyStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#8159A8]" />
            <DialogTitle className="text-xl font-bold text-[#8159A8]">
              {editingSlot ? "Edit Availability Block" : "Create Availability Block"}
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Set up a time block and we'll automatically generate bookable session slots
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {schedulePresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="p-3 h-auto flex-col items-start"
                    >
                      <div className={`px-2 py-1 rounded text-xs ${preset.color} mb-1`}>
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-600 text-left">
                        {preset.description}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Block */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Block</CardTitle>
                <p className="text-sm text-gray-600">
                  Define the overall time period when you're available
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select value={formData.startTime} onValueChange={(value) => setFormData({ ...formData, startTime: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Select value={formData.endTime} onValueChange={(value) => setFormData({ ...formData, endTime: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!formData.isRecurring && (
                  <div>
                    <Label htmlFor="dayOfWeek">Day of Week</Label>
                    <Select
                      value={formData.dayOfWeek.toString()}
                      onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Settings</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure individual session duration and breaks
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
                    <Select
                      value={formData.sessionDuration.toString()}
                      onValueChange={(value) => setFormData({ ...formData, sessionDuration: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes ⭐</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="breakBetweenSessions">Break Between Sessions (minutes)</Label>
                    <Select
                      value={formData.breakBetweenSessions.toString()}
                      onValueChange={(value) => setFormData({ ...formData, breakBetweenSessions: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No break</SelectItem>
                        <SelectItem value="15">15 minutes ⭐</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recurring Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recurring Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked === true })}
                  />
                  <Label htmlFor="isRecurring">Repeat this availability block</Label>
                </div>

                {formData.isRecurring && (
                  <>
                    <div>
                      <Label>Quick Schedule</Label>
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setQuickSchedule("weekdays")}>
                          Weekdays
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setQuickSchedule("weekends")}>
                          Weekends
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setQuickSchedule("daily")}>
                          Every Day
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Select Days</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {days.map((day) => (
                          <div key={day.value} className="flex flex-col items-center">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={formData.selectedDays.includes(day.value)}
                              onCheckedChange={() => handleDayToggle(day.value)}
                            />
                            <Label htmlFor={`day-${day.value}`} className="text-xs mt-1 cursor-pointer">
                              {day.label.substring(0, 3)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overrideDefaultRate"
                    checked={formData.overrideDefaultRate}
                    onCheckedChange={(checked) => setFormData({ ...formData, overrideDefaultRate: checked === true })}
                  />
                  <Label htmlFor="overrideDefaultRate">Custom rate for this block</Label>
                </div>

                {formData.overrideDefaultRate && (
                  <div>
                    <Label htmlFor="rate">Session Rate ($)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: parseInt(e.target.value) || 120 })}
                      min="0"
                      step="5"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {/* Session Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Session Preview
                  <Badge variant="outline">{sessions.length} sessions</Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  These are the individual slots patients can book
                </p>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessions.map((session) => (
                      <div key={session.sessionNumber} className="flex items-center justify-between p-3 bg-[#F5F3FB] rounded-lg border border-[#8159A8]/20">
                        <div>
                          <div className="font-medium text-[#8159A8]">
                            Session {session.sessionNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {session.displayStart} - {session.displayEnd}
                          </div>
                        </div>
                        <Badge className="bg-[#8159A8] text-white">
                          {formData.sessionDuration}min
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No sessions generated</p>
                    <p className="text-sm">Adjust your time block or session settings</p>
                  </div>
                )}

                {unusedMinutes > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {unusedMinutes} minutes unused at the end
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation & Warnings */}
            {warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{warning}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#8159A8]">
                  <CheckCircle className="h-5 w-5" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total sessions per week:</span>
                    <Badge className="bg-[#8159A8] text-white">{stats.totalSessions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total hours per week:</span>
                    <span className="font-medium">{stats.totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weekly revenue potential:</span>
                    <span className="font-bold text-[#8159A8]">${stats.revenue}</span>
                  </div>
                  {formData.isRecurring && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active days:</span>
                      <span className="font-medium">
                        {formData.selectedDays.map(d => days.find(day => day.value === d)?.label.slice(0, 3)).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={warnings.some(w => w.includes("No sessions can fit") || w.includes("End time must be after"))}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {editingSlot ? "Update" : "Create"} Availability Block
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
