"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, UserCheck, Shield } from "lucide-react";

interface UserStats {
  totalUsers: number;
  patients: number;
  therapists: number;
  guardians: number;
  managers: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
    {
      label: "Patients",
      value: stats.patients,
      icon: Heart,
      color: "bg-pink-100 text-pink-700",
    },
    {
      label: "Therapists",
      value: stats.therapists,
      icon: UserCheck,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Guardians",
      value: stats.guardians,
      icon: Shield,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Managers",
      value: stats.managers,
      icon: Shield,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="shadow-md border rounded-lg">
            <CardContent className="flex items-center p-4 space-x-4">
              <div className={`p-2 rounded-full ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-xl font-semibold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserStatsCards;
