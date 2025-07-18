"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import {
  TherapistSearchBar,
  TherapistFilters,
  TherapistCard,
  TherapistEmptyState,
  LoadingSpinner
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
  connectedChild?: string;
}

interface Child {
  id: string;
  firstName: string;
  therapist?: {
    name: string;
    email: string;
  };
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
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'booking' | 'success' | 'error'}>({});
  const [connectedTherapists, setConnectedTherapists] = useState<Therapist[]>([]);

  // Fetch connected therapists from children data
  useEffect(() => {
    const fetchConnectedTherapists = async () => {
      try {
        const response = await fetch("/api/parent/children");
        if (response.ok) {
          const data = await response.json();
          const childrenWithTherapists = data.children?.filter((child: Child) => child.therapist) || [];
          
          // Convert therapist data to Therapist interface format
          const therapistsData = childrenWithTherapists.map((child: Child) => ({
            id: `connected-${child.therapist!.name.replace(/\s+/g, '-').toLowerCase()}`,
            name: child.therapist!.name,
            title: "Licensed Therapist", // Default title
            specialties: ["Child Psychology", "Family Therapy"], // Default specialties
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
            connectedChild: child.firstName
          }));
          
          // Remove duplicates based on therapist name
          const uniqueTherapists = therapistsData.filter((therapist: Therapist, index: number, self: Therapist[]) =>
            index === self.findIndex((t: Therapist) => t.name === therapist.name)
          );
          
          setConnectedTherapists(uniqueTherapists);
        }
      } catch (error) {
        console.error("Error fetching connected therapists:", error);
      }
    };

    fetchConnectedTherapists();
  }, []);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockTherapists: Therapist[] = [
      {
        id: "1",
        name: "Dr. Ben Carter",
        title: "Clinical Psychologist",
        specialties: ["Anxiety & Depression", "Family Therapy", "ADHD & Behavioral Issues"],
        rating: 4.9,
        reviewCount: 137,
        experience: "12+ years experience",
        sessionTypes: { inPerson: false, online: true },
        availability: { 
          nextSlot: "Available Today", 
          timeSlot: "Next: Today 2:00 PM",
          timeCategory: "today"
        },
        cost: { isFree: false, priceRange: "Rs. 800-1200/session" },
        languages: ["English", "Spanish"],
        tags: ["English", "Spanish"]
      },
      {
        id: "2",
        name: "Sarah Miller, LCSW",
        title: "Licensed Clinical Social Worker",
        specialties: ["Family Therapy", "Trauma & PTSD", "Child Psychology"],
        rating: 4.8,
        reviewCount: 89,
        experience: "8+ years experience",
        sessionTypes: { inPerson: false, online: true },
        availability: { 
          nextSlot: "Available Tomorrow", 
          timeSlot: "Next: Tomorrow 10:30 AM",
          timeCategory: "tomorrow"
        },
        cost: { isFree: true, priceRange: "Free consultation" },
        languages: ["English", "Mandarin"],
        tags: ["English", "Mandarin"]
      },
      {
        id: "3",
        name: "Dr. David Lee",
        title: "Psychiatrist",
        specialties: ["ADHD & Behavioral Issues", "Medication Management", "Autism Spectrum"],
        rating: 4.7,
        reviewCount: 156,
        experience: "15+ years experience",
        sessionTypes: { inPerson: false, online: true },
        availability: { 
          nextSlot: "Available This Week", 
          timeSlot: "Next: Friday 3:30 PM",
          timeCategory: "thisWeek"
        },
        cost: { isFree: false, priceRange: "Rs. 1000-1500/session" },
        languages: ["English"],
        tags: ["English", "Mandarin"]
      },
      {
        id: "4",
        name: "Maria Gonzalez, MFT",
        title: "Marriage & Family Therapist",
        specialties: ["Family Therapy", "Couples Counseling", "Teen Therapy"],
        rating: 4.9,
        reviewCount: 203,
        experience: "10+ years experience",
        sessionTypes: { inPerson: false, online: true },
        availability: { 
          nextSlot: "Available Next Week", 
          timeSlot: "Next: Monday 11:00 AM",
          timeCategory: "nextWeek"
        },
        cost: { isFree: true, priceRange: "Community funded" },
        languages: ["English", "Spanish"],
        tags: ["English", "Spanish"]
      }
    ];

    setTimeout(() => {
      setTherapists(mockTherapists);
      setFilteredTherapists(mockTherapists);
      setLoading(false);
    }, 500);
  }, []);

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
    return <LoadingSpinner message="Loading therapists..." />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
      <div className="max-w-6xl mx-auto px-6 py-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {connectedTherapists.length > 0 ? 'Your Therapists & Explore More' : 'Find a Therapist'}
          </h1>
          <p className="text-gray-600 mt-1">
            {connectedTherapists.length > 0 
              ? 'Manage your connected therapists and find additional support' 
              : 'Find the right mental health professional for your family'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTherapists.length} therapists available
          </p>
        </div>

        {/* No Connected Therapists Message */}
        {connectedTherapists.length === 0 && (
          <div className="mb-8 bg-white/40 backdrop-blur-sm border border-red-100/50 rounded-lg p-6" style={{ backgroundColor: 'rgba(254, 226, 226, 0.3)' }}>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start Your Child&apos;s Mental Health Journey
                </h3>
                <p className="text-gray-700 mb-4">
                  You haven&apos;t connected with any therapists yet. Browse our qualified professionals below to find the perfect match for your child&apos;s needs. All our therapists are licensed and experienced in working with children and families.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Licensed Professionals
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Child Psychology Experts
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Online & In-Person Sessions
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connected Therapists Section */}
        {connectedTherapists.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EDE6F3' }}>
                <svg className="w-4 h-4" style={{ color: '#8159A8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Connected Therapists</h2>
                <p className="text-sm text-gray-600">Therapists currently working with your children</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {connectedTherapists.map((therapist) => (
                <div key={therapist.id} className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EDE6F3' }}>
                      <span className="font-semibold text-sm" style={{ color: '#8159A8' }}>
                        {therapist.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                      <p className="text-sm text-gray-600">{therapist.title}</p>
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        Working with: {therapist.connectedChild}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Connected
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Online Sessions
                        </span>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1 text-sm border border-purple-300 text-purple-700 rounded hover:bg-purple-50"
                      onClick={() => alert(`Contact ${therapist.name} for ${therapist.connectedChild}`)}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Looking for Additional Support?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Explore more therapists below to find additional specialists for your family&apos;s needs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <TherapistSearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
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
  );
}