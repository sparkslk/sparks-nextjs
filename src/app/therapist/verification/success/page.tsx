"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationStatus {
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export default function VerificationSuccessPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/therapist/verification');
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
        
        // If approved, redirect to approval page
        if (data.status === 'APPROVED') {
          router.push('/therapist/verification/approved');
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchVerificationStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(fetchVerificationStatus, 30000);
    
    return () => clearInterval(interval);
  }, [fetchVerificationStatus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchVerificationStatus();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto"></div>
              <h3 className="mt-4 text-lg font-medium text-foreground">Loading verification status...</h3>
              <p className="mt-2 text-muted-foreground">Please wait while we fetch your information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary dark:text-primary">Verification Status</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your verification progress and next steps
              </p>
            </div>
            <Image
              src="/images/sparkslogo.png"
              alt="SPARKS"
              width={100}
              height={33}
              className="hidden md:block"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Current Status</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Verification Submitted Successfully
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thank you for submitting your verification information
                    </p>
                  </div>
                </div>
              </div>

              {verificationStatus && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Status</p>
                      <Badge className={`${getStatusBadge(verificationStatus.status)} font-medium text-sm`}>
                        {verificationStatus.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Submitted: {new Date(verificationStatus.submittedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Steps Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#8159A8' }}>
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Document Review</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team will review your submitted documents and credentials within 3-5 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Reference Verification</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We&apos;ll contact your professional reference to verify your credentials and experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Background Check</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A comprehensive background check and license verification will be conducted.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Approval & Activation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Once approved, your therapist account will be activated and you can start accepting patients.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950 border-l-4" style={{ borderLeftColor: '#8159A8' }}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">Please ensure your contact information is up to date</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">If additional information is needed, we&apos;ll contact you directly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">You can check your verification status in your therapist dashboard</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="min-w-[200px]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking Status...' : 'Refresh Status'}
            </Button>
          </div>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 pb-4">
            Status automatically updates every 30 seconds. You&apos;ll be redirected once approved.
          </p>
        </div>
      </div>
    </div>
  );
}
