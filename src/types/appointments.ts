export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  therapist: {
    userId: string;
    name?: string;
    licenseNumber: string;
    specialization: string;
    experience: number;
    bio?: string;
    availability?: Record<string, unknown> | null;
    organizationId?: string;
    rating: number;
  } | null;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'past';
  childId: string;
  duration: number;
  sessionStatus: string;
  notes?: string;
  therapist: string;
  therapistEmail: string;
  therapistPhone: string;
  specializations: string[];
  mode: string;
  sessionType: string;
  objectives: string[];
}