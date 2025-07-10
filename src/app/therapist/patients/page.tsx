"use client";

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
    lastSession?: string;
    nextSession?: string;
    status: "active" | "inactive" | "completed";
    age: number;
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
        const fallbackPatients: Patient[] = [
            {
                id: "PT-2024-001",
                firstName: "Vihanga",
                lastName: "Dharmasena",
                dateOfBirth: "2001-03-15",
                gender: "Male",
                phone: "+94 77 123 4567",
                email: "vihanga.d@email.com",
                lastSession: "2025-06-18",
                nextSession: "2025-06-25",
                status: "active",
                age: 24,
            },
            {
                id: "PT-2024-002",
                firstName: "Aryan",
                lastName: "Senarathne",
                dateOfBirth: "2012-08-12",
                gender: "Male",
                phone: "+94 77 123 7890",
                email: "aryan@email.com",
                lastSession: "2025-06-18",
                nextSession: "2025-06-25",
                status: "active",
                age: 12,
            },
        ];

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

            // Use fallback if fetched data is empty or invalid
            if (!data.patients || data.patients.length === 0) {
                console.warn("No patients found from API. Using fallback data.");
                setPatients(fallbackPatients);
            } else {
                setPatients(data.patients);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch patients");
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
                        <h1 className="text-3xl font-bold text-[#8159A8]">Patient Management</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage your patients
                        </p>
                    </div>
                    <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        className="text-purple-600"
                    >
                        Clear all
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search patients by name or ID"
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
                            <SelectItem value="completed">Completed</SelectItem>
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
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {patient.firstName} {patient.lastName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Age: {patient.age}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-8">
                                                <div className="text-sm">
                                                    <p className="font-medium">Last Session:</p>
                                                    <p className="text-muted-foreground">
                                                        {patient.lastSession
                                                            ? new Date(patient.lastSession).toLocaleDateString()
                                                            : "No sessions yet"
                                                        }
                                                    </p>
                                                </div>

                                                <div className="text-sm">
                                                    <p className="font-medium">Next Session:</p>
                                                    <p className="text-muted-foreground">
                                                        {patient.nextSession
                                                            ? new Date(patient.nextSession).toLocaleDateString()
                                                            : "Not scheduled"
                                                        }
                                                    </p>
                                                </div>

                                                {getStatusBadge(patient.status)}

                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/therapist/patients/${patient.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/therapist/patients/${patient.id}/notes`)}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/therapist/appointments/new?patientId=${patient.id}`)}
                                                    >
                                                        <Edit3 className="h-4 w-4" />
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