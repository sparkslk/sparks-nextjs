"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const tabs = [
  { name: "Overview", path: "/manager/dashboard" },
  { name: "User Management", path: "/manager/users" },
  { name: "Session Oversight", path: "/manager/sessions" },
  { name: "Therapist requests", path: "/manager/applications" },
  //{ name: "Financial Reports", path: "/manager/reports" },
  { name: "Game Management", path: "/manager/games" },
  { name: "Assessments", path: "/manager/assessments" },
  //{ name: "Blogs", path: "/manager/blogs" },
];

interface ManagerData {
  systemStatus: "online" | "offline" | "maintenance";
  totalUsers: number;
  securityAlerts: number;
  managerInfo?: {
    name?: string;
    role?: string;
  };
}

export default function ManagerNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [managerData, setManagerData] = useState<ManagerData | null>(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const response = await fetch("/api/manager/dashboard");
      if (response.ok) {
        const data = await response.json();
        setManagerData(data);
      }
    } catch (error) {
      console.error("Error fetching manager data:", error);
    }
  };

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getActiveTab = () => {
    const currentTab = tabs.find((tab) => tab.path === pathname);
    return currentTab?.name || "Overview";
  };

  const getSystemStatusColor = () => {
    if (!managerData?.systemStatus) return "bg-gray-500";
    switch (managerData.systemStatus) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getNotificationCount = () => {
    return managerData?.securityAlerts || 0;
  };

  return (
    <>
      {/* Header */}
      <div className="bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-2 py-0.2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/sparkslogo.png"
                alt="SPARKS Logo"
                width={80}
                height={80}
                className="rounded-lg"
              />
              <div>
                <span className="text-foreground font-bold text-lg">
                  SPARKS Manager
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getSystemStatusColor()}`}
                  ></div>
                  <span className="text-xs text-muted-foreground capitalize">
                    System {managerData?.systemStatus || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {getNotificationCount() > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {getNotificationCount() > 9 ? "9+" : getNotificationCount()}
                  </div>
                )}
              </div>
              <div className="text-right">
                {/*<div className="text-xs text-muted-foreground mt-0.5">
                                    {managerData?.totalUsers?.toLocaleString() || 0} total users
                                </div>*/}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.path)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  getActiveTab() === tab.name
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/50"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
