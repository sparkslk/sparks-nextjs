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

interface TherapistCardProps {
  therapist: Therapist;
  bookingStatus: 'idle' | 'booking' | 'success' | 'error';
  onBookSession: (therapistId: string) => void;
}

export function TherapistCard({ therapist, bookingStatus, onBookSession }: TherapistCardProps) {
  const getAvailabilityBadgeColor = (availability: string) => {
    if (availability.includes("Today")) return "bg-green-100 text-green-800";
    if (availability.includes("Tomorrow")) return "bg-blue-100 text-blue-800";
    if (availability.includes("This Week")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white cursor-pointer h-full">
      <CardContent className="p-6 h-full flex flex-col">
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

        {/* Content wrapper that takes remaining space */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Content section */}
          <div>
            {/* Session Type & Experience */}
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
          </div>

          {/* Action Buttons - Always at bottom */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button 
              onClick={() => onBookSession(therapist.id)}
              disabled={bookingStatus === 'booking'}
              size="sm"
              className="text-xs bg-[#8159A8] hover:bg-[#6D4C93] text-white relative"
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
        </div>
      </CardContent>
    </Card>
  );
}