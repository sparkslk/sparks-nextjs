"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Plus,
    Filter,
    User,
    Calendar,
    FileText,
    Phone,
    Mail,
    MoreHorizontal
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
    status: "active" | "inactive" | "completed";
    nextAppointment?: string;
}

export default function PatientsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchPatients();
        }
    }, [status, router]);

    const fetchPatients = async () => {
        try {
            const response = await fetch("/api/therapist/patients");
            if (!response.ok) {
                throw new Error("Failed to fetch patients");
            }
            const data = await response.json();
            setPatients(data.patients || []);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const variants = {
            active: "default",
            inactive: "secondary",
            completed: "outline"
        } as const;

        return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
    };

    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <DashboardLayout
            title="Patient Management"
            subtitle="View and manage your patients"
        >
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search patients..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={() => router.push("/therapist/patients/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Patient
                </Button>
            </div>

            {/* Patients List */}
            <div className="grid gap-4">
                {filteredPatients.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <User className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first patient"}
                            </p>
                            {!searchTerm && (
                                <Button onClick={() => router.push("/therapist/patients/new")}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Patient
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredPatients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {patient.firstName} {patient.lastName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {patient.gender} • Age {calculateAge(patient.dateOfBirth)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(patient.status)}
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{patient.phone || "No phone"}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{patient.email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {patient.nextAppointment
                                                ? `Next: ${new Date(patient.nextAppointment).toLocaleDateString()}`
                                                : "No upcoming appointments"
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/therapist/patients/${patient.id}`)}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Details
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => router.push(`/therapist/appointments/new?patientId=${patient.id}`)}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Schedule
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
