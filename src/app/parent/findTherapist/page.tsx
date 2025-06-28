"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Video,
  Users,
  Filter,
  Search,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Coins
} from "lucide-react";

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


  const getAvailabilityBadgeColor = (availability: string) => {
    if (availability.includes("Today")) return "bg-green-100 text-green-800";
    if (availability.includes("Tomorrow")) return "bg-blue-100 text-blue-800";
    if (availability.includes("This Week")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading therapists...</p>
        </div>
      </div>
    );
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
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] shadow-sm bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs bg-[#8159A8] text-white">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="w-full flex flex-wrap gap-3">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="anxiety">Anxiety & Depression</SelectItem>
                    <SelectItem value="family">Family Therapy</SelectItem>
                    <SelectItem value="adhd">ADHD & Behavioral Issues</SelectItem>
                    <SelectItem value="trauma">Trauma & PTSD</SelectItem>
                    <SelectItem value="child">Child Psychology</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTimeAvailability} onValueChange={setSelectedTimeAvailability}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="nextWeek">Next Week</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCost} onValueChange={setSelectedCost}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Cost" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Cost</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedSpecialty !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {selectedSpecialty}
                  <button onClick={() => setSelectedSpecialty("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedTimeAvailability !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {selectedTimeAvailability}
                  <button onClick={() => setSelectedTimeAvailability("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCost !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {selectedCost}
                  <button onClick={() => setSelectedCost("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Therapists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white cursor-pointer">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#EDE6F3' }}
                  >
                    <span className="font-semibold text-lg" style={{ color: '#8159A8' }}>
                      {therapist.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-600">{therapist.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{therapist.rating}</span>
                    <span className="text-xs text-gray-500">({therapist.reviewCount})</span>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-600">
                  <Video className="w-3 h-3" />
                  <span>Online Session</span>
                </div>
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  <span>{therapist.experience}</span>
                </div>

                {/* Specialties Display */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Specializes in:</p>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs px-2 py-1 bg-[#F5F3FB] text-[#8159A8] border-[#E0D7ED]"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {therapist.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        +{therapist.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Cost */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Coins className="w-3 h-3" />
                    <span className={therapist.cost.isFree ? "text-green-600 font-medium" : "text-gray-600"}>
                      {therapist.cost.priceRange}
                    </span>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getAvailabilityBadgeColor(therapist.availability.nextSlot)}`}
                    >
                      {therapist.availability.nextSlot}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleBookSession(therapist.id)}
                    disabled={bookingStatus[therapist.id] === 'booking'}
                    size="sm"
                    className="text-xs bg-[#8159A8] hover:bg-[#6D4C93] text-white relative"
                  >
                    {bookingStatus[therapist.id] === 'booking' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      </div>
                    )}
                    {bookingStatus[therapist.id] === 'success' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {bookingStatus[therapist.id] === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className={bookingStatus[therapist.id] && bookingStatus[therapist.id] !== 'idle' ? 'invisible' : 'flex items-center'}>
                      <Calendar className="w-3 h-3 mr-1" />
                      Book Session
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs border-[#8159A8] text-[#8159A8] hover:bg-[#F5F3FB]"
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}