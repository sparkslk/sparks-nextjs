"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Star, Users, Calendar, Send, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Therapist {
  id: string;
  name: string;
  email: string;
  image: string | null;
  specialization: string[];
  experience: number | null;
  bio: string | null;
  rating: string | null;
  patientCount: number;
  sessionCount: number;
}

export default function FindTherapistPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignedTherapist, setAssignedTherapist] = useState<Therapist | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    fetchTherapists();
    checkAssignedTherapist();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await fetch('/api/patient/request-therapist');
      if (!response.ok) {
        throw new Error('Failed to fetch therapists');
      }
      const data = await response.json();
      setTherapists(data.therapists);
    } catch (err) {
      setError('Failed to load therapists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAssignedTherapist = async () => {
    try {
      const response = await fetch('/api/patient/assigned-therapist');
      if (response.ok) {
        const data = await response.json();
        setAssignedTherapist(data.therapist);
      }
    } catch (err) {
      console.error('Error checking assigned therapist:', err);
    }
  };

  const handleRequestTherapist = async () => {
    if (!selectedTherapist) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/patient/request-therapist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: selectedTherapist.id,
          message: requestMessage,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      setShowSuccessDialog(true);
      setSelectedTherapist(null);
      setRequestMessage('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading therapists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FB]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Find Your Therapist
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse available therapists and request one that best suits your needs
          </p>
        </div>

        {assignedTherapist && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently assigned to <strong>{assignedTherapist.name}</strong>. 
              You can only book sessions with your assigned therapist.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {therapist.image ? (
                      <picture>
                        <img
                          src={therapist.image}
                          alt={therapist.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </picture>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {therapist.name?.charAt(0) || 'T'}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{therapist.name || 'Unknown'}</CardTitle>
                      {therapist.rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{therapist.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {therapist.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialization.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {therapist.experience && (
                    <p className="text-sm text-muted-foreground">
                      {therapist.experience} years experience
                    </p>
                  )}

                  {therapist.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {therapist.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {therapist.patientCount} patients
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {therapist.sessionCount} sessions
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setSelectedTherapist(therapist)}
                    disabled={!!assignedTherapist}
                  >
                    Request This Therapist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Request Dialog */}
        <Dialog open={!!selectedTherapist} onOpenChange={() => setSelectedTherapist(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request {selectedTherapist?.name}</DialogTitle>
              <DialogDescription>
                Send a message to introduce yourself and explain why you&apos;d like to work with this therapist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Hello, I would like to work with you because..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTherapist(null);
                  setRequestMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestTherapist}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Request Sent Successfully
              </DialogTitle>
              <DialogDescription>
                Your request has been sent to the therapist. You will be notified once they respond.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowSuccessDialog(false)}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}