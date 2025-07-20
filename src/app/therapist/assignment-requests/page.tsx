"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, UserPlus, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssignmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  dateOfBirth: string;
  gender: string;
  message: string;
  requestedAt: string;
}

export default function AssignmentRequestsPage() {
  const [requests, setRequests] = useState<AssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AssignmentRequest | null>(null);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/therapist/assignment-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data.requests);
    } catch (err) {
      setError('Failed to load assignment requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!selectedRequest || !action) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/therapist/assignment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: selectedRequest.id,
          patientId: selectedRequest.patientId,
          action,
          message: responseMessage,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      // Remove the processed request from the list
      setRequests(requests.filter(req => req.id !== selectedRequest.id));
      setSelectedRequest(null);
      setAction(null);
      setResponseMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assignment requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FB]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Assignment Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and respond to patient assignment requests
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No pending requests</p>
              <p className="text-sm text-muted-foreground mt-1">
                You don't have any assignment requests at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.patientName}</CardTitle>
                      <CardDescription className="mt-1">
                        {request.patientEmail} • {calculateAge(request.dateOfBirth)} years old • {request.gender}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {request.message && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">{request.message}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setAction('accept');
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAction('reject');
                        }}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Response Dialog */}
        <Dialog 
          open={!!selectedRequest && !!action} 
          onOpenChange={() => {
            setSelectedRequest(null);
            setAction(null);
            setResponseMessage('');
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === 'accept' ? 'Accept' : 'Decline'} Request from {selectedRequest?.patientName}
              </DialogTitle>
              <DialogDescription>
                {action === 'accept' 
                  ? 'You are about to accept this patient. You can include a welcome message.'
                  : 'Please provide a reason for declining this request (optional).'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder={action === 'accept' 
                  ? "Welcome! I look forward to working with you..."
                  : "I'm unable to accept new patients at this time..."}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setAction(null);
                  setResponseMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResponse}
                disabled={submitting}
                className={action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {action === 'accept' ? 'Accept' : 'Decline'} Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}