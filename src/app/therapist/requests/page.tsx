"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft, RefreshCw, Check, X } from "lucide-react";

interface SessionRequest {
    id: string;
    scheduledAt: string;
    duration: number;
    type: string;
    status: string;
    patientName: string;
    notes?: string;
    createdAt: string;
}

export default function TherapistRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<SessionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/therapist/session-requests");
            if (!response.ok) {
                throw new Error("Failed to fetch session requests");
            }
            const data = await response.json();
            setRequests(data.requests);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setError("Failed to load session requests");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId: string, action: "approve" | "decline") => {
        try {
            setActionLoading(requestId);
            const response = await fetch("/api/therapist/session-requests/respond", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requestId, action }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action} request`);
            }

            // Refresh the requests list
            await fetchRequests();
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            setError(`Failed to ${action} request`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "REQUESTED":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "SCHEDULED":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "DECLINED":
                return "bg-red-100 text-red-800 border-red-200";
            case "COMPLETED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "CANCELLED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading session requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Session Requests</h1>
                                <p className="text-muted-foreground">
                                    Review and respond to patient session requests
                                </p>
                            </div>
                            <Button onClick={fetchRequests} variant="outline" size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-red-800">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Requests List */}
                    {requests.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Session Requests</h3>
                                <p className="text-muted-foreground">
                                    You don&apos;t have any pending session requests at the moment.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <Card key={request.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Calendar className="h-5 w-5 text-primary" />
                                                <div>
                                                    <CardTitle className="text-lg">{request.type}</CardTitle>
                                                    <CardDescription>
                                                        from {request.patientName}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Date</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(request.scheduledAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Time</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatTime(request.scheduledAt)} ({request.duration} min)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Patient</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {request.patientName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {request.notes && (
                                            <div className="p-3 bg-muted/20 rounded-lg mb-4">
                                                <p className="text-sm font-medium mb-1">Patient Notes</p>
                                                <p className="text-sm text-muted-foreground">{request.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-muted-foreground">
                                                Requested on {new Date(request.createdAt).toLocaleDateString()}
                                            </div>

                                            {request.status === "REQUESTED" && (
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRequestAction(request.id, "decline")}
                                                        disabled={actionLoading === request.id}
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        <X className="mr-1 h-3 w-3" />
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRequestAction(request.id, "approve")}
                                                        disabled={actionLoading === request.id}
                                                    >
                                                        <Check className="mr-1 h-3 w-3" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
