export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  therapist: {
    id?: string;
    userId: string;
    name?: string;
    email?: string;
    phone?: string;
    licenseNumber: string;
    specialization: string | string[];
    experience: number;
    bio?: string;
    availability?: Record<string, unknown> | null;
    organizationId?: string;
    rating?: number;
  } | null;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  childId: string;
  duration: number;
  sessionStatus: string;
  notes?: string;
  sessionNotes?: string;
  therapist: string;
  therapistEmail: string;
  therapistPhone: string;
  specializations: string[];
  mode: string;
  sessionType: string;
  objectives: string[];
  childFirstName?: string;
  childLastName?: string;
  meetingLink?: string | null;
  primaryFocusAreas?: string[];
}