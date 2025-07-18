"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    TherapistSearchBar,
    TherapistFilters,
    TherapistCard,
    TherapistEmptyState
} from "@/components/FindTherapist";
import { Dialog, Transition } from "@headlessui/react";

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
    image?: string | null;
    isCurrentTherapist?: boolean;
    bio?: string;
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
    // const [bookingStatus, setBookingStatus] = useState<{ [key: string]: 'idle' | 'booking' | 'success' | 'error' }>({});
    const [currentTherapist, setCurrentTherapist] = useState<Therapist | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

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

                        console.log("Current Therapist Data:", therapistData);

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
                        image?: string | null;
                        bio?: string;
                    }) => ({
                        id: therapist.id,
                        name: therapist.name,
                        title: "Licensed Therapist",
                        specialties: therapist.specialization || ["General Psychology"],
                        rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10, // Random rating between 4.5-5.0, rounded to 1 decimal
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
                        tags: ["English"],
                        image: therapist.image || null,
                        bio: therapist.bio || ""
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

    // const handleBookSession = async (therapistId: string) => {
    //     setBookingStatus(prev => ({ ...prev, [therapistId]: 'booking' }));

    //     // Simulate API call
    //     try {
    //         await new Promise(resolve => setTimeout(resolve, 1500));
    //         setBookingStatus(prev => ({ ...prev, [therapistId]: 'success' }));
    //         setTimeout(() => {
    //             setBookingStatus(prev => ({ ...prev, [therapistId]: 'idle' }));
    //         }, 3000);
    //     } catch {
    //         setBookingStatus(prev => ({ ...prev, [therapistId]: 'error' }));
    //         setTimeout(() => {
    //             setBookingStatus(prev => ({ ...prev, [therapistId]: 'idle' }));
    //         }, 3000);
    //     }
    // };

    // Handler for viewing profile
    const handleViewProfile = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setProfileModalOpen(true);
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
        <div className="min-h-screen ">
            {/* Therapist Profile Modal */}
            <Transition.Root show={profileModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setProfileModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 transition-opacity" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white border border-[#e0d7ed] p-0 text-left align-middle shadow-2xl transition-all">
                                    {selectedTherapist && (
                                        <div className="flex flex-col">
                                            {/* Profile Header */}
                                            <div className="bg-[#f5f3fb] px-7 pt-7 pb-4 rounded-t-2xl flex flex-col items-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-[#e0d7ed] rounded-full flex items-center justify-center border border-[#e0d7ed] shadow mb-3">
                                                    {selectedTherapist.image && typeof selectedTherapist.image === 'string' && selectedTherapist.image.trim() !== '' ? (
                                                        <Image
                                                            src={selectedTherapist.image}
                                                            alt={selectedTherapist.name}
                                                            width={80}
                                                            height={80}
                                                            className="object-cover w-20 h-20 rounded-full"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-3xl text-primary">
                                                            {selectedTherapist.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-xl text-foreground">{selectedTherapist.name}</div>
                                                    <div className="text-sm text-muted-foreground">{selectedTherapist.title}</div>
                                                </div>
                                                {/* Info Cards */}
                                                <div className="flex gap-3 mt-5 mb-2 w-full justify-center">
                                                    <div className="bg-white rounded-xl border border-[#e0d7ed] px-4 py-2 flex flex-col items-center min-w-[80px]">
                                                        <span className="text-base font-semibold text-primary flex items-center gap-1">{selectedTherapist.rating} <svg className="w-4 h-4 text-yellow-400 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg></span>
                                                        <span className="text-xs text-muted-foreground mt-1">Rating</span>
                                                    </div>
                                                    <div className="bg-white rounded-xl border border-[#e0d7ed] px-4 py-2 flex flex-col items-center min-w-[80px]">
                                                        <span className="text-base font-semibold text-primary">1000+</span>
                                                        <span className="text-xs text-muted-foreground mt-1">Patients</span>
                                                    </div>
                                                    <div className="bg-white rounded-xl border border-[#e0d7ed] px-4 py-2 flex flex-col items-center min-w-[80px]">
                                                        <span className="text-base font-semibold text-primary">10+ Years</span>
                                                        <span className="text-xs text-muted-foreground mt-1">Experience</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* About Section */}
                                            <div className="px-7 pt-4 pb-2">
                                                <div className="font-semibold text-primary mb-1">About</div>
                                                <div className="text-sm text-muted-foreground mb-2">{selectedTherapist.bio}</div>
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 px-7 pb-7 pt-2">
                                                <Button variant="default" className="font-semibold w-full h-11 text-base rounded-xl">Choose Therapist</Button>
                                                <Button variant="outline" className="font-semibold w-full h-11 text-base rounded-xl border-primary text-primary hover:bg-primary/10">View Other Therapists</Button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-3">Choose your therapist</h1>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                            <TherapistSearchBar
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-muted-foreground/20 text-muted-foreground hover:bg-primary/10 relative"
                                onClick={() => setShowFilters((prev) => !prev)}
                                aria-label="Show filters"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5h18M6 12h12M9 19h6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {getActiveFiltersCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 font-semibold border border-white">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </Button>
                            {getActiveFiltersCount() > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-muted-foreground hover:text-primary font-medium"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-2">
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
                    )}
                </div>

                <div className="space-y-8">
                    {/* Available Therapists Info */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary text-base">{filteredTherapists.length}</span> therapists available
                        </p>
                    </div>

                    {/* No Current Therapist Message */}
                    {!currentTherapist && (
                        <div className="bg-white rounded-2xl border border-[#e0d7ed] shadow-sm p-8 flex items-center gap-6">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/images/doctor.png"
                                    alt="Doctor"
                                    width={100}
                                    height={100}
                                    className="object-contain rounded-xl border border-[#e0d7ed] bg-[#f5f3fb]"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-[#8159A8] bg-clip-text text-transparent mb-2">
                                    Start Your Mental Health Journey
                                </h3>
                                <p className="text-muted-foreground mb-4 text-base">
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
                    )}

                    {/* Current Therapist Section */}
                    {/* {currentTherapist && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-[#8159A8] bg-clip-text text-transparent">Your Current Therapist</h2>
                                    <p className="text-sm text-muted-foreground">Your assigned mental health professional</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-[#e0d7ed] shadow-sm p-6 flex items-center gap-5">
                                <div className="w-14 h-14 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                    <span className="font-semibold text-lg text-primary">
                                        {currentTherapist.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground text-lg">{currentTherapist.name}</h3>
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
                                    className="border-primary/20 hover:bg-primary/5 font-semibold"
                                    onClick={() => alert(`Contact ${currentTherapist.name}`)}
                                >
                                    Contact
                                </Button>
                            </div>

                            <div className="text-center border-t pt-6">
                                <h3 className="text-lg font-medium text-foreground mb-2">Looking for Additional Support?</h3>
                                <p className="text-muted-foreground text-sm">
                                    Explore more therapists below to find additional specialists or alternative options
                                </p>
                            </div>
                        </div>
                    )} */}

                    {/* Search and Filters */}
                    {/* <div className="space-y-3">
                        <div className="bg-white rounded-xl border border-[#e0d7ed] shadow-sm p-4">
                            <TherapistSearchBar
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-[#e0d7ed] shadow-sm p-4">
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
                    </div> */}

                    {/* Therapists Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                        {filteredTherapists.map((therapist) => (
                            <TherapistCard
                                key={therapist.id}
                                therapist={therapist}
                                bookingStatus={'idle'}
                                onViewProfile={() => handleViewProfile(therapist)}
                                viewDetailsText="View Details"
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
