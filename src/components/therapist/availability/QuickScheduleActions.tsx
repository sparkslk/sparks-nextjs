"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Briefcase,
  Coffee,
  Sunset,
  Zap,
  Users,
  Heart,
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
}

interface QuickScheduleActionsProps {
  onAddTimeSlot: (slot: Omit<TimeSlot, "id">) => void;
}

interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  slots: Omit<TimeSlot, "id">[];
  badge?: string;
}

export function QuickScheduleActions({
  onAddTimeSlot,
}: QuickScheduleActionsProps) {
  const quickTemplates: QuickTemplate[] = [
    {
      id: "standard-business",
      name: "Standard Business Hours",
      description: "Mon-Fri, 9 AM - 5 PM with lunch break",
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
      badge: "Most Popular",
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
      id: "flexible-weekdays",
      name: "Flexible Weekdays",
      description: "Mon-Fri, 10 AM - 6 PM continuous",
      icon: Clock,
      color: "bg-green-100 text-green-600",
      slots: [
        {
          startTime: "10:00",
          endTime: "18:00",
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
      id: "weekend-warrior",
      name: "Weekend Availability",
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
      id: "early-bird",
      name: "Early Bird Special",
      description: "Mon-Fri, 7 AM - 11 AM",
      icon: Coffee,
      color: "bg-orange-100 text-orange-600",
      slots: [
        {
          startTime: "07:00",
          endTime: "11:00",
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
      id: "evening-sessions",
      name: "Evening Sessions",
      description: "Mon-Thu, 5 PM - 9 PM",
      icon: Sunset,
      color: "bg-indigo-100 text-indigo-600",
      slots: [
        {
          startTime: "17:00",
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
    {
      id: "intensive-therapy",
      name: "Intensive Therapy Days",
      description: "Tue-Thu, longer sessions with breaks",
      icon: Heart,
      color: "bg-pink-100 text-pink-600",
      badge: "Specialized",
      slots: [
        {
          startTime: "09:00",
          endTime: "17:00",
          dayOfWeek: 2,
          isRecurring: true,
          recurrencePattern: {
            type: "custom",
            days: [2, 3, 4],
          },
          sessionDuration: 90,
          breakBetweenSessions: 30,
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
    const totalSlots = template.slots.length;
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

    return { totalSlots, totalDays, totalHours };
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#8159A8]" />
          <CardTitle className="text-xl text-[#8159A8]">
            Quick Schedule Templates
          </CardTitle>
        </div>
        <p className="text-gray-600 text-sm">
          Apply pre-configured schedules to get started quickly
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
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${template.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {template.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {template.badge}
                    </Badge>
                  )}
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Time slots:</span>
                    <span className="font-medium">{stats.totalSlots}</span>
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

        <div className="mt-6 p-4 bg-[#F5F3FB] rounded-lg border border-[#8159A8]/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#8159A8]/10 rounded-lg">
              <Users className="h-5 w-5 text-[#8159A8]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#8159A8] mb-2">
                Custom Schedule Builder
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Need something more specific? Use our advanced schedule builder
                to create custom availability patterns that match your exact
                needs.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#8159A8] text-[#8159A8] hover:bg-[#F5F3FB]"
                >
                  Import from Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#8159A8] text-[#8159A8] hover:bg-[#F5F3FB]"
                >
                  Copy from Previous Week
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
