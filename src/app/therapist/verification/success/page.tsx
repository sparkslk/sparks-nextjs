"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, User } from "lucide-react";

export default function VerificationSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      router.push("/therapist/dashboard");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

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
                          We'll contact your professional reference to verify your credentials and experience.
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
                    <li>• If additional information is needed, we'll contact you directly</li>
                    <li>• You can check your verification status in your therapist dashboard</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push("/therapist/dashboard")}
                    className="w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    You will be automatically redirected to your dashboard in a few seconds.
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
