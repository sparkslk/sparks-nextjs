// components/ParentNavigation.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Menu, X } from "lucide-react";
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
    parentImage?: string | null;
}

export default function ParentNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [parentData, setParentData] = useState<ParentData | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        if (pathname === '/parent/children' || (pathname ?? "").startsWith('/parent/children/tasks')) {
            return 'My Children';
        }
        if ((pathname ?? "").startsWith('/parent/sessions')) {
            return 'Appointments';
        }
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
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
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
                                {parentData?.parentImage ? (
                                    <Image
                                        src={parentData.parentImage}
                                        alt={parentData.parentName || 'Parent'}
                                        width={32}
                                        height={32}
                                        className="object-cover w-8 h-8 rounded-full"
                                        priority
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8159A8' }}>
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="hover:bg-accent"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-col space-y-4">
                            <div className="text-center">
                                <span className="text-md font-semibold" style={{ color: '#8159A8' }}>
                                    {parentData?.parentName}
                                </span>
                            </div>
                            <div className="flex justify-center space-x-4">
                                <NotificationBell />
                                <Button variant="ghost" size="icon" className="hover:bg-accent">
                                    <Settings className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center space-x-2">
                                    {parentData?.parentImage ? (
                                        <Image
                                            src={parentData.parentImage}
                                            alt={parentData.parentName || 'Parent'}
                                            width={32}
                                            height={32}
                                            className="object-cover w-8 h-8 rounded-full"
                                            priority
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8159A8' }}>
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <Button variant="outline" onClick={handleSignOut}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Section */}
            <div className="bg-background border-b border-border shadow-lg" style={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 8px 24px rgba(129,89,168,0.1)',
                transform: 'translateY(-2px)'
            }}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    {/* Desktop Navigation Tabs */}
                    <div className="hidden md:flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => handleTabClick(tab.path)}
                                className={`pb-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out transform ${getActiveTab() === tab.name
                                        ? 'text-muted-foreground hover:text-muted-foreground translate-y-1 shadow-inner bg-gray-100 rounded-t-lg'
                                        : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:translate-y-0.5'
                                    }`}
                                style={getActiveTab() === tab.name ? { 
                                    borderBottomColor: '#8159A8', 
                                    color: '#8159A8',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                } : {}}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Navigation Tabs */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-2 gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => handleTabClick(tab.path)}
                                    className={`py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform ${getActiveTab() === tab.name
                                            ? 'text-white translate-y-1 shadow-inner'
                                            : 'text-muted-foreground hover:text-muted-foreground hover:bg-accent hover:translate-y-0.5'
                                        }`}
                                    style={getActiveTab() === tab.name ? { 
                                        backgroundColor: '#8159A8',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                                    } : {}}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}