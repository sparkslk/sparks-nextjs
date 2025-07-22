"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MessageCircle, ArrowLeft, AlertCircle, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Therapist {
    id: string;
    name: string;
    email: string;
    image: string | null;
    specialization: string[];
    experience: number | null;
    bio: string | null;
}

export default function RequestSessionPage() {
    const { status } = useSession();
    const router = useRouter();
    const [assignedTherapist, setAssignedTherapist] = useState<Therapist | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNoTherapist, setHasNoTherapist] = useState(false);
    const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [formData, setFormData] = useState({
        therapistId: "",
        sessionType: "",
        preferredDate: "",
        preferredTime: "",
        notes: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchAssignedTherapist();
        }
    }, [status, router]);

    const fetchAssignedTherapist = async () => {
        try {
            const response = await fetch("/api/patient/assigned-therapist");
            if (!response.ok) {
                throw new Error("Failed to fetch assigned therapist");
            }
            const data = await response.json();

            if (data.therapist) {
                setAssignedTherapist(data.therapist);
                setFormData(prev => ({
                    ...prev,
                    therapistId: data.therapist.id
                }));
            } else {
                setHasNoTherapist(true);
            }
        } catch (error) {
            console.error("Error fetching assigned therapist:", error);
            setError("Failed to load therapist information");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.therapistId || !formData.sessionType || !formData.preferredDate || !formData.preferredTime) {
            setError("Please fill in all required fields");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuggestedSlots([]);

        try {
            const response = await fetch("/api/sessions/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    therapistId: formData.therapistId,
                    sessionType: formData.sessionType,
                    preferredDateTime: `${formData.preferredDate}T${formData.preferredTime}`,
                    notes: formData.notes
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to submit session request");
                if (errorData.suggestedSlots) {
                    setSuggestedSlots(errorData.suggestedSlots);
                }
                return;
            }

            // Success - redirect to dashboard
            router.push("/dashboard?success=session-requested");
        } catch (error) {
            console.error("Error submitting session request:", error);
            setError(error instanceof Error ? error.message : "Failed to submit session request");
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // If date changes and we have a therapist, fetch available slots
        if (field === "preferredDate" && value && assignedTherapist) {
            fetchAvailableSlots(value);
        }
    };

    const fetchAvailableSlots = async (date: string) => {
        if (!assignedTherapist) return;
        
        setLoadingSlots(true);
        try {
            const response = await fetch(
                `/api/therapist/availability/slots?therapistId=${assignedTherapist.id}&date=${date}&duration=60`
            );
            
            if (response.ok) {
                const data = await response.json();
                setAvailableSlots(data.slots || []);
            } else {
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
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

    const sessionTypes = [
        "Individual Therapy",
        "Group Therapy",
        "Family Therapy",
        "Consultation",
        "Assessment",
        "Follow-up"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold mb-2">Request a Session</h1>
                        <p className="text-muted-foreground">
                            Schedule a therapy session with one of our qualified therapists.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5" />
                                Session Request Form
                            </CardTitle>
                            <CardDescription>
                                Please provide your preferences, and we&apos;ll confirm your appointment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasNoTherapist ? (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        You don't have an assigned therapist yet. Please visit the{" "}
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto font-semibold"
                                            onClick={() => router.push("/patient/find-therapist")}
                                        >
                                            Find a Therapist
                                        </Button>{" "}
                                        page to request a therapist first.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Assigned Therapist Display */}
                                    <div className="space-y-2">
                                        <Label>Your Therapist</Label>
                                        <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                                            {assignedTherapist?.image ? (
                                                <img
                                                    src={assignedTherapist.image}
                                                    alt={assignedTherapist.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <UserCheck className="h-6 w-6 text-primary" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{assignedTherapist?.name}</div>
                                                {assignedTherapist?.specialization && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {assignedTherapist.specialization.join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Session Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionType">Session Type *</Label>
                                        <Select
                                            value={formData.sessionType}
                                            onValueChange={(value) => handleInputChange("sessionType", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select session type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sessionTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Preferred Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="preferredDate">Preferred Date *</Label>
                                        <Input
                                            id="preferredDate"
                                            type="date"
                                            value={formData.preferredDate}
                                            onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                                                    {/* Preferred Time */}
                                <div className="space-y-2">
                                    <Label htmlFor="preferredTime">Preferred Time *</Label>
                                    <Input
                                        id="preferredTime"
                                        type="time"
                                        value={formData.preferredTime}
                                        onChange={(e) => handleInputChange("preferredTime", e.target.value)}
                                        required
                                    />
                                    
                                    {/* Available Slots */}
                                    {formData.preferredDate && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm font-medium">
                                                    Available Times for {new Date(formData.preferredDate).toLocaleDateString()}:
                                                </Label>
                                                {loadingSlots && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                )}
                                            </div>
                                            {availableSlots.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {availableSlots.map((slot, index) => (
                                                        <Button
                                                            key={index}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleInputChange("preferredTime", slot)}
                                                            className={`text-xs ${
                                                                formData.preferredTime === slot 
                                                                    ? "bg-primary text-primary-foreground" 
                                                                    : ""
                                                            }`}
                                                        >
                                                            {slot}
                                                        </Button>
                                                    ))}
                                                </div>
                                            ) : !loadingSlots ? (
                                                <p className="text-sm text-muted-foreground">
                                                    No available slots for this date. Please select a different date.
                                                </p>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Any specific concerns, goals, or requirements for this session..."
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange("notes", e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                                                    {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                        <p className="text-destructive text-sm">{error}</p>
                                        {suggestedSlots.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Suggested alternative times:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestedSlots.map((slot, index) => (
                                                        <Button
                                                            key={index}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const [hours, minutes] = slot.split(':');
                                                                const date = new Date(formData.preferredDate);
                                                                date.setHours(parseInt(hours), parseInt(minutes));
                                                                handleInputChange("preferredTime", slot);
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            {slot}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <MessageCircle className="mr-2 h-4 w-4" />
                                                    Submit Request
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <Clock className="mr-2 h-4 w-4" />
                                What happens next?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>• Your session request will be reviewed by the selected therapist</p>
                                <p>• You&apos;ll receive a confirmation or alternative time suggestions within 24 hours</p>
                                <p>• Once confirmed, you&apos;ll receive session details and preparation instructions</p>
                                <p>• If you need to cancel or reschedule, please do so at least 24 hours in advance</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
