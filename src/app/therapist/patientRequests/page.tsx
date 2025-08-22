"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
    Check,
    X,
    MessageCircle,
    Calendar,
    Clock
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

export default function PatientRequestsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Mock data for demonstration
    useEffect(() => {
        if (status === "authenticated") {
            // Simulate loading
            setLoading(true);
            setTimeout(() => {
                setPatientRequests([
                    {
                        id: "req001",
                        patientId: "pat001",
                        firstName: "Emma",
                        lastName: "Johnson",
                        dateOfBirth: "2010-05-15",
                        gender: "female",
                        phone: "+1234567890",
                        email: "emma.parent@email.com",
                        image: null,
                        requestedAt: "2024-01-15T10:30:00Z",
                        status: "pending",
                        age: 14,
                        message: "My daughter needs help with anxiety and focus issues. She's been struggling at school lately.",
                        preferredSessionType: "online",
                        urgencyLevel: "high"
                    },
                    {
                        id: "req002",
                        patientId: "pat002",
                        firstName: "Alex",
                        lastName: "Chen",
                        dateOfBirth: "2008-09-22",
                        gender: "male",
                        phone: "+1234567891",
                        email: "alex.chen@email.com",
                        image: null,
                        requestedAt: "2024-01-14T14:20:00Z",
                        status: "pending",
                        age: 16,
                        message: "Looking for therapy sessions to help with ADHD management and study techniques.",
                        preferredSessionType: "in-person",
                        urgencyLevel: "medium"
                    },
                    {
                        id: "req003",
                        patientId: "pat003",
                        firstName: "Sophia",
                        lastName: "Williams",
                        dateOfBirth: "2012-03-08",
                        gender: "female",
                        phone: "+1234567892",
                        email: "sophia.parent@email.com",
                        image: null,
                        requestedAt: "2024-01-13T09:15:00Z",
                        status: "accepted",
                        age: 12,
                        message: "Need support for behavioral issues and emotional regulation.",
                        preferredSessionType: "both",
                        urgencyLevel: "medium"
                    },
                    {
                        id: "req004",
                        patientId: "pat004",
                        firstName: "Michael",
                        lastName: "Brown",
                        dateOfBirth: "2009-11-30",
                        gender: "male",
                        phone: "+1234567893",
                        email: "michael.parent@email.com",
                        image: null,
                        requestedAt: "2024-01-12T16:45:00Z",
                        status: "rejected",
                        age: 15,
                        message: "Seeking help with social anxiety and communication skills.",
                        preferredSessionType: "online",
                        urgencyLevel: "low"
                    },
                    {
                        id: "req005",
                        patientId: "pat005",
                        firstName: "Isabella",
                        lastName: "Davis",
                        dateOfBirth: "2011-07-18",
                        gender: "female",
                        phone: "+1234567894",
                        email: "isabella.parent@email.com",
                        image: null,
                        requestedAt: "2024-01-11T11:30:00Z",
                        status: "pending",
                        age: 13,
                        message: "My daughter needs help dealing with stress and perfectionism.",
                        preferredSessionType: "in-person",
                        urgencyLevel: "high"
                    }
                ]);
                setLoading(false);
            }, 1000);
        }
    }, [status]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
    }, [status, router]);

    // Filter patient requests based on search and filters
    const filteredRequests = patientRequests.filter(request => {
        // Search filter
        const matchesSearch = `${request.firstName} ${request.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.id.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === "all" || request.status === statusFilter;

        // Urgency filter
        const matchesUrgency = urgencyFilter === "all" || request.urgencyLevel === urgencyFilter;

        // Session type filter
        const matchesSessionType = sessionTypeFilter === "all" || request.preferredSessionType === sessionTypeFilter;

        return matchesSearch && matchesStatus && matchesUrgency && matchesSessionType;
    });

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
            accepted: { variant: "default" as const, className: "bg-green-100 text-green-800" },
            rejected: { variant: "outline" as const, className: "bg-red-100 text-red-800" }
        };

        const statusConfig = config[status as keyof typeof config] || config.pending;

        return (
            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getUrgencyBadge = (urgency: string) => {
        const config = {
            low: { className: "bg-blue-100 text-blue-800" },
            medium: { className: "bg-orange-100 text-orange-800" },
            high: { className: "bg-red-100 text-red-800" }
        };

        const urgencyConfig = config[urgency as keyof typeof config] || config.low;

        return (
            <Badge variant="outline" className={urgencyConfig.className}>
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
            </Badge>
        );
    };

    const handleAcceptRequest = async (requestId: string) => {
        setActionLoading(requestId);
        // Simulate API call
        setTimeout(() => {
            setPatientRequests(prev => 
                prev.map(req => 
                    req.id === requestId 
                        ? { ...req, status: "accepted" as const }
                        : req
                )
            );
            setActionLoading(null);
        }, 1000);
    };

    const handleRejectRequest = async (requestId: string) => {
        setActionLoading(requestId);
        // Simulate API call
        setTimeout(() => {
            setPatientRequests(prev => 
                prev.map(req => 
                    req.id === requestId 
                        ? { ...req, status: "rejected" as const }
                        : req
                )
            );
            setActionLoading(null);
        }, 1000);
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setUrgencyFilter("all");
        setSessionTypeFilter("all");
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Patient Requests</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage incoming requests from patients who want you as their therapist
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/therapist/patients')}
                        variant="default"
                        className="text-white"
                    >
                        View All Patients
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Request Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Urgency Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Session Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
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

                {/* Patient Requests List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Patient Requests ({filteredRequests.length})
                    </h2>

                    <div className="space-y-3">
                        {filteredRequests.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No patient requests found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        {patientRequests.length === 0
                                            ? "You don't have any patient requests yet."
                                            : "No requests match your current filters."
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredRequests.map((request) => (
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
                                                            Age: {request.age}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(request.status)}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                {getUrgencyBadge(request.urgencyLevel)}
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(request.requestedAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="text-xs">
                                                <p className="font-medium">Preferred Session:</p>
                                                <p className="text-muted-foreground capitalize">
                                                    {request.preferredSessionType}
                                                </p>
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
                                                        onClick={() => handleRejectRequest(request.id)}
                                                        disabled={actionLoading === request.id}
                                                        className="px-3 py-2 hover:bg-red-50 text-red-600 border-red-200"
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleAcceptRequest(request.id)}
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
                                                        Age: {request.age} • {request.email}
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
                                                <div className="text-xs lg:text-sm hidden md:block">
                                                    <p className="font-medium">Session Type:</p>
                                                    <p className="text-muted-foreground capitalize">
                                                        {request.preferredSessionType}
                                                    </p>
                                                </div>

                                                <div className="hidden lg:block">
                                                    {getUrgencyBadge(request.urgencyLevel)}
                                                </div>

                                                {getStatusBadge(request.status)}

                                                <div className="flex items-center space-x-1 lg:space-x-2">
                                                    {request.status === "pending" ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRejectRequest(request.id)}
                                                                disabled={actionLoading === request.id}
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleAcceptRequest(request.id)}
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
        </div>
    );
}
