import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, FileText } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  iconType?: "users" | "calendar" | "message" | "file";
}

const iconMap = {
  users: Users,
  calendar: Calendar,
  message: MessageSquare,
  file: FileText,
};

export function StatsCard({ title, value, description, iconType }: StatsCardProps) {
  const IconComponent = iconType ? iconMap[iconType] : null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          {IconComponent && (
            <div className="flex-shrink-0 ml-4">
              <IconComponent 
                className="h-12 w-12 transition-all duration-300 group-hover:scale-110"
                style={{ color: '#8159A8' }}
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}