"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";

export default function VerificationApprovedPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/therapist/profile/setup");
  };

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
                  <PartyPopper className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-green-600 mb-4">
                Congratulations!
              </h1>

              <h2 className="text-xl font-semibold text-primary mb-4">
                Your Application Has Been Approved
              </h2>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Welcome to the ADHD Management Platform! Your credentials have
                been verified and you&apos;re now ready to start helping patients on
                their ADHD journey.
              </p>

              <div className="pt-4">
                <Button
                  onClick={handleContinue}
                  className="w-full max-w-xs bg-primary hover:bg-primary/90"
                >
                  Complete Profile Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
