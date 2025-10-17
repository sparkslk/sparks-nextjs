"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    User,
    Check,
    X,
    MessageCircle,
    Calendar,
    CheckCircle,
    XCircle
} from "lucide-react";

interface PatientRequest {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    email?: string;
    image?: string | null;
    requestedAt: string;
    status: "pending" | "accepted" | "rejected";
    age: number;
    message?: string;
    preferredSessionType: "in-person" | "online" | "both";
    urgencyLevel: "low" | "medium" | "high";
}

interface PatientAvatarProps {
    patient: PatientRequest;
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

interface ConfirmationModalState {
    isOpen: boolean;
    action: 'accept' | 'reject' | null;
    requestId: string | null;
    patientName: string;
    showSuccess: boolean;
}

export default function PatientRequestsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
        isOpen: false,
        action: null,
        requestId: null,
        patientName: '',
        showSuccess: false
    });

    const fetchPatientRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/therapist/patient-requests", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Therapist profile not found. Please contact support.");
                }
                throw new Error(`Failed to fetch patient requests: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Fetched patient requests:", data);

            setPatientRequests(data.requests || []);
        } catch (error) {
            console.error("Error fetching patient requests:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch patient requests");
            setPatientRequests([]);
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
            fetchPatientRequests();
        }
    }, [status, router, fetchPatientRequests]);

    // Filter to show only pending requests
    const pendingRequests = patientRequests.filter(request => request.status === "pending");

    const showConfirmationModal = (action: 'accept' | 'reject', requestId: string, patientName: string) => {
        setConfirmationModal({
            isOpen: true,
            action,
            requestId,
            patientName,
            showSuccess: false
        });
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({
            isOpen: false,
            action: null,
            requestId: null,
            patientName: '',
            showSuccess: false
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmationModal.requestId || !confirmationModal.action) return;

        try {
            setActionLoading(confirmationModal.requestId);

            const response = await fetch("/api/therapist/patient-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requestId: confirmationModal.requestId,
                    action: confirmationModal.action
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${confirmationModal.action} request`);
            }

            const data = await response.json();
            console.log(`Request ${confirmationModal.action}ed:`, data);

            // Remove the processed request from the list
            setPatientRequests(prev => 
                prev.filter(req => req.id !== confirmationModal.requestId)
            );

            // Show success message
            setConfirmationModal(prev => ({
                ...prev,
                showSuccess: true
            }));

            // Auto close after 2 seconds
            setTimeout(() => {
                closeConfirmationModal();
            }, 2000);

        } catch (error) {
            console.error(`Error ${confirmationModal.action}ing request:`, error);
            // Close modal and optionally show error
            closeConfirmationModal();
        } finally {
            setActionLoading(null);
        }
    };

    const handleAcceptRequest = (requestId: string, patientName: string) => {
        showConfirmationModal('accept', requestId, patientName);
    };

    const handleRejectRequest = (requestId: string, patientName: string) => {
        showConfirmationModal('reject', requestId, patientName);
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading patient requests...</p>
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
                        <p className="text-lg font-semibold">Error Loading Patient Requests</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <Button onClick={fetchPatientRequests}>Try Again</Button>
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
                        <h1 className="text-3xl font-bold text-primary">Patient Requests</h1>
                        <p className="text-muted-foreground mt-1">
                            Review and respond to pending requests from patients who want you as their therapist
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/therapist/patients')}
                        variant="default"
                        className="text-white"
                    >
                        View Your Patients
                    </Button>
                </div>


                {/* Patient Requests List */}
                <div>
                    <div className="flex items-center mb-4">
                        
                        <Badge variant="secondary" className="text-base px-3 py-1">
                            {pendingRequests.length} Pending
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {pendingRequests.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No patient requests found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        You don&apos;t have any pending patient requests yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            pendingRequests.map((request) => (
                                <Card key={request.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 sm:p-6 lg:p-8">
                                        {/* Mobile Layout */}
                                        <div className="flex flex-col space-y-4 sm:hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <PatientAvatar patient={request} size="sm" />
                                                    <div>
                                                        <h3 className="font-semibold text-sm">
                                                            {request.firstName} {request.lastName}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Age: {request.age} • {request.gender} • {request.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(request.requestedAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {request.message && (
                                                <div className="text-xs">
                                                    <p className="font-medium">Message:</p>
                                                    <p className="text-muted-foreground bg-gray-50 p-2 rounded text-xs">
                                                        {request.message}
                                                    </p>
                                                </div>
                                            )}

                                            {request.status === "pending" ? (
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRejectRequest(request.id, `${request.firstName} ${request.lastName}`)}
                                                        disabled={actionLoading === request.id}
                                                        className="px-3 py-2 hover:bg-red-50 text-red-600 border-red-200"
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleAcceptRequest(request.id, `${request.firstName} ${request.lastName}`)}
                                                        disabled={actionLoading === request.id}
                                                        className="px-3 py-2"
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Accept
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/therapist/messages`)}
                                                        className="px-3 py-2 hover:bg-blue-50"
                                                    >
                                                        <MessageCircle className="h-4 w-4 mr-1" />
                                                        Message
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:flex items-center justify-between">
                                            <div className="flex items-center space-x-4 lg:space-x-6">
                                                <PatientAvatar patient={request} size="md" />
                                                <div>
                                                    <h3 className="font-semibold text-sm lg:text-base">
                                                        {request.firstName} {request.lastName}
                                                    </h3>
                                                    <p className="text-xs lg:text-sm text-muted-foreground">
                                                        Age: {request.age} • {request.gender} • {request.phone} • {request.email}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4 lg:space-x-8">
                                                <div className="flex items-center space-x-1 lg:space-x-2">
                                                    {request.status === "pending" ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRejectRequest(request.id, `${request.firstName} ${request.lastName}`)}
                                                                disabled={actionLoading === request.id}
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleAcceptRequest(request.id, `${request.firstName} ${request.lastName}`)}
                                                                disabled={actionLoading === request.id}
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Accept
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.push(`/therapist/messages`)}
                                                            className="h-8 w-8 lg:h-10 lg:w-10"
                                                        >
                                                            <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message section for desktop - only show if message exists */}
                                        {request.message && (
                                            <div className="hidden sm:block mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm font-medium mb-2">Patient Message:</p>
                                                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                                    {request.message}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={confirmationModal.isOpen} onOpenChange={closeConfirmationModal}>
                <DialogContent className="sm:max-w-md">
                    {confirmationModal.showSuccess ? (
                        // Success State
                        <div className="text-center py-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <DialogTitle className="text-lg font-semibold text-green-800 mb-2">
                                Request {confirmationModal.action === 'accept' ? 'Accepted' : 'Rejected'} Successfully!
                            </DialogTitle>
                            <DialogDescription className="text-green-600">
                                {confirmationModal.action === 'accept' 
                                    ? `${confirmationModal.patientName} has been added to your patient list.`
                                    : `${confirmationModal.patientName}'s request has been declined.`
                                }
                            </DialogDescription>
                        </div>
                    ) : (
                        // Confirmation State
                        <>
                            <DialogHeader>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                                    {confirmationModal.action === 'accept' ? (
                                        <Check className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    )}
                                </div>
                                <DialogTitle className="text-center">
                                    {confirmationModal.action === 'accept' ? 'Accept Patient Request' : 'Reject Patient Request'}
                                </DialogTitle>
                                <DialogDescription className="text-center">
                                    Are you sure you want to {confirmationModal.action} the request from{' '}
                                    <span className="font-semibold">{confirmationModal.patientName}</span>?
                                    {confirmationModal.action === 'accept' && (
                                        <span className="block mt-2 text-sm">
                                            This patient will be added to your patient list and will be able to book sessions with you.
                                        </span>
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={closeConfirmationModal}
                                    disabled={actionLoading !== null}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant={confirmationModal.action === 'accept' ? 'default' : 'destructive'}
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading !== null}
                                    className="w-full sm:w-auto"
                                >
                                    {actionLoading !== null ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            {confirmationModal.action === 'accept' ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Accept Request
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject Request
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
