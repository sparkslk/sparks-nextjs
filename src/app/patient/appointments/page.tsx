"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Users, Plus } from "lucide-react";
import { PatientSessionBookingModal } from "@/components/patient/PatientSessionBookingModal";

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  bookedRate: number;
  sessionType: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  meetingLink: string | null;
  therapist: {
    id: string;
    name: string;
  };
}

export default function PatientAppointmentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [therapistName, setTherapistName] = useState<string>("Therapist");

  useEffect(() => {
    if (session?.user.role !== "NORMAL_USER") {
      router.push("/dashboard");
      return;
    }

    fetchSessions();
    fetchProfile();
  }, [session, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.profile?.therapist?.name) {
          setTherapistName(data.profile.therapist.name);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/patient/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        console.log(`Loaded ${data.sessions?.length || 0} sessions`);
      } else {
        console.error("Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingConfirm = () => {
    // Refresh sessions after booking
    fetchSessions();
  };

  const handleJoinSession = (meetingLink: string) => {
    window.open(meetingLink, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSessionTypeIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'ONLINE':
        return <Video className="h-4 w-4" />;
      case 'HYBRID':
        return <Users className="h-4 w-4" />;
      case 'IN_PERSON':
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getSessionTypeBadgeColor = (sessionType: string) => {
    switch (sessionType) {
      case 'ONLINE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'HYBRID':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'IN_PERSON':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Separate upcoming and past sessions
  const now = new Date();
  const upcomingSessions = sessions
    .filter(s => new Date(s.scheduledAt) >= now && s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastSessions = sessions
    .filter(s => new Date(s.scheduledAt) < now || s.status !== 'SCHEDULED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  if (loading) {
    return (
      <DashboardLayout title="My Appointments" subtitle="View and manage your therapy sessions">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Appointments" subtitle="View and manage your therapy sessions">
      {/* Header with Book Session Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Sessions</h2>
          <p className="text-muted-foreground">Manage your therapy appointments</p>
        </div>
        <Button onClick={() => setBookingModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Book Session
        </Button>
      </div>

      {/* Upcoming Sessions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No upcoming sessions</p>
              <Button variant="outline" onClick={() => setBookingModalOpen(true)}>
                Book a Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50 gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{session.type}</h4>
                      <Badge variant={getStatusBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                      <Badge variant="outline" className={getSessionTypeBadgeColor(session.sessionType)}>
                        <span className="flex items-center gap-1">
                          {getSessionTypeIcon(session.sessionType)}
                          {session.sessionType.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {' '}({session.duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Therapist:</span>
                        {session.therapist.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {session.meetingLink && (session.sessionType === 'ONLINE' || session.sessionType === 'HYBRID') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleJoinSession(session.meetingLink!)}
                      >
                        Join Session
                      </Button>
                    )}
                    <Badge variant="outline" className="self-start">
                      {session.bookedRate === 0 ? 'Free' : `LKR ${session.bookedRate}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Past Sessions
            </CardTitle>
            <CardDescription>Your session history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/30 gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-muted-foreground">{session.type}</h4>
                      <Badge variant={getStatusBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                      <Badge variant="outline" className={getSessionTypeBadgeColor(session.sessionType)}>
                        <span className="flex items-center gap-1">
                          {getSessionTypeIcon(session.sessionType)}
                          {session.sessionType.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div>Therapist: {session.therapist.name}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="self-start">
                    {session.bookedRate === 0 ? 'Free' : `LKR ${session.bookedRate}`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      <PatientSessionBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        therapistName={therapistName}
        onConfirmBooking={handleBookingConfirm}
      />
    </DashboardLayout>
  );
}
