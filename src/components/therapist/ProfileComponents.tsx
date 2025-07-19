"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, TrendingUp, ExternalLink } from "lucide-react";

interface StatsCardProps {
  stats: {
    totalPatients: number;
    todayAppointments: number;
    completedSessions: number;
    pendingTasks: number;
  };
}

export function ProfileStatsCard({ stats }: StatsCardProps) {
  const statsItems = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      href: "/therapist/patients",
    },
    {
      label: "Today's Sessions",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-50",
      href: "/therapist/sessions",
    },
    {
      label: "Completed Sessions",
      value: stats.completedSessions,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      href: "/therapist/sessions",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      href: "/therapist/dashboard",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Quick Stats
          <Button variant="ghost" size="sm" asChild>
            <a href="/therapist/dashboard" className="flex items-center gap-1">
              <span className="text-xs">View All</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {statsItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-auto p-3 flex items-center justify-between hover:bg-gray-50"
            asChild
          >
            <a href={item.href}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-semibold">{item.value}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

interface SpecializationDisplayProps {
  specializations: string[];
  isEditing: boolean;
  onEdit?: (specializations: string[]) => void;
}

export function SpecializationDisplay({ 
  specializations, 
  isEditing, 
  onEdit 
}: SpecializationDisplayProps) {
  if (isEditing && onEdit) {
    return (
      <div className="flex flex-wrap gap-2">
        {specializations.map((spec, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="text-sm cursor-pointer hover:bg-red-100 hover:text-red-700"
            onClick={() => {
              const newSpecs = specializations.filter((_, i) => i !== index);
              onEdit(newSpecs);
            }}
          >
            {spec} ×
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {specializations && specializations.length > 0 ? (
        specializations.map((spec, index) => (
          <Badge key={index} variant="secondary" className="text-sm">
            {spec}
          </Badge>
        ))
      ) : (
        <p className="text-muted-foreground">No specializations listed</p>
      )}
    </div>
  );
}
