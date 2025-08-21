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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, X, Calendar as CalendarIcon } from "lucide-react";

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

  // Enhanced time slots with 15-minute increments
  const timeSlots = Array.from({ length: (22 - 7) * 4 }, (_, i) => {
    const totalMinutes = 7 * 60 + i * 15; // Start from 7 AM
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  });

  // Session duration presets
  const sessionDurationPresets = [
    { value: 30, label: "30 minutes", recommended: false },
    { value: 45, label: "45 minutes", recommended: false },
    { value: 60, label: "60 minutes", recommended: true },
    { value: 90, label: "90 minutes", recommended: false },
    { value: 120, label: "120 minutes", recommended: false },
  ];

  // Break duration presets
  const breakDurationPresets = [
    { value: 0, label: "No break" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes" },
  ];

  const getExactDate = () => {
    if (!prefilledData) return null;

    const weekStart = prefilledData.selectedWeekStart;
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + prefilledData.dayOfWeek);

    return targetDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  useEffect(() => {
    if (editingSlot) {
      setFormData({
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        dayOfWeek: editingSlot.dayOfWeek,
        isRecurring: editingSlot.isRecurring,
        recurrenceType: editingSlot.recurrencePattern?.type || "weekly",
        selectedDays: editingSlot.recurrencePattern?.days || [
          editingSlot.dayOfWeek,
        ],
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
      case "weekdays":
        selectedDays = [1, 2, 3, 4, 5]; // Monday to Friday
        break;
      case "weekends":
        selectedDays = [0, 6]; // Sunday and Saturday
        break;
      case "daily":
        selectedDays = [0, 1, 2, 3, 4, 5, 6]; // All days
        break;
    }

    setFormData({
      ...formData,
      isRecurring: true,
      recurrenceType: "custom",
      selectedDays,
    });
  };

  const calculateTotalSessions = () => {
    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const sessionMinutes =
      formData.sessionDuration + formData.breakBetweenSessions;
    const sessionsPerDay = Math.floor(totalMinutes / sessionMinutes);

    const daysPerWeek = formData.isRecurring ? formData.selectedDays.length : 1;
    return sessionsPerDay * daysPerWeek;
  };

  const calculatePotentialRevenue = () => {
    const totalSessions = calculateTotalSessions();
    return totalSessions * formData.rate;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#8159A8]" />
            <DialogTitle className="text-xl font-bold text-[#8159A8]">
              {editingSlot ? "Edit Availability" : "Add Availability"}
            </DialogTitle>
          </div>
          {prefilledData && !editingSlot && (
            <p className="text-sm text-gray-600 mt-2">
              Creating availability for {getExactDate()} at{" "}
              {formatHour(
                prefilledData.startTime
                  ? parseInt(prefilledData.startTime.split(":")[0])
                  : 9
              )}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Time & Day</TabsTrigger>
              <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Time & Day</CardTitle>
                  {prefilledData && !editingSlot && (
                    <p className="text-sm text-gray-600">
                      You can modify the pre-filled time and day, or set up
                      recurring patterns.
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Select
                        value={formData.startTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, startTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Select
                        value={formData.endTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, endTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
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
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            dayOfWeek: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem
                              key={day.value}
                              value={day.value.toString()}
                            >
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recurrence" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recurring Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          isRecurring: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="isRecurring">
                      Make this a recurring availability
                    </Label>
                  </div>

                  {formData.isRecurring && (
                    <>
                      <div>
                        <Label>Quick Schedule</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickSchedule("weekdays")}
                          >
                            Weekdays (Mon-Fri)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickSchedule("weekends")}
                          >
                            Weekends
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickSchedule("daily")}
                          >
                            Daily
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Select Days</Label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                          {days.map((day) => (
                            <div
                              key={day.value}
                              className="flex flex-col items-center"
                            >
                              <Checkbox
                                id={`day-${day.value}`}
                                checked={formData.selectedDays.includes(
                                  day.value
                                )}
                                onCheckedChange={() =>
                                  handleDayToggle(day.value)
                                }
                              />
                              <Label
                                htmlFor={`day-${day.value}`}
                                className="text-xs mt-1 cursor-pointer"
                              >
                                {day.label.substring(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="recurrenceType">
                          Recurrence Pattern
                        </Label>
                        <Select
                          value={formData.recurrenceType}
                          onValueChange={(
                            value: "daily" | "weekly" | "custom"
                          ) =>
                            setFormData({ ...formData, recurrenceType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Configuration</CardTitle>
                  <p className="text-sm text-gray-600">
                    Configure session length and breaks to optimize your schedule
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionDuration">Session Duration</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {sessionDurationPresets.map((preset) => (
                          <Button
                            key={preset.value}
                            type="button"
                            variant={
                              formData.sessionDuration === preset.value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setFormData({ ...formData, sessionDuration: preset.value })
                            }
                            className={
                              preset.recommended
                                ? "border-[#8159A8] bg-[#8159A8]/10"
                                : ""
                            }
                          >
                            {preset.label}
                            {preset.recommended && (
                              <Badge className="ml-1">
                                Rec
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="breakBetweenSessions">
                        Break Between Sessions
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {breakDurationPresets.map((preset) => (
                          <Button
                            key={preset.value}
                            type="button"
                            variant={
                              formData.breakBetweenSessions === preset.value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setFormData({ ...formData, breakBetweenSessions: preset.value })
                            }
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Card className="bg-[#F5F3FB] border-[#8159A8]/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#8159A8] mb-2">
                        Session Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total sessions per week:</span>
                          <span className="font-medium">
                            {calculateTotalSessions()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session + break time:</span>
                          <span className="font-medium">
                            {formData.sessionDuration +
                              formData.breakBetweenSessions}{" "}
                            minutes
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Selected days:</span>
                          <span className="font-medium">
                            {formData.isRecurring
                              ? formData.selectedDays
                                  .map((d) =>
                                    days
                                      .find((day) => day.value === d)
                                      ?.label.substring(0, 3)
                                  )
                                  .join(", ")
                              : days.find(
                                  (day) => day.value === formData.dayOfWeek
                                )?.label}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overrideDefaultRate"
                      checked={formData.overrideDefaultRate}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          overrideDefaultRate: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="overrideDefaultRate">
                      Override default rate for this availability slot
                    </Label>
                  </div>

                  {formData.overrideDefaultRate && (
                    <div>
                      <Label htmlFor="rate">Session Rate ($)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={formData.rate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rate: parseInt(e.target.value) || 120,
                          })
                        }
                        min="0"
                        step="5"
                      />
                    </div>
                  )}

                  <Card className="bg-[#F5F3FB] border-[#8159A8]/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#8159A8] mb-2">
                        Revenue Projection
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sessions per week:</span>
                          <span className="font-medium">
                            {calculateTotalSessions()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate per session:</span>
                          <span className="font-medium">${formData.rate}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Weekly potential:</span>
                          <span className="font-bold text-[#8159A8]">
                            ${calculatePotentialRevenue()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {editingSlot ? "Update" : "Add"} Availability
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
