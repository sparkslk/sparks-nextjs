"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Briefcase, Calendar, Sunset } from "lucide-react";

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
}

interface QuickScheduleActionsProps {
  onAddTimeSlot: (slot: Omit<TimeSlot, "id">) => void;
  timeSlots?: TimeSlot[];
}

interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  slots: Omit<TimeSlot, "id">[];
}

export function QuickScheduleActions({
  onAddTimeSlot,
  timeSlots = [],
}: QuickScheduleActionsProps) {
  const quickTemplates: QuickTemplate[] = [
    {
      id: "full-day",
      name: "Full Day",
      description: "Mon-Fri, 9 AM - 5 PM with lunch break",
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
      slots: [
        {
          startTime: "09:00",
          endTime: "12:00",
          dayOfWeek: 1,
          isRecurring: true,
          recurrencePattern: {
            type: "custom",
            days: [1, 2, 3, 4, 5],
          },
          sessionDuration: 60,
          breakBetweenSessions: 15,
          isActive: true,
        },
        {
          startTime: "13:00",
          endTime: "17:00",
          dayOfWeek: 1,
          isRecurring: true,
          recurrencePattern: {
            type: "custom",
            days: [1, 2, 3, 4, 5],
          },
          sessionDuration: 60,
          breakBetweenSessions: 15,
          isActive: true,
        },
      ],
    },
    {
      id: "weekend",
      name: "Weekend",
      description: "Sat-Sun, 9 AM - 3 PM",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
      slots: [
        {
          startTime: "09:00",
          endTime: "15:00",
          dayOfWeek: 6,
          isRecurring: true,
          recurrencePattern: {
            type: "custom",
            days: [0, 6],
          },
          sessionDuration: 90,
          breakBetweenSessions: 30,
          isActive: true,
        },
      ],
    },
    {
      id: "evening",
      name: "Evening",
      description: "Mon-Thu, 6 PM - 9 PM",
      icon: Sunset,
      color: "bg-indigo-100 text-indigo-600",
      slots: [
        {
          startTime: "18:00",
          endTime: "21:00",
          dayOfWeek: 1,
          isRecurring: true,
          recurrencePattern: {
            type: "custom",
            days: [1, 2, 3, 4],
          },
          sessionDuration: 60,
          breakBetweenSessions: 15,
          isActive: true,
        },
      ],
    },
  ];

  const handleApplyTemplate = (template: QuickTemplate) => {
    template.slots.forEach((slot) => {
      onAddTimeSlot(slot);
    });
  };

  const calculateTemplateStats = (template: QuickTemplate) => {
    const totalDays = new Set(
      template.slots.flatMap(
        (slot) => slot.recurrencePattern?.days || [slot.dayOfWeek]
      )
    ).size;

    const totalHours = template.slots.reduce((total, slot) => {
      const start = new Date(`1970-01-01T${slot.startTime}:00`);
      const end = new Date(`1970-01-01T${slot.endTime}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

    return { totalDays, totalHours };
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#8159A8]" />
          <CardTitle className="text-xl text-[#8159A8]">
            Quick Actions & Templates
          </CardTitle>
        </div>
        <p className="text-gray-600 text-sm">
          Apply pre-configured schedules to manage your availability efficiently
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTemplates.map((template) => {
            const stats = calculateTemplateStats(template);
            const IconComponent = template.icon;

            return (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className={`p-2 rounded-lg ${template.color} mb-3`}>
                  <IconComponent className="h-5 w-5" />
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Days per week:</span>
                    <span className="font-medium">{stats.totalDays}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Hours per week:</span>
                    <span className="font-medium">{stats.totalHours}h</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleApplyTemplate(template)}
                  size="sm"
                  className="w-full bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                >
                  Apply Template
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
