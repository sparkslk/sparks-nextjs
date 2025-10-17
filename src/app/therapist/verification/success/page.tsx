"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, RefreshCw } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Image
              src="/images/sparkslogo.png"
              alt="SPARKS"
              width={120}
              height={40}
              className="mx-auto mb-4"
            />
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-primary mb-2">
                    Verification Submitted Successfully!
                  </h1>
                  <p className="text-muted-foreground">
                    Thank you for submitting your verification information. Your application is now under review.
                  </p>
                  
                  {!isLoading && verificationStatus && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Current Status:</p>
                          <p className={`text-sm font-semibold ${
                            verificationStatus.status === 'PENDING' ? 'text-yellow-600' :
                            verificationStatus.status === 'UNDER_REVIEW' ? 'text-blue-600' :
                            verificationStatus.status === 'APPROVED' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {verificationStatus.status.replace('_', ' ')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="text-gray-500"
                        >
                          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    What happens next?
                  </h3>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Document Review</p>
                        <p className="text-blue-700 text-sm">
                          Our team will review your submitted documents and credentials within 3-5 business days.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Reference Verification</p>
                        <p className="text-blue-700 text-sm">
                          We&apos;ll contact your professional reference to verify your credentials and experience.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Background Check</p>
                        <p className="text-blue-700 text-sm">
                          A comprehensive background check and license verification will be conducted.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Approval & Activation</p>
                        <p className="text-green-700 text-sm">
                          Once approved, your therapist account will be activated and you can start accepting patients.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">Important Notes</span>
                  </div>
                  <ul className="text-left text-yellow-700 text-sm space-y-1">
                    <li>• You will receive email updates throughout the verification process</li>
                    <li>• Please ensure your contact information is up to date</li>
                    <li>• If additional information is needed, we&apos;ll contact you directly</li>
                    <li>• You can check your verification status in your therapist dashboard</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={handleRefresh}
                      variant="outline"
                      disabled={isRefreshing}
                      className="w-full"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Checking...' : 'Check Status'}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll automatically check your verification status every 30 seconds. 
                    Once approved, you&apos;ll be redirected to the approval page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
