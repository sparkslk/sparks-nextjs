// components/ParentNavigation.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState} from "react";
import NotificationBell from "@/components/NotificationBell";

const tabs = [
    { name: 'Overview', path: '/parent/dashboard' },
    { name: 'My Children', path: '/parent/children' },
    { name: 'Find Therapists', path: '/parent/findTherapist' },
    { name: 'Messages', path: '/parent/messages' },
    { name: 'Appointments', path: '/parent/appointments' },
    { name: 'Resources', path: '/parent/resources' }
];

interface ParentData {
    children: Array<{
        firstName: string;
        lastName: string;
    }>;
    parentName: string;
}

export default function ParentNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [parentData, setParentData] = useState<ParentData | null>(null);

    useEffect(() => {
        fetchParentData();
    }, []);

    const fetchParentData = async () => {
        try {
            const response = await fetch("/api/parent/dashboard");
            if (response.ok) {
                const data = await response.json();
                setParentData(data);
            }
        } catch (error) {
            console.error("Error fetching parent data:", error);
        }
    };

    const handleTabClick = (path: string) => {
        router.push(path);
    };

    const handleSignOut = async () => {
        try {
            // Clear all potential session storage
            sessionStorage.clear();
            localStorage.clear();

            // Call custom logout API to clear cookies
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            // Sign out with proper cleanup
            await signOut({
                callbackUrl: "/login",
                redirect: true
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback to regular signOut if custom logout fails
            await signOut({
                callbackUrl: "/login",
                redirect: true
            });
        }
    };

    const getActiveTab = () => {
        const currentTab = tabs.find(tab => tab.path === pathname);
        return currentTab?.name || 'Overview';
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
                            <span className="text-muted-foreground font-medium">SPARKS</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <span className="text-md font-semibold" style={{ color: '#8159A8' }}>
                                    {parentData?.parentName}
                                </span>
                            </div>
                            <NotificationBell />
                            <Button variant="ghost" size="icon" className="hover:bg-accent">
                                <Settings className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8159A8' }}>
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4 mr-2" />
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
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${getActiveTab() === tab.name
                                        ? 'text-muted-foreground hover:text-muted-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                                    }`}
                                style={getActiveTab() === tab.name ? { borderBottomColor: '#8159A8', color: '#8159A8' } : {}}
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