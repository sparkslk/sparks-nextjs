"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function VerificationSuccessPage() {
  const router = useRouter();

  // Simulate verification process (3-5 business days)
  // In real app, this would be handled by backend notifications
  useEffect(() => {
    // Auto-redirect to approval page after 5 seconds for demo
    // Remove this in production
    const timer = setTimeout(() => {
      router.push("/therapist/verification/approved");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <Image
                src="/images/sparkslogo.png"
                alt="SPARKS"
                width={120}
                height={40}
                className="mx-auto mb-6"
              />

              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-primary mb-4">
                Application Submitted Successfully!
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Thank you for your application. We&apos;ve received your registration
                and supporting documents. Our verification team will review your
                credentials within 3-5 business days.
              </p>

              <p className="text-muted-foreground">
                You&apos;ll receive an email confirmation shortly, followed by
                updates on your application status.
              </p>

              <div className="pt-4">
                <Button
                  onClick={() => router.push("/therapist/login")}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  Return to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
