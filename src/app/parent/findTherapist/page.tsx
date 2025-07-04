"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    TherapistSearchBar,
    TherapistFilters,
    TherapistCard,
    TherapistEmptyState
} from "@/components/FindTherapist";
interface Therapist {
    id: string;
    name: string;
    title: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    experience: string;
    sessionTypes: {
        inPerson: boolean;
        online: boolean;
    };
    availability: {
        nextSlot: string;
        timeSlot: string;
        timeCategory: "today" | "tomorrow" | "thisWeek" | "nextWeek";
    };
    cost: {
        isFree: boolean;
        priceRange: string;
    };
    languages: string[];
    location?: string;
    tags: string[];
    isCurrentTherapist?: boolean;
}

export default function FindTherapistPage() {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("all");
    const [selectedTimeAvailability, setSelectedTimeAvailability] = useState("all");
    const [selectedCost, setSelectedCost] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<{ [key: string]: 'idle' | 'booking' | 'success' | 'error' }>({});
    const [currentTherapist, setCurrentTherapist] = useState<Therapist | null>(null);

    // Fetch current therapist from patient data
    useEffect(() => {
        const fetchCurrentTherapist = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (response.ok) {
                    const data = await response.json();

                    if (data.therapist) {
                        // Convert therapist data to Therapist interface format
                        const therapistData: Therapist = {
                            id: `current-therapist`,
                            name: data.therapist.name,
                            title: "Licensed Therapist", // Default title
                            specialties: data.therapist.specialization || ["General Psychology"], // Use specialization from API
                            rating: 4.8, // Default rating
                            reviewCount: 0,
                            experience: "Licensed Professional",
                            sessionTypes: { inPerson: false, online: true },
                            availability: {
                                nextSlot: "Contact for availability",
                                timeSlot: "Schedule via contact",
                                timeCategory: "thisWeek" as const
                            },
                            cost: { isFree: false, priceRange: "Contact for pricing" },
                            languages: ["English"],
                            tags: ["English"],
                            isCurrentTherapist: true
                        };

                        setCurrentTherapist(therapistData);
                    }
                }
            } catch (error) {
                console.error("Error fetching current therapist:", error);
            }
        };

        fetchCurrentTherapist();
    }, []);



    // Fetch therapists from API
    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const response = await fetch("/api/therapists");
                if (response.ok) {
                    const data = await response.json();

                    // Convert API data to Therapist interface format
                    const formattedTherapists: Therapist[] = data.therapists?.map((therapist: {
                        id: string;
                        name: string;
                        specialization?: string[];
                        experience?: number;
                    }) => ({
                        id: therapist.id,
                        name: therapist.name,
                        title: "Licensed Therapist",
                        specialties: therapist.specialization || ["General Psychology"],
                        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
                        reviewCount: Math.floor(Math.random() * 200) + 50, // Random review count
                        experience: therapist.experience ? `${therapist.experience}+ years experience` : "Licensed Professional",
                        sessionTypes: { inPerson: false, online: true },
                        availability: {
                            nextSlot: getRandomAvailability(),
                            timeSlot: getRandomTimeSlot(),
                            timeCategory: getRandomTimeCategory()
                        },
                        cost: {
                            isFree: Math.random() > 0.7, // 30% chance of being free
                            priceRange: Math.random() > 0.7 ? "Free consultation" : "Rs. 800-1500/session"
                        },
                        languages: ["English"],
                        tags: ["English"]
                    })) || [];

                    setTherapists(formattedTherapists);
                    setFilteredTherapists(formattedTherapists);
                } else {
                    // No therapists available from API
                    console.warn("Failed to fetch therapists from API");
                    setTherapists([]);
                    setFilteredTherapists([]);
                }
            } catch (error) {
                console.error("Error fetching therapists:", error);
                // No therapists available
                setTherapists([]);
                setFilteredTherapists([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    // Helper functions for random data generation
    const getRandomAvailability = () => {
        const options = ["Available Today", "Available Tomorrow", "Available This Week", "Available Next Week"];
        return options[Math.floor(Math.random() * options.length)];
    };

    const getRandomTimeSlot = () => {
        const times = ["Today 2:00 PM", "Tomorrow 10:30 AM", "Friday 3:30 PM", "Monday 11:00 AM"];
        return `Next: ${times[Math.floor(Math.random() * times.length)]}`;
    };

    const getRandomTimeCategory = (): "today" | "tomorrow" | "thisWeek" | "nextWeek" => {
        const categories: ("today" | "tomorrow" | "thisWeek" | "nextWeek")[] = ["today", "tomorrow", "thisWeek", "nextWeek"];
        return categories[Math.floor(Math.random() * categories.length)];
    };

    // Filter therapists based on search and filters
    useEffect(() => {
        let filtered = therapists;

        if (searchQuery) {
            filtered = filtered.filter(therapist =>
                therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                therapist.specialties.some(specialty =>
                    specialty.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        if (selectedSpecialty !== "all") {
            filtered = filtered.filter(therapist =>
                therapist.specialties.some(specialty =>
                    specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
                )
            );
        }

        if (selectedTimeAvailability !== "all") {
            filtered = filtered.filter(therapist =>
                therapist.availability.timeCategory === selectedTimeAvailability
            );
        }

        if (selectedCost !== "all") {
            if (selectedCost === "free") {
                filtered = filtered.filter(therapist => therapist.cost.isFree);
            } else if (selectedCost === "paid") {
                filtered = filtered.filter(therapist => !therapist.cost.isFree);
            }
        }

        setFilteredTherapists(filtered);
    }, [searchQuery, selectedSpecialty, selectedTimeAvailability, selectedCost, therapists]);

    const handleBookSession = async (therapistId: string) => {
        setBookingStatus(prev => ({ ...prev, [therapistId]: 'booking' }));

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setBookingStatus(prev => ({ ...prev, [therapistId]: 'success' }));
            setTimeout(() => {
                setBookingStatus(prev => ({ ...prev, [therapistId]: 'idle' }));
            }, 3000);
        } catch {
            setBookingStatus(prev => ({ ...prev, [therapistId]: 'error' }));
            setTimeout(() => {
                setBookingStatus(prev => ({ ...prev, [therapistId]: 'idle' }));
            }, 3000);
        }
    };

    const clearAllFilters = () => {
        setSearchQuery("");
        setSelectedSpecialty("all");
        setSelectedTimeAvailability("all");
        setSelectedCost("all");
        setShowFilters(false);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedSpecialty !== "all") count++;
        if (selectedTimeAvailability !== "all") count++;
        if (selectedCost !== "all") count++;
        return count;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading therapists...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
            <div className="max-w-6xl mx-auto px-6 py-1">
                {/* Header Section */}
                <div className="mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {currentTherapist ? 'Your Therapist & Explore More' : 'Find a Therapist'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {currentTherapist
                            ? 'Manage your current therapist relationship and find additional support'
                            : 'Find the right mental health professional for your needs'
                        }
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Available Therapists Info */}
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {filteredTherapists.length} therapists available
                        </p>
                    </div>

                {/* No Current Therapist Message */}
                {!currentTherapist && (
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/images/doctor.png"
                                    alt="Doctor"
                                    width={120}
                                    height={120}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
                                    Start Your Mental Health Journey
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    You haven&apos;t connected with a therapist yet. Browse our qualified professionals below to find the perfect match for your needs. All our therapists are licensed and experienced in providing quality mental health care.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                        Licensed Professionals
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-600">
                                        Individual Therapy
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600">
                                        Online & In-Person Sessions
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Therapist Section */}
                {currentTherapist && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Your Current Therapist</h2>
                                <p className="text-sm text-muted-foreground">Your assigned mental health professional</p>
                            </div>
                        </div>

                        <div className="bg-card rounded-lg border p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                    <span className="font-semibold text-sm text-primary">
                                        {currentTherapist.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{currentTherapist.name}</h3>
                                    <p className="text-sm text-muted-foreground">{currentTherapist.title}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {currentTherapist.specialties.slice(0, 3).map((specialty, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600">
                                            Current Therapist
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600">
                                            Online Sessions
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/20 hover:bg-primary/5"
                                    onClick={() => alert(`Contact ${currentTherapist.name}`)}
                                >
                                    Contact
                                </Button>
                            </div>
                        </div>

                        <div className="text-center border-t pt-6">
                            <h3 className="text-lg font-medium text-foreground mb-2">Looking for Additional Support?</h3>
                            <p className="text-muted-foreground text-sm">
                                Explore more therapists below to find additional specialists or alternative options
                            </p>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                        <TherapistSearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </div>

                    <div className="bg-card rounded-lg border p-4">
                        <TherapistFilters
                            selectedSpecialty={selectedSpecialty}
                            setSelectedSpecialty={setSelectedSpecialty}
                            selectedTimeAvailability={selectedTimeAvailability}
                            setSelectedTimeAvailability={setSelectedTimeAvailability}
                            selectedCost={selectedCost}
                            setSelectedCost={setSelectedCost}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            activeFiltersCount={getActiveFiltersCount()}
                            onClearAllFilters={clearAllFilters}
                        />
                    </div>
                </div>

                {/* Therapists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTherapists.map((therapist) => (
                        <TherapistCard
                            key={therapist.id}
                            therapist={therapist}
                            bookingStatus={bookingStatus[therapist.id] || 'idle'}
                            onBookSession={handleBookSession}
                        />
                    ))}
                </div>

                {filteredTherapists.length === 0 && (
                    <TherapistEmptyState onClearFilters={clearAllFilters} />
                )}
                </div>
            </div>
        </div>
    );
}
