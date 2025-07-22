"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Calendar, MessageSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Therapist {
  id: string;
  name: string;
  email: string;
  image: string | null;
  specialization: string[];
  experience: number | null;
  bio: string | null;
}

export function AssignedTherapistCard() {
  const router = useRouter();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTherapist();
  }, []);

  const fetchAssignedTherapist = async () => {
    try {
      const response = await fetch('/api/patient/assigned-therapist');
      if (response.ok) {
        const data = await response.json();
        setTherapist(data.therapist);
      }
    } catch (error) {
      console.error('Error fetching assigned therapist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!therapist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            Your Therapist
          </CardTitle>
          <CardDescription>
            You don&apos;t have an assigned therapist yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To get started with therapy sessions, you need to have an assigned therapist.
          </p>
          <Button 
            onClick={() => router.push('/patient/find-therapist')}
            className="w-full"
          >
            Find a Therapist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCheck className="mr-2 h-5 w-5" />
          Your Therapist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            {therapist.image ? (
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">
                  {therapist.name?.charAt(0) || 'T'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{therapist.name}</h3>
              <p className="text-sm text-muted-foreground">{therapist.email}</p>
              {therapist.experience && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {therapist.experience} years experience
                </p>
              )}
            </div>
          </div>

          {therapist.specialization.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {therapist.specialization.map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}

          {therapist.bio && (
            <p className="text-sm text-muted-foreground">
              {therapist.bio}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => router.push('/sessions/request')}
              className="w-full"
              size="sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Session
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="w-full"
              disabled
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}