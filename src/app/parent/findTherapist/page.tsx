"use client";

import { useState, useEffect } from "react";
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
            Explore Therapists
          </h1>
          <p className="text-gray-600 mt-1">
            Find the right mental health professional for you
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTherapists.length} therapists available
          </p>
        </div>

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