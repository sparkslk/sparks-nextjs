"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Save, X, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvailabilityData) => void;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
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

interface SessionPreview {
  sessionNumber: number;
  startTime: string;
  displayStart: string;
}

export function AddAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialStartTime,
  initialEndTime,
}: AddAvailabilityModalProps) {
  const [formData, setFormData] = useState<AvailabilityData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "17:00",
    recurrenceType: "None",
    selectedDays: [],
    isFree: false,
  });

  // Update form data when initial values are provided
  useEffect(() => {
    if (isOpen) {
      setFormData({
        startDate: initialDate || new Date().toISOString().split('T')[0],
        endDate: initialDate || new Date().toISOString().split('T')[0],
        startTime: initialStartTime || "09:00",
        endTime: initialEndTime || "17:00",
        recurrenceType: "None",
        selectedDays: [],
        isFree: false,
      });
    }
  }, [isOpen, initialDate, initialStartTime, initialEndTime]);

  const days = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const timeSlots = Array.from({ length: (22 - 7) }, (_, i) => {
    const hours = 7 + i;
    return `${hours.toString().padStart(2, "0")}:00`;
  });

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const generateSessionPreview = (): { sessions: SessionPreview[], warnings: string[] } => {
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      return { sessions: [], warnings: ["End time must be after start time"] };
    }

    const sessions: SessionPreview[] = [];
    const warnings: string[] = [];

    // Generate sessions starting on the hour
    let currentMinutes = Math.ceil(startMinutes / 60) * 60; // Round up to next hour
    let sessionCount = 0;

    while (currentMinutes + 45 <= endMinutes) {
      sessionCount++;
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      sessions.push({
        sessionNumber: sessionCount,
        startTime: time,
        displayStart: formatTime(time)
      });

      currentMinutes += 60; // Next hour (45 min session + 15 min break)
    }

    if (sessions.length === 0) {
      warnings.push("No sessions can fit in this time block. Please extend the time range.");
    }

    return { sessions, warnings };
  };

  const { sessions, warnings } = generateSessionPreview();

  const calculateStats = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    let totalDays = 0;

    if (formData.recurrenceType === "None") {
      totalDays = 1;
    } else if (formData.recurrenceType === "Daily") {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else if (formData.recurrenceType === "Weekly") {
      let weeks = 0;
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getDay() === startDate.getDay()) {
          weeks++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      totalDays = weeks;
    } else if (formData.recurrenceType === "Monthly") {
      let months = 0;
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getDate() === startDate.getDate()) {
          months++;
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      totalDays = months;
    } else if (formData.recurrenceType === "Custom") {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (formData.selectedDays?.includes(currentDate.getDay())) {
          totalDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const sessionsPerDay = sessions.length;
    const totalSessions = sessionsPerDay * totalDays;
    const totalHours = (totalSessions * 45) / 60;

    return { totalDays, totalSessions, totalHours, sessionsPerDay };
  };

  const stats = calculateStats();

  const handleSave = () => {
    if (warnings.length > 0) {
      return;
    }

    if (formData.recurrenceType === "Custom" && (!formData.selectedDays || formData.selectedDays.length === 0)) {
      alert("Please select at least one day for custom recurrence");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("End date must be after or equal to start date");
      return;
    }

    onSave(formData);
  };

  const handleDayToggle = (dayValue: number) => {
    const currentDays = formData.selectedDays || [];
    if (currentDays.includes(dayValue)) {
      setFormData({
        ...formData,
        selectedDays: currentDays.filter((d) => d !== dayValue),
      });
    } else {
      setFormData({
        ...formData,
        selectedDays: [...currentDays, dayValue].sort(),
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
    setFormData({ ...formData, recurrenceType: "Custom", selectedDays });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#8159A8]" />
            <DialogTitle className="text-xl font-bold text-[#8159A8]">
              Create Availability
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Set your available dates and times. We&apos;ll automatically create 45-minute session slots.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Date Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Recurrence End)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Time Block */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Time Block</CardTitle>
                <p className="text-sm text-gray-600">
                  Sessions start on the hour and are 45 minutes long
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
              </CardContent>
            </Card>

            {/* Recurrence */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recurrence Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recurrenceType">Repeat</Label>
                  <Select 
                    value={formData.recurrenceType} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      recurrenceType: value as any,
                      selectedDays: value === "Custom" ? formData.selectedDays : []
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">No Repeat (Single Date)</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly (Same Day)</SelectItem>
                      <SelectItem value="Monthly">Monthly (Same Date)</SelectItem>
                      <SelectItem value="Custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrenceType === "Custom" && (
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
                              checked={formData.selectedDays?.includes(day.value) || false}
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

            {/* Free Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked === true })}
                  />
                  <Label htmlFor="isFree" className="text-sm font-medium">
                    Offer as free sessions
                  </Label>
                </div>
                {formData.isFree && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      These sessions will be offered free of charge to patients.
                    </p>
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
                  <Clock className="h-5 w-5" />
                  Daily Session Preview
                  <Badge variant="outline">{sessions.length} slots per day</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessions.map((session) => (
                      <div key={session.sessionNumber} className="flex items-center justify-between p-3 bg-[#F5F3FB] rounded-lg border border-[#8159A8]/20">
                        <div>
                          <div className="font-medium text-[#8159A8]">
                            Slot {session.sessionNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {session.displayStart}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#8159A8] text-white">
                            45min
                          </Badge>
                          {formData.isFree && (
                            <Badge className="bg-green-100 text-green-800">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No sessions generated</p>
                    <p className="text-sm">Adjust your time block settings</p>
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

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#8159A8]">
                  <CheckCircle className="h-5 w-5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total days:</span>
                    <Badge className="bg-[#8159A8] text-white">{stats.totalDays}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Slots per day:</span>
                    <span className="font-medium">{stats.sessionsPerDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total slots created:</span>
                    <Badge className="bg-[#8159A8] text-white">{stats.totalSessions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total hours:</span>
                    <span className="font-medium">{stats.totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Session type:</span>
                    {formData.isFree ? (
                      <Badge className="bg-green-100 text-green-800">Free Sessions</Badge>
                    ) : (
                      <Badge className="bg-[#8159A8] text-white">Paid Sessions</Badge>
                    )}
                  </div>
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
            disabled={warnings.length > 0 || sessions.length === 0}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Create Availability ({stats.totalSessions} slots)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
