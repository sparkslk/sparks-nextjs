"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Appointment {
    id: string;
    patientName: string;
    scheduledAt: string;
    duration: number;
    type: string;
    status: "scheduled" | "confirmed" | "completed" | "cancelled";
    notes?: string;
}

export default function TherapistAppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/therapist/appointments");
            if (!response.ok) {
                throw new Error("Failed to fetch appointments");
            }
            const data = await response.json();
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setError("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            scheduled: "secondary",
            confirmed: "default",
            completed: "outline",
            cancelled: "destructive"
        } as const;

        return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Unable to load appointments</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            Appointments
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your scheduled therapy sessions
                        </p>
                    </div>
                    <Button onClick={() => router.push("/therapist/appointments/new")} className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule New
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by patient name or session type..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full p-2 border border-border rounded-lg bg-background"
                                >
                                    <option value="all">All Status</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                        <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || filterStatus !== "all"
                                            ? "Try adjusting your search or filter criteria."
                                            : "You don't have any appointments scheduled yet."
                                        }
                                    </p>
                                    <Button onClick={() => router.push("/therapist/appointments/new")} variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Schedule First Appointment
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredAppointments.map((appointment) => (
                            <Card key={appointment.id} className="border-0 shadow-lg bg-card/95 backdrop-blur hover:shadow-xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                                                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-13">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(appointment.scheduledAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} ({appointment.duration} min)
                                                </div>
                                            </div>
                                            {appointment.notes && (
                                                <p className="text-sm text-muted-foreground mt-2 ml-13">{appointment.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(appointment.status)}
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
