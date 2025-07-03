"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  therapist: {
    name: string;
    email: string;
    phone?: string;
    specialization: string;
  } | null;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'past';
  childId: string;
}

export default function AppointmentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch children data
      const childrenResponse = await fetch("/api/parent/children");
      if (!childrenResponse.ok) {
        throw new Error("Failed to fetch children data");
      }
      const childrenData = await childrenResponse.json();
      setChildren(childrenData.children || []);

      // Mock appointments data - replace with actual API call
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          date: "2024-07-01",
          time: "10:00 AM",
          type: "Regular Session",
          status: "upcoming",
          childId: childrenData.children?.[0]?.id || "1"
        },
        {
          id: "2",
          date: "2024-07-15",
          time: "11:00 AM",
          type: "Progress Review",
          status: "upcoming",
          childId: childrenData.children?.[0]?.id || "1"
        },
        {
          id: "3",
          date: "2024-06-10",
          time: "10:30 AM",
          type: "Initial Consultation",
          status: "past",
          childId: childrenData.children?.[0]?.id || "1"
        },
        {
          id: "4",
          date: "2024-07-05",
          time: "02:00 PM",
          type: "Family Therapy",
          status: "upcoming",
          childId: childrenData.children?.[1]?.id || "2"
        },
        {
          id: "5",
          date: "2024-06-18",
          time: "01:30 PM",
          type: "Family Session",
          status: "past",
          childId: childrenData.children?.[1]?.id || "2"
        }
      ];
      setAppointments(mockAppointments);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load appointments data");
    } finally {
      setLoading(false);
    }
  };

  const getChildAppointments = (childId: string, status: 'upcoming' | 'past') => {
    return appointments.filter(apt => apt.childId === childId && apt.status === status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load appointments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Appointments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your children&apos;s therapy appointments
            </p>
          </div>
          <Button 
            style={{ backgroundColor: '#8159A8' }}
            className="text-white hover:opacity-90"
          >
            Explore Therapists
          </Button>
        </div>

        {/* Children Cards */}
        <div className="space-y-6">
          {children.map((child) => {
            const upcomingAppointments = getChildAppointments(child.id, 'upcoming');
            const pastAppointments = getChildAppointments(child.id, 'past');

            return (
              <Card key={child.id} className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#EDE6F3' }}
                      >
                        <span className="font-semibold text-lg" style={{ color: '#8159A8' }}>
                          {child.firstName[0]}{child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {child.firstName} {child.lastName}
                        </CardTitle>
                        {child.therapist && (
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Current Therapist:</span> {child.therapist.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Specialization:</span> {child.therapist.specialization}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {child.therapist && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ backgroundColor: '#8159A8', color: 'white' }}
                            className="hover:opacity-90"
                          >
                            Book Session
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            View Details
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {child.therapist ? (
                    <div className="space-y-6">
                      {/* Upcoming Sessions */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Upcoming Sessions</h3>
                        {upcomingAppointments.length > 0 ? (
                          <div className="space-y-3">
                            {upcomingAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-900">
                                      {formatDate(appointment.date)} - {appointment.type}
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {appointment.time}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  >
                                    Reschedule
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No upcoming sessions scheduled</p>
                        )}
                      </div>

                      {/* Past Sessions */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Past Sessions</h3>
                        {pastAppointments.length > 0 ? (
                          <div className="space-y-3">
                            {pastAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-900">
                                      {formatDate(appointment.date)} - {appointment.type}
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {appointment.time}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  >
                                    View Review
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No past sessions</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Therapist Assigned
                      </h3>
                      <p className="text-gray-600 mb-4">
                        To schedule appointments, you need to connect with a therapist first.
                      </p>
                      <Button
                        style={{ backgroundColor: '#8159A8' }}
                        className="text-white hover:opacity-90"
                        onClick={() => window.location.href = '/parent/findTherapist'}
                      >
                        Find a Therapist
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {children.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Children Found
            </h3>
            <p className="text-gray-600 mb-4">
              Add children to your account to manage their appointments.
            </p>
            <Button
              style={{ backgroundColor: '#8159A8' }}
              className="text-white hover:opacity-90"
              onClick={() => window.location.href = '/parent/children'}
            >
              Add Child
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}