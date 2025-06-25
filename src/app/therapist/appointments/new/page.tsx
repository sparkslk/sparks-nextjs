"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Calendar } from "lucide-react";

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
}

interface SessionForm {
    patientId: string;
    scheduledAt: string;
    duration: number;
    type: string;
    location: string;
    notes: string;
    objectives: string[];
}

export default function NewAppointmentPage() {
    const { status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [formData, setFormData] = useState<SessionForm>({
        patientId: "",
        scheduledAt: "",
        duration: 60,
        type: "individual",
        location: "",
        notes: "",
        objectives: []
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchPatients();

            // Check for pre-selected patient from URL params
            const urlParams = new URLSearchParams(window.location.search);
            const patientId = urlParams.get("patientId");
            if (patientId) {
                setFormData(prev => ({ ...prev, patientId }));
            }
        }
    }, [status, router]);

    const fetchPatients = async () => {
        try {
            const response = await fetch("/api/therapist/patients");
            if (response.ok) {
                const data = await response.json();
                setPatients(data.patients || []);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    const handleInputChange = (field: keyof SessionForm, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/therapist/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to schedule appointment");
            }

            // Redirect to appointments list or dashboard
            router.push("/therapist/dashboard");
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            alert(error instanceof Error ? error.message : "Failed to schedule appointment");
        } finally {
            setLoading(false);
        }
    };

    // Generate time slots for today and future dates
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Schedule Appointment
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Book a new therapy session
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold">New Appointment</h2>
                            <p className="text-muted-foreground">Schedule a therapy session with your patient</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Session Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Session Details
                                </CardTitle>
                                <CardDescription>
                                    Basic information about the therapy session
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patientId">Patient *</Label>
                                    <Select
                                        value={formData.patientId}
                                        onValueChange={(value: string) => handleInputChange("patientId", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.firstName} {patient.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.scheduledAt.split('T')[0] || ""}
                                            onChange={(e) => {
                                                const time = formData.scheduledAt.split('T')[1] || "09:00";
                                                const newDateTime = `${e.target.value}T${time}`;
                                                handleInputChange("scheduledAt", newDateTime);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time">Time *</Label>
                                        <Select
                                            value={formData.scheduledAt.split('T')[1]?.substring(0, 5) || ""}
                                            onValueChange={(value: string) => {
                                                const date = formData.scheduledAt.split('T')[0] || new Date().toISOString().split('T')[0];
                                                const newDateTime = `${date}T${value}:00`;
                                                handleInputChange("scheduledAt", newDateTime);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (minutes) *</Label>
                                        <Select
                                            value={formData.duration.toString()}
                                            onValueChange={(value: string) => handleInputChange("duration", parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                                <SelectItem value="90">90 minutes</SelectItem>
                                                <SelectItem value="120">120 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Session Type *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: string) => handleInputChange("type", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select session type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">Individual Therapy</SelectItem>
                                                <SelectItem value="group">Group Therapy</SelectItem>
                                                <SelectItem value="family">Family Therapy</SelectItem>
                                                <SelectItem value="couples">Couples Therapy</SelectItem>
                                                <SelectItem value="assessment">Assessment</SelectItem>
                                                <SelectItem value="consultation">Consultation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Office, telehealth, etc."
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Session Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Session Planning</CardTitle>
                                <CardDescription>
                                    Notes and objectives for this session
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objectives">Session Objectives</Label>
                                    <Input
                                        id="objectives"
                                        type="text"
                                        placeholder="Enter objectives separated by commas"
                                        value={formData.objectives.join(", ")}
                                        onChange={(e) => handleInputChange("objectives", e.target.value.split(",").map(obj => obj.trim()).filter(obj => obj))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Separate multiple objectives with commas
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Session Notes</Label>
                                    <Textarea
                                        id="notes"
                                        rows={4}
                                        placeholder="Any preparation notes or special considerations for this session..."
                                        value={formData.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || !formData.patientId || !formData.scheduledAt}>
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Schedule Appointment
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
