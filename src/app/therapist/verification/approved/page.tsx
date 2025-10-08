"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Star, Calendar, Users, ArrowRight } from "lucide-react";

export default function VerificationApprovedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
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
  }, [router]);

  const handleContinue = async () => {
    try {
      // Mark approval as seen
      await fetch('/api/therapist/verification/mark-approval-seen', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking approval as seen:', error);
    }
    
    router.push("/therapist/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-green-700 mb-3">
                    🎉 Congratulations!
                  </h1>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Your Verification is Approved!
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to the SPARKS therapist community! Your credentials have been verified 
                    and your account is now fully activated. You can start helping patients right away.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-semibold text-green-800 mb-4">
                    What you can do now:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Accept Patients</h4>
                      <p className="text-sm text-gray-600">
                        Start receiving and accepting patient requests
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Set Schedule</h4>
                      <p className="text-sm text-gray-600">
                        Configure your availability and session times
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Build Profile</h4>
                      <p className="text-sm text-gray-600">
                        Complete your profile to attract more patients
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Getting Started Tips</h4>
                  <ul className="text-left text-blue-700 text-sm space-y-1">
                    <li>• Complete your therapist profile with a professional bio</li>
                    <li>• Set your availability schedule to start receiving patients</li>
                    <li>• Review your dashboard to familiarize yourself with the platform</li>
                    <li>• Check your notification settings to stay updated</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3"
                    size="lg"
                  >
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Automatically redirecting in {countdown} seconds...
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
