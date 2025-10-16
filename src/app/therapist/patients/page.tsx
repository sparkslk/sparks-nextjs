"use client";
import Image from "next/image";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    User,
    Eye,
    MessageCircle,
    Edit3
} from "lucide-react";

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    email?: string;
    image?: string | null;
    lastSession?: string;
    nextSession?: string;
    status: "active" | "inactive" | "completed";
    age: number;
}

interface PatientAvatarProps {
    patient: Patient;
    size?: "sm" | "md";
}

function PatientAvatar({ patient, size = "sm" }: PatientAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const sizeClasses = size === "sm" 
        ? "w-10 h-10" 
        : "w-10 h-10 lg:w-12 lg:h-12";
    const iconSizeClasses = size === "sm" 
        ? "h-5 w-5" 
        : "h-5 w-5 lg:h-6 lg:w-6";

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const showUserIcon = !patient.image || imageError || !imageLoaded;

    return (
        <div className={`${sizeClasses} bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative`}>
            {patient.image && !imageError && (
                <Image
                    src={patient.image}
                    alt={`${patient.firstName} ${patient.lastName}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{ display: imageLoaded && !imageError ? 'block' : 'none' }}
                    fill
                    sizes="100vw"
                />
            )}
            {showUserIcon && (
                <User className={`${iconSizeClasses} text-gray-600`} />
            )}
        </div>
    );
}

export default function PatientsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [ageGroupFilter, setAgeGroupFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sessionFilter, setSessionFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/therapist/patients", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Therapist profile not found. Please contact support.");
                }
                throw new Error(`Failed to fetch patients: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Fetched patients:", data);

            setPatients(data.patients || []);
        } catch (error) {
            console.error("Error fetching patients:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch patients");
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchPatients();
        }
    }, [status, router, fetchPatients]);

    // Filter patients based on search and filters
    const filteredPatients = patients.filter(patient => {
        // Search filter
        const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase());

        // Age group filter
        const matchesAgeGroup = ageGroupFilter === "all" ||
            (ageGroupFilter === "child" && patient.age < 18) ||
            (ageGroupFilter === "adult" && patient.age >= 18 && patient.age < 65) ||
            (ageGroupFilter === "senior" && patient.age >= 65);

        // Status filter
        const matchesStatus = statusFilter === "all" || patient.status === statusFilter;

        // Session filter
        const matchesSession = sessionFilter === "all" ||
            (sessionFilter === "recent" && patient.lastSession &&
                new Date(patient.lastSession) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
            (sessionFilter === "upcoming" && patient.nextSession) ||
            (sessionFilter === "overdue" && !patient.nextSession && patient.lastSession &&
                new Date(patient.lastSession) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

        return matchesSearch && matchesAgeGroup && matchesStatus && matchesSession;
    });

    const getStatusBadge = (status: string) => {
        const config = {
            active: { variant: "default" as const, className: "bg-green-100 text-green-800" },
            inactive: { variant: "secondary" as const, className: "bg-red-100 text-red-800" },
            completed: { variant: "outline" as const, className: "" }
        };

        const statusConfig = config[status as keyof typeof config] || config.inactive;

        return (
            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setAgeGroupFilter("all");
        setStatusFilter("all");
        setSessionFilter("all");
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading patients...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <User className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-semibold">Error Loading Patients</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <Button onClick={fetchPatients}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Patient Management</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage your patients
                        </p>
                    </div>
                    <Button
                        onClick={clearAllFilters}
                        variant="default"
                        className="text-white"
                    >
                        View Patient Requests
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or ID"
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Age group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ages</SelectItem>
                            <SelectItem value="child">Child (0-17)</SelectItem>
                            <SelectItem value="adult">Adult (18-64)</SelectItem>
                            <SelectItem value="senior">Senior (65+)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Treatment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sessionFilter} onValueChange={setSessionFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Next Session" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Session</SelectItem>
                            <SelectItem value="upcoming">Has Upcoming</SelectItem>
                            <SelectItem value="recent">Recent Session</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sessionFilter} onValueChange={setSessionFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Last Session" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Last Session</SelectItem>
                            <SelectItem value="recent">Recent (30 days)</SelectItem>
                            <SelectItem value="old">Older than 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end">
                        <Button
                            onClick={clearAllFilters}
                            variant="outline"
                            className="text-primary px-4 py-2 h-auto w-auto"
                            style={{ minWidth: "unset" }}
                        >
                            Clear all
                        </Button>
                    </div>
                </div>

                {/* Patients List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Patients List ({filteredPatients.length})
                    </h2>

                    <div className="space-y-3">
                        {filteredPatients.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        {patients.length === 0
                                            ? "You don't have any patients assigned yet."
                                            : "No patients match your current filters."
                                        }
                                    </p>
                                    {/* {patients.length === 0 && (
                                        <Button onClick={() => router.push("/therapist/patients/new")}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Patient
                                        </Button>
                                    )} */}
                                </CardContent>
                            </Card>
                        ) : (
                            filteredPatients.map((patient) => (
                                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 sm:p-6 lg:p-8">
                                        {/* Mobile Layout */}
                                        <div className="flex flex-col space-y-4 sm:hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <PatientAvatar patient={patient} size="sm" />
                                                    <div>
                                                        <h3 className="font-semibold text-sm">
                                                            {patient.firstName} {patient.lastName}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Age: {patient.age}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <p className="font-medium">Last Session:</p>
                                                    <p className="text-muted-foreground">
                                                        {patient.lastSession
                                                            ? new Date(patient.lastSession).toLocaleDateString()
                                                            : "No sessions yet"
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Next Session:</p>
                                                    <p className="text-muted-foreground">
                                                        {patient.nextSession
                                                            ? new Date(patient.nextSession).toLocaleDateString()
                                                            : "Not scheduled"
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/therapist/patients/${patient.id}`)}
                                                    className="px-3 py-2 hover:bg-primary/10"
                                                    title="View patient details"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/therapist/chat/${patient.id}`)}
                                                    className="px-3 py-2 hover:bg-blue-50"
                                                    title="Message patient"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-1" />
                                                    Message
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/therapist/patients/${patient.id}/sessions`)}
                                                    className="px-3 py-2 hover:bg-green-50"
                                                    title="Edit session notes"
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:flex items-center justify-between">
                                            <div className="flex items-center space-x-4 lg:space-x-6">
                                                <PatientAvatar patient={patient} size="md" />
                                                <div>
                                                    <h3 className="font-semibold text-sm lg:text-base">
                                                        {patient.firstName} {patient.lastName}
                                                    </h3>
                                                    <p className="text-xs lg:text-sm text-muted-foreground">
                                                        Age: {patient.age}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4 lg:space-x-8 xl:space-x-20">
                                                <div className="text-xs lg:text-sm hidden md:block">
                                                    <p className="font-medium">Last Session:</p>
                                                    <p className="text-muted-foreground">
                                                        {patient.lastSession
                                                            ? new Date(patient.lastSession).toLocaleDateString()
                                                            : "No sessions yet"
                                                        }
                                                    </p>
                                                </div>

                                                <div className="text-xs lg:text-sm hidden md:block">
                                                    <p className="font-medium">Next Session:</p>
                                                    <p className="text-muted-foreground">
                                                        {patient.nextSession
                                                            ? new Date(patient.nextSession).toLocaleDateString()
                                                            : "Not scheduled"
                                                        }
                                                    </p>
                                                </div>

                                                <div className="flex items-center space-x-1 lg:space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/therapist/patients/${patient.id}`)}
                                                        className="h-8 w-8 lg:h-10 lg:w-10"
                                                    >
                                                        <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/therapist/messages`)}
                                                        className="h-8 w-8 lg:h-10 lg:w-10"
                                                    >
                                                        <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
