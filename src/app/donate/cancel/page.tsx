"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DonationCancelPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
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
        <Card className="border-gray-100 shadow-xl bg-white">
          <CardContent className="pt-12 pb-12 text-center">
            {/* Cancel Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: "rgba(251, 146, 60, 0.1)" }}>
              <XCircle className="w-12 h-12" style={{ color: "#fb923c" }} />
            </div>

            {/* Cancel Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Donation Cancelled
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto leading-relaxed font-light">
              Your donation was not processed. Don&apos;t worry - no charges were made to
              your account.
            </p>

            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mb-8"></div>

            {/* Information Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-lg mb-3">What happened?</h2>
              <p className="text-gray-700 mb-4">
                The donation process was cancelled before completion. This could be
                because:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>You clicked the cancel or back button</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>The payment window was closed before completion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>You chose to return to the donation page</span>
                </li>
              </ul>
            </div>

            {/* Encouragement Message */}
            <div className="border border-gray-100 rounded-lg p-6 mb-8" style={{ backgroundColor: "rgba(129, 89, 168, 0.05)" }}>
              <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: "#8159A8" }} />
              <p className="text-gray-700">
                We&apos;d still love your support! Every donation helps us provide quality
                ADHD therapy services to children and families who need it most.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <Button 
                  className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                    color: "white"
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  variant="outline"
                  className="border-2 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    borderColor: "#8159A8",
                    color: "#8159A8"
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>

            {/* Support Contact */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Having trouble? Contact us at{" "}
                <a
                  href="mailto:support@sparks.lk"
                  className="hover:underline"
                  style={{ color: "#8159A8" }}
                >
                  support@sparks.lk
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
