"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DonationCancelPage() {
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
            {/* Cancel Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-white" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
              Donation Cancelled
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Your donation was not processed. Don&apos;t worry - no charges were made to
              your account.
            </p>

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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
              <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-gray-700">
                We&apos;d still love your support! Every donation helps us provide quality
                ADHD therapy services to children and families who need it most.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Heart className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
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
                  className="text-purple-600 hover:underline"
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
