import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Video,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Coins
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
  onBookSession: (therapistId: string) => void;
  onViewProfile: () => void;
}

export function TherapistCard({ therapist, bookingStatus, onBookSession, onViewProfile }: TherapistCardProps) {
  const getAvailabilityBadgeColor = (availability: string) => {
    if (availability.includes("Today")) return "bg-green-100 text-green-800";
    if (availability.includes("Tomorrow")) return "bg-blue-100 text-blue-800";
    if (availability.includes("This Week")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  console.log("Therapist Card Rendered:", therapist.name, bookingStatus);

  return (
    <Card className="bg-card border border-border rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.025] cursor-pointer h-full">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-[#e0d7ed] border border-[#e0d7ed] shadow-sm overflow-hidden"
          >
            {therapist.image && typeof therapist.image === 'string' && therapist.image.trim() !== '' ? (
              <Image
                src={therapist.image}
                alt={therapist.name}
                width={56}
                height={56}
                className="object-cover w-14 h-14 rounded-full"
                priority
              />
            ) : (
              <span className="font-bold text-xl text-primary">
                {therapist.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">{therapist.name}</h3>
            <p className="text-xs text-muted-foreground">{therapist.title}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm text-foreground">{therapist.rating}</span>
            <span className="text-xs text-muted-foreground">({therapist.reviewCount})</span>
          </div>
        </div>

        {/* Content wrapper that takes remaining space */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Content section */}
          <div>
            {/* Session Type & Experience */}
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Video className="w-3 h-3" />
              <span>Online Session</span>
              <span className="mx-2">|</span>
              <Users className="w-3 h-3" />
              <span>{therapist.experience}</span>
            </div>

            {/* Specialties Display */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Specializes in</p>
              <div className="flex flex-wrap gap-1">
                {therapist.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20 font-medium"
                  >
                    {specialty}
                  </Badge>
                ))}
                {therapist.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1 font-medium">
                    +{therapist.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Cost */}
            <div className="mb-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Coins className="w-3 h-3" />
                <span className={therapist.cost.isFree ? "text-green-600 font-semibold" : "text-foreground font-medium"}>
                  {therapist.cost.priceRange}
                </span>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <Badge 
                  variant="secondary" 
                  className={`text-xs font-medium ${getAvailabilityBadgeColor(therapist.availability.nextSlot)}`}
                >
                  {therapist.availability.nextSlot}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons - Always at bottom */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button 
              onClick={() => onBookSession(therapist.id)}
              disabled={bookingStatus === 'booking'}
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold relative rounded-lg shadow-sm"
            >
              {bookingStatus === 'booking' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                </div>
              )}
              {bookingStatus === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
              {bookingStatus === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
              )}
              <span className={bookingStatus && bookingStatus !== 'idle' ? 'invisible' : 'flex items-center'}>
                <Users className="w-3 h-3 mr-1" />
                Connect
              </span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg"
              onClick={onViewProfile}
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}