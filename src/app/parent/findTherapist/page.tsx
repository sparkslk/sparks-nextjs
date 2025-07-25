"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    TherapistSearchBar, 
    TherapistCard,
    TherapistEmptyState,
    TherapistFilters
} from "@/components/FindTherapist";
import { Dialog, Transition } from "@headlessui/react";
import { Listbox } from "@headlessui/react";

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
    patientsCount?: number;
    isChildConnection?: boolean; // Added for modal logic
    highestEducation?: string;
    adhdExperience?: string; // Added for ADHD experience
    email?: string; // Added for email
    dob?: string; // Added for date of birth
    gender?: string
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
    // const [currentTherapist, setCurrentTherapist] = useState<Therapist | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [childTherapistConnections, setChildTherapistConnections] = useState<{ childName: string; therapist: Therapist }[]>([]);
    const [chooseModalOpen, setChooseModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [patients, setPatients] = useState<{ id: string; name: string }[]>([]); // List of patient objects
    const [patientTherapistMap, setPatientTherapistMap] = useState<{ [patient: string]: Therapist | null }>({});
    const [pendingTherapist, setPendingTherapist] = useState<Therapist | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    // Fetch current therapist from patient data
    // useEffect(() => {
    //     const fetchCurrentTherapist = async () => {
    //         try {
    //             const response = await fetch("/api/dashboard");
    //             if (response.ok) {
    //                 const data = await response.json();

    //                 if (data.therapist) {
    //                     // Convert therapist data to Therapist interface format
    //                     const therapistData: Therapist = {
    //                         id: `current-therapist`,
    //                         name: data.therapist.name,
    //                         title: "Licensed Therapist", // Default title
    //                         specialties: data.therapist.specialization || ["General Psychology"], // Use specialization from API
    //                         rating: 4.8, // Default rating
    //                         reviewCount: 0,
    //                         experience: "Licensed Professional",
    //                         sessionTypes: { inPerson: false, online: true },
    //                         availability: {
    //                             nextSlot: "Contact for availability",
    //                             timeSlot: "Schedule via contact",
    //                             timeCategory: "thisWeek" as const
    //                         },
    //                         cost: { isFree: false, priceRange: "Contact for pricing" },
    //                         languages: ["English"],
    //                         tags: ["English"],
    //                         isCurrentTherapist: true
    //                     };

    //                     console.log("Current Therapist Data:", therapistData);

    //                     setCurrentTherapist(therapistData);
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error fetching current therapist:", error);
    //         }
    //     };

    //     fetchCurrentTherapist();
    // }, []);



    // Fetch therapists from API
    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const response = await fetch("/api/therapists");
          
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    // Convert API data to Therapist interface format
                    const formattedTherapists: Therapist[] = data.therapists?.map((therapist: {
                        id: string;
                        name: string;
                        specialization?: string[];
                        experience?: number;
                        image?: string | null;
                        bio?: string;
                        patientsCount?: number;
                        rating?: number | string;
                    }) => ({
                        id: therapist.id,
                        name: therapist.name,
                        title: "Licensed Therapist",
                        specialties: therapist.specialization || ["General Psychology"],
                        rating: typeof therapist.rating === 'number' ? therapist.rating : parseFloat(therapist.rating || '0'), // Parse rating as number
                        // reviewCount: Math.floor(Math.random() * 200) + 50, // Random review count
                        experience: therapist.experience ? `${therapist.experience}+ years` : "0 years",
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
                        bio: therapist.bio || "",
                        patientsCount: typeof therapist.patientsCount === 'number' ? therapist.patientsCount : 0
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

    // Fetch child-therapist connections
    useEffect(() => {
        const fetchChildTherapistConnections = async () => {
            try {
                const response = await fetch("/api/parent/child-therapists");
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    // Use the API data directly, no mock/random fields
                    interface ChildTherapistConnection {
                        childName: string;
                        therapist: {
                            id: string;
                            name: string;
                            specialization?: string[];
                            experience?: number;
                            image?: string | null;
                            bio?: string;
                            patientsCount?: number;
                            rating?: number; // Add rating property
                        };
                    }

                    const formatted = (data.connections || []).map((conn: ChildTherapistConnection) => ({
                        childName: conn.childName,
                        therapist: {
                            id: conn.therapist.id,
                            name: conn.therapist.name,
                            title: "Licensed Therapist",
                            specialties: conn.therapist.specialization || ["General Psychology"],
                            rating: typeof conn.therapist.rating === 'number' ? conn.therapist.rating : parseFloat(conn.therapist.rating || '0'), // Parse rating as number
                            reviewCount: 0,
                            experience: conn.therapist.experience ? `${conn.therapist.experience}+ years` : "0 years",
                            sessionTypes: { inPerson: false, online: true },
                            availability: {
                                nextSlot: "Contact for availability",
                                timeSlot: "Schedule via contact",
                                timeCategory: "thisWeek"
                            },
                            cost: { isFree: false, priceRange: "Contact for pricing" },
                            languages: ["English"],
                            tags: ["English"],
                            image: conn.therapist.image || null,
                            bio: conn.therapist.bio || "",
                            patientsCount: typeof conn.therapist.patientsCount === 'number' ? conn.therapist.patientsCount : 0
                        }
                    }));
                    setChildTherapistConnections(formatted);
                }
            } catch {
                setChildTherapistConnections([]);
            }
        };
        fetchChildTherapistConnections();
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

    // Fetch patients and their therapists (mocked for now)
    useEffect(() => {
        // Replace with real API call

        const fetchPatients = async () => {
            // Example: [{ id: '1', name: 'Alice', therapist: { ... } }, ...]
            const response = await fetch("/api/parent/children");
            if (response.ok) {
                const data = await response.json();
                interface ApiPatient {
                    id: string;
                    firstName: string;
                    lastName?: string;
                    therapist?: Therapist | null;
                }
                setPatients(data.children.map((p: ApiPatient) => ({ id: p.id, name: p.firstName + (p.lastName ? ' ' + p.lastName : '') })));
                const map: { [patient: string]: Therapist | null } = {};
                data.children.forEach((p: ApiPatient) => {
                    const patientName = p.firstName + (p.lastName ? ' ' + p.lastName : '');
                    map[patientName] = p.therapist || null;
                });
                setPatientTherapistMap(map);
            } else {
                setPatients([]);
                setPatientTherapistMap({});
            }
        };
        fetchPatients();
    }, []);

    // Handler for 'Choose Therapist' button
    const handleChooseTherapist = (therapist: Therapist) => {
        setPendingTherapist(therapist);
        setChooseModalOpen(true);
    };

    // Handler for confirming therapist selection
    const confirmChooseTherapist = async () => {
        if (!selectedPatient || !pendingTherapist) return;
        const patientObj = patients.find((p) => p.name === selectedPatient);
        if (!patientObj) return;
        try {
            const response = await fetch("/api/parent/assign-therapist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patientObj.id,
                    therapistId: pendingTherapist.id
                })
            });
            if (!response.ok) {
                throw new Error("Failed to assign therapist");
            }
            setNotification(`Now ${selectedPatient}'s therapist is ${pendingTherapist.name}`);
            setTimeout(() => setNotification(null), 5000);
        } catch (error) {
            console.error(error);
        }
        setChooseModalOpen(false);
        setProfileModalOpen(false);
        setSelectedPatient(null);
        setPendingTherapist(null);
    };

    // Handler for viewing profile
    const handleViewProfile = (therapist: Therapist, isChildConnection: boolean = false) => {
        setSelectedTherapist({ ...therapist, isChildConnection });
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
                                                    <div className="text-sm text-muted-foreground">
                                                        {selectedTherapist.specialties && selectedTherapist.specialties.length > 0
                                                            ? selectedTherapist.specialties.join(", ")
                                                            : "General Psychology"}
                                                    </div>
                                                </div>
                                                {/* Info Cards */}
                                                <div className="flex gap-3 mt-5 mb-2 w-full justify-center">
                                                    <div className="bg-white rounded-xl border border-[#e0d7ed] px-4 py-2 flex flex-col items-center min-w-[80px]">
                                                        <span className="text-base font-semibold text-primary flex items-center gap-1">{selectedTherapist.rating} <svg className="w-4 h-4 text-yellow-400 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg></span>
                                                        <span className="text-xs text-muted-foreground mt-1">Rating</span>
                                                    </div>
                                                    <div className="bg-white rounded-xl border border-[#e0d7ed] px-4 py-2 flex flex-col items-center min-w-[80px]">
                                                        <span className="text-base font-semibold text-primary">{typeof selectedTherapist.patientsCount === 'number' ? selectedTherapist.patientsCount : 'N/A'}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">{selectedTherapist.patientsCount === 1 ? 'Patient' : 'Patients'}</span>
                                                    </div>
                                                    <div className="bg-white rounded-xl border border-[#e0d7ed] px-4 py-2 flex flex-col items-center min-w-[80px]">
                                                        <span className="text-base font-semibold text-primary">{selectedTherapist.experience === '0+ years' || selectedTherapist.experience === '0' ? 'New Therapist' : selectedTherapist.experience}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">Experience</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Details Section */}
                                            <div className="px-7 pt-4 pb-2">
                                                <div className="font-semibold text-primary mb-3 text-lg">Therapist Details</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 bg-[#f8f6fc] rounded-xl p-4 border border-[#e0d7ed]">
                                                    <div className="flex flex-col"><span className="text-xs text-muted-foreground font-semibold uppercase mb-1">Specialty</span><span className="text-base text-foreground">{selectedTherapist.specialties?.join(', ') || 'General Psychology'}</span></div>
                                                    <div className="flex flex-col"><span className="text-xs text-muted-foreground font-semibold uppercase mb-1">Email Address</span><span className="text-base text-foreground">{selectedTherapist.email || 'therapist@email.com'}</span></div>
                                                    <div className="flex flex-col"><span className="text-xs text-muted-foreground font-semibold uppercase mb-1">Highest Education</span><span className="text-base text-foreground">{selectedTherapist.highestEducation || 'PhD in Clinical Psychology'}</span></div>
                                                    <div className="flex flex-col"><span className="text-xs text-muted-foreground font-semibold uppercase mb-1">Gender</span><span className="text-base text-foreground">{selectedTherapist.gender || 'Female'}</span></div>
                                                </div>
                                            </div>
                                            {/* ADHD Experience Section */}
                                            <div className="px-7 pt-2 pb-2">
                                                <div className="font-semibold text-primary mb-1">ADHD-Specific Experience</div>
                                                <div className="text-base text-muted-foreground mb-2">{selectedTherapist.adhdExperience || '5+ years working with ADHD children'}</div>
                                            </div>
                                            {/* About Section */}
                                            <div className="px-7 pt-2 pb-2">
                                                <div className="font-semibold text-primary mb-1">About</div>
                                                <div className="text-sm text-muted-foreground mb-2">{selectedTherapist.bio}</div>
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 px-7 pb-7 pt-2">
                                                {/* Only show button if not a child connection */}
                                                {!selectedTherapist.isChildConnection && (
                                                    <Button variant="default" className="font-semibold w-full h-11 text-base rounded-xl" onClick={() => handleChooseTherapist(selectedTherapist)}>
                                                        Choose Therapist
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Choose Therapist Modal */}
            <Transition.Root show={chooseModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setChooseModalOpen}>
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
                                <Dialog.Panel className="w-full max-w-lg min-h-[380px] transform overflow-hidden rounded-2xl bg-white border border-[#e0d7ed] p-0 text-left align-middle shadow-2xl transition-all">
                                    <div className="p-9 flex flex-col gap-6">
                                        <Dialog.Title as="h3" className="font-bold text-2xl text-primary mb-2">Choose Therapist for Patient</Dialog.Title>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Select Patient</label>
                                            <Listbox value={selectedPatient} onChange={setSelectedPatient}>
                                                <div className="relative">
                                                    <Listbox.Button className="w-full border rounded-lg px-3 py-2 text-left bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/40">
                                                        <span>{selectedPatient || "Select a patient"}</span>
                                                        <svg className="w-5 h-5 text-gray-400 ml-2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-auto">
                                                        {patients.map((patient) => (
                                                            <Listbox.Option key={patient.id} value={patient.name} className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? 'bg-primary/10' : ''}` }>
                                                                {patient.name}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                        </div>
                                        {selectedPatient && patientTherapistMap[selectedPatient] && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                                <strong>Note:</strong> {selectedPatient} already has a primary therapist. If you confirm, their primary therapist will be changed to <span className="font-semibold">{pendingTherapist?.name}</span>. The previous therapist will be politely notified about this change.
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-6">
                                            <Button variant="default" className="flex-1 rounded-lg h-12 text-base font-semibold" disabled={!selectedPatient} onClick={confirmChooseTherapist}>
                                                Confirm
                                            </Button>
                                            <Button variant="outline" className="flex-1 rounded-lg h-12 text-base font-semibold" onClick={() => setChooseModalOpen(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-3">Choose your therapist</h1>
                    {/* Child-therapist connections section */}
                    {childTherapistConnections.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-primary mb-2">Your children and their therapists</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {childTherapistConnections.map((conn) => (
                                    <div key={conn.therapist.id + conn.childName} className="relative">
                                        <TherapistCard
                                            therapist={conn.therapist}
                                            bookingStatus={'idle'}
                                            onViewProfile={() => handleViewProfile(conn.therapist, true)}
                                            viewDetailsText="View Details"
                                        />
                                        <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-3 py-1 rounded-full shadow">
                                            Connected to: <span className="font-semibold">{conn.childName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    {/* Notification */}
                    {notification && (
                        <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-center font-medium">
                            {notification}
                        </div>
                    )}
                    {/* Available Therapists Info */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary text-base">{filteredTherapists.length}</span> therapists available
                        </p>
                    </div>

                    {/* No Current Therapist Message
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
                    )} */}

                    
                    {/* Therapists Grid */}
                    {(() => {
                        // Exclude therapists already connected to a child
                        const connectedTherapistIds = new Set(childTherapistConnections.map(conn => conn.therapist.id));
                        const unconnectedTherapists = filteredTherapists.filter(t => !connectedTherapistIds.has(t.id));
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                                {unconnectedTherapists.map((therapist) => (
                                    <TherapistCard
                                        key={therapist.id}
                                        therapist={therapist}
                                        bookingStatus={'idle'}
                                        onViewProfile={() => handleViewProfile(therapist)}
                                        viewDetailsText="View Details"
                                    />
                                ))}
                            </div>
                        );
                    })()}

                    {filteredTherapists.filter(t => {
                        const connectedTherapistIds = new Set(childTherapistConnections.map(conn => conn.therapist.id));
                        return !connectedTherapistIds.has(t.id);
                    }).length === 0 && (
                        <TherapistEmptyState onClearFilters={clearAllFilters} />
                    )}
                </div>
            </div>
        </div>
    );
}
