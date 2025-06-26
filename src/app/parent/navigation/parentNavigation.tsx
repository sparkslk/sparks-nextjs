// components/ParentNavigation.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import Image from "next/image";

const tabs = [
    { name: 'Overview', path: '/parent/dashboard' },
    { name: 'My Children', path: '/parent/children' },
    { name: 'Messages', path: '/parent/messages' },
    { name: 'Appointments', path: '/parent/appointments' },
    { name: 'Resources', path: '/parent/resources' }
];

interface ParentNavigationProps {
    parentData?: {
        children: Array<{
            firstName: string;
        }>;
    };
}

export default function ParentNavigation({ parentData }: ParentNavigationProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleTabClick = (path: string) => {
        router.push(path);
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
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
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <div className="text-right">
                                <Badge variant="secondary" className="text-xs">
                                    {parentData?.children[0]?.firstName || 'Parent Guardian'}
                                </Badge>
                                
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary"></div>
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
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/50'
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