"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";

export default function DonationSuccessPage() {
  useEffect(() => {
    // Trigger confetti animation on page load
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#8B5CF6", "#EC4899"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#8B5CF6", "#EC4899"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Image
                src="/images/sparkslogo.png"
                alt="SPARKS Logo"
                width={100}
                height={50}
                className="object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-12 pb-12 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            {/* Thank You Message */}
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Thank You for Your Donation!
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Your generous contribution is being processed. We're grateful for your
              support in helping children with ADHD receive the care they need.
            </p>

            {/* Information Box */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-lg mb-3 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-purple-600" />
                What happens next?
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>
                    You will receive a confirmation email once your payment is
                    verified (usually within a few minutes)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>
                    A receipt will be sent to your email for tax purposes
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>
                    Your donation will directly support our therapy programs and
                    services
                  </span>
                </li>
              </ul>
            </div>

            {/* Note */}
            <p className="text-sm text-gray-500 mb-8">
              Note: The actual donation status will be confirmed via PayHere's secure
              payment notification system. This page is for informational purposes
              only.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
              <Link href="/donate">
                <Button variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Make Another Donation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Impact Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Every donation, no matter the size, makes a real difference in the lives
            of children and families we serve.
          </p>
        </div>
      </main>
    </div>
  );
}
