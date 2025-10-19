"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Calendar, Users, ArrowRight, Sparkles } from "lucide-react";

export default function VerificationApprovedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    // Check profile completion status first
    const checkProfileCompletion = async () => {
      try {
        const response = await fetch('/api/therapist/profile');
        if (response.ok) {
          const data = await response.json();
          const completionPercentage = data.profileData?.profileCompletion || 0;
          
          // If profile is incomplete, redirect to profile completion
          if (completionPercentage < 80) {
            router.push('/therapist/profile?complete=true');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [router]);

  useEffect(() => {
    if (isCheckingProfile) return; // Don't start countdown until profile check is done

    // Auto-redirect to dashboard after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Mark approval as seen before redirecting
          fetch('/api/therapist/verification/mark-approval-seen', {
            method: 'POST'
          }).catch(error => {
            console.error('Error marking approval as seen:', error);
          }).finally(() => {
            router.push("/therapist/dashboard");
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, isCheckingProfile]);

  const handleContinue = async () => {
    try {
      // Check profile completion first
      const response = await fetch('/api/therapist/profile');
      if (response.ok) {
        const data = await response.json();
        const completionPercentage = data.profileData?.profileCompletion || 0;
        
        // If profile is incomplete, redirect to profile completion
        if (completionPercentage < 80) {
          router.push('/therapist/profile?complete=true');
          return;
        }
      }

      // Mark approval as seen
      await fetch('/api/therapist/verification/mark-approval-seen', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error:', error);
    }
    
    router.push("/therapist/dashboard");
  };

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto"></div>
              <h3 className="mt-4 text-lg font-medium text-foreground">Checking your profile...</h3>
              <p className="mt-2 text-muted-foreground">Please wait while we verify your information.</p>
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
              <h1 className="text-3xl font-bold text-primary dark:text-primary">Verification Approved</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome to the SPARKS therapist community
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
          {/* Success Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950 border-l-4 border-l-green-500">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8159A8' }}>
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Congratulations!
                    </h2>
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Your Verification is Approved
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Welcome to the SPARKS therapist community! Your credentials have been verified 
                    and your account is now fully activated. You can start helping patients right away.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You Can Do Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                What You Can Do Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#8159A8', opacity: 0.1 }}>
                    <Users className="w-7 h-7" style={{ color: '#8159A8' }} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Accept Patients</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start receiving and accepting patient requests
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#8159A8', opacity: 0.1 }}>
                    <Calendar className="w-7 h-7" style={{ color: '#8159A8' }} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Set Schedule</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure your availability and session times
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#8159A8', opacity: 0.1 }}>
                    <Star className="w-7 h-7" style={{ color: '#8159A8' }} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Complete Profile</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add final details to start accepting patients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950 border-l-4" style={{ borderLeftColor: '#8159A8' }}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" style={{ color: '#8159A8' }} />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">Complete your profile with contact details and rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">Add your bank details for payment processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">Set your availability schedule to start receiving patients</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#8159A8' }}></div>
                  <span className="text-sm">Review your dashboard to familiarize yourself with the platform</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button 
              onClick={handleContinue}
              className="text-white hover:opacity-90 font-semibold min-w-[250px]"
              style={{ backgroundColor: '#8159A8' }}
              size="lg"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Automatically redirecting in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
