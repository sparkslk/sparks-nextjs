"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import {
  Calendar,
  Users,
  Bell,
  FileText,
  BarChart3,
  Settings,
  User,
  ClipboardList,
  MessageSquare,
  Home,
  LogOut,
  ChevronUp,
  Bookmark,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Menu items data
const getMenuItems = (pendingRequests: number) => ({
  overview: [
    {
      title: "Dashboard",
      url: "/therapist/dashboard",
      icon: Home,
      badge: null,
    },
    {
      title: "Session Requests",
      url: "/therapist/requests",
      icon: Bell,
      badge: pendingRequests > 0 ? pendingRequests.toString() : null,
    },
  ],
  clinical: [
    {
      title: "Patients",
      icon: Users,
      items: [
        {
          title: "All Patients",
          url: "/therapist/patients",
        },
        {
          title: "Add New Patient",
          url: "/therapist/patients/new",
        },
      ],
    },
    {
      title: "Sessions",
      icon: Calendar,
      items: [
        {
          title: "All Sessions",
          url: "/therapist/sessions",
        },
        {
          title: "Set Availability",
          url: "/therapist/setAvailability",
        },
        {
          title: "Schedule New",
          url: "/therapist/appointments/new",
        },
        
        /* {
          title: "Session Notes",
          url: "/therapist/sessions/notes",
        }, */
      ],
    },
    {
      title: "Assessments",
      icon: ClipboardList,
      items: [
        {
          title: "View Assessments",
          url: "/therapist/assessments",
        },
        {
          title: "Create Assessment",
          url: "/therapist/assessments/new",
        },
      ],
    },
  ],
  analytics: [
    {
      title: "Reports",
      url: "/therapist/reports",
      icon: BarChart3,
    },
    {
      title: "Analytics",
      url: "/therapist/analytics",
      icon: FileText,
    },
  ],
  communication: [
    {
      title: "Messages",
      url: "/therapist/messages",
      icon: MessageSquare,
      badge: "3",
    },
    {
      title: "Blogs",
      url: "/therapist/blogs",
      icon: Bookmark,
      badge: null,
    },
  ],
});

interface TherapistSidebarProps {
  children: React.ReactNode;
}

export function TherapistSidebar({ children }: TherapistSidebarProps) {
  const pathname = usePathname();
  const [pendingRequests, setPendingRequests] = React.useState(0);
  const [therapistData, setTherapistData] = React.useState<{
    name: string | null;
    email: string | null;
    licenseNumber: string | null;
    specialization: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get menu items with current pending requests count
  const menuItems = getMenuItems(pendingRequests);

  // Fetch therapist data and pending requests count
  React.useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        setIsLoading(true);

        // Fetch therapist profile
        const profileResponse = await fetch("/api/therapist/profile");
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTherapistData({
            name: profileData.user?.name || null,
            email: profileData.user?.email || null,
            licenseNumber: profileData.licenseNumber || null,
            specialization: profileData.specialization || [],
          });
        }

        // Fetch pending requests count
        const requestsResponse = await fetch(
          "/api/therapist/session-requests/count"
        );
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setPendingRequests(requestsData.count);
        }
      } catch (error) {
        console.error("Failed to fetch therapist data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapistData();

    // Poll pending requests every 30 seconds for updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/therapist/session-requests/count");
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Sparks Therapy
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Therapist Portal
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* Overview Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.overview.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="w-full"
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {item.badge === "pending" && pendingRequests > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {pendingRequests}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Clinical Management Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Clinical Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.clinical.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <SidebarMenuButton asChild>
                          <div className="flex items-center gap-2">
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Analytics Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.analytics.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Communication Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Communication</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.communication.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src="/placeholder-avatar.jpg"
                        alt="Therapist"
                      />
                      <AvatarFallback className="rounded-lg">
                        {isLoading
                          ? "..."
                          : getInitials(
                              therapistData?.name || therapistData?.email || "T"
                            )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {isLoading
                          ? "Loading..."
                          : therapistData?.name ||
                            therapistData?.email?.split("@")[0] ||
                            "Therapist"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {isLoading
                          ? ""
                          : therapistData?.licenseNumber
                          ? `License: ${therapistData.licenseNumber}`
                          : "Licensed Therapist"}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/therapist/profile"
                      className="flex items-center gap-2"
                    >
                      <User className="size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/therapist/settings"
                      className="flex items-center gap-2"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">
              {pathname === "/therapist/dashboard" && "Dashboard"}
              {pathname === "/therapist/requests" && "Session Requests"}
              {pathname === "/therapist/patients" && "Patients"}
              {pathname === "/therapist/appointments" && "Appointments"}
              {pathname === "/therapist/sessions" && "Sessions"}
              {pathname === "/therapist/assessments" && "Assessments"}
              {pathname === "/therapist/reports" && "Reports"}
              {pathname === "/therapist/analytics" && "Analytics"}
              {pathname === "/therapist/messages" && "Messages"}
              {pathname === "/therapist/blogs" && "Blog Management"}
            </h1>
          </div>
          <NotificationBell />
        </header>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
