import { Button } from "@/components/ui/button";
import { Card  } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import {
  Star
} from "lucide-react";
import Image from "next/image";

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
}

interface TherapistCardProps {
  therapist: Therapist;
  bookingStatus: 'idle' | 'booking' | 'success' | 'error';
  onViewProfile: () => void;
  viewDetailsText: string;
}

export function TherapistCard({ therapist, bookingStatus, onViewProfile, viewDetailsText }: TherapistCardProps) {

  console.log("Therapist Card Rendered:", therapist.name, bookingStatus);

  return (
    <Card className="bg-[#f7f4fb] border border-[#cfc3f7] rounded-2xl shadow-none hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col items-center px-6 pt-6 pb-4">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white border border-[#e0d7ed] shadow-sm mb-4 overflow-hidden">
        {therapist.image && typeof therapist.image === 'string' && therapist.image.trim() !== '' ? (
          <Image
            src={therapist.image}
            alt={therapist.name}
            width={96}
            height={96}
            className="object-cover w-24 h-24 rounded-full"
            priority
          />
        ) : (
          <span className="font-bold text-3xl text-primary">
            {therapist.name.split(' ').map(n => n[0]).join('')}
          </span>
        )}
      </div>
      {/* Name, Title, Rating */}
      <div className="text-center w-full mb-3">
        <h3 className="font-bold text-xl text-foreground mb-0.5">{therapist.name}</h3>
        <p className="text-sm text-muted-foreground mb-2 truncate">{therapist.title}</p>
        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-lg text-[#f7b500]">{therapist.rating}</span>
          <span className="text-base text-muted-foreground">({therapist.reviewCount}+) </span>
        </div>
      </div>
      {/* View Details Button */}
      <Button 
        variant="outline" 
        size="lg"
        className="w-full text-base border-2 border-[#a084e8] text-[#a084e8] hover:bg-[#ede7fa] font-semibold rounded-xl mt-auto py-2"
        onClick={onViewProfile}
      >
        {viewDetailsText}
      </Button>
    </Card>
  );
}