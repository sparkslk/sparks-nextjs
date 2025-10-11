"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, DollarSign, Users, Shield } from "lucide-react";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonatePage() {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleDonate = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      alert("Please provide your name and email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/donations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          frequency,
          donorName,
          donorEmail,
          donorPhone,
          isAnonymous,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create donation");
      }

      // Initialize PayHere
      interface PayHereInterface {
        onCompleted: ((orderId: string) => void) | null;
        onDismissed: (() => void) | null;
        onError: ((error: string) => void) | null;
        startPayment: (paymentData: unknown) => void;
      }

      interface PayHereWindow extends Window {
        payhere?: PayHereInterface;
      }

      if (typeof window !== "undefined" && (window as PayHereWindow).payhere) {
        const payhere = (window as PayHereWindow).payhere;

        if (payhere) {
          payhere.onCompleted = function (orderId: string) {
            console.log("Payment completed. OrderID:" + orderId);
            window.location.href = "/donate/success?orderId=" + orderId;
          };

          payhere.onDismissed = function () {
            console.log("Payment dismissed");
            setIsLoading(false);
          };

          payhere.onError = function (error: string) {
            console.log("Error:" + error);
            alert("Payment error: " + error);
            setIsLoading(false);
          };

          payhere.startPayment(data.paymentData);
        }
      } else {
        alert("PayHere is not loaded. Please refresh the page and try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating donation:", error);
      alert("Failed to create donation. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-4">
            Support SPARKS
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your donation helps us provide quality ADHD therapy services and support to those in need.
            Every contribution makes a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Impact Cards */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-bold mb-2">Help Families</h3>
              <p className="text-gray-600">Support families access affordable ADHD therapy</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Train Therapists</h3>
              <p className="text-gray-600">Fund training programs for ADHD specialists</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Build Resources</h3>
              <p className="text-gray-600">Develop educational materials and tools</p>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form */}
        <Card className="border-0 shadow-2xl max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Make a Donation</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Frequency Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Donation Frequency
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFrequency("ONE_TIME")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    frequency === "ONE_TIME"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">One-Time</div>
                  <div className="text-sm text-gray-500">Single donation</div>
                </button>
                <button
                  onClick={() => setFrequency("MONTHLY")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    frequency === "MONTHLY"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Monthly</div>
                  <div className="text-sm text-gray-500">Recurring support</div>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Amount (LKR)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {PRESET_AMOUNTS.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    onClick={() => handleAmountSelect(presetAmount)}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                      amount === presetAmount && !customAmount
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {presetAmount.toLocaleString()}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full"
                min="1"
              />
            </div>

            {/* Anonymous Donation Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this donation anonymous
                </span>
              </label>
            </div>

            {/* Donor Information */}
            {!isAnonymous && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="0771234567"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <Textarea
                placeholder="Leave a message of support..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Donate Button */}
            <Button
              onClick={handleDonate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Donate LKR {amount.toLocaleString()}
                </span>
              )}
            </Button>

            {/* Security Note */}
            <p className="text-xs text-center text-gray-500 mt-4">
              Secure payment powered by PayHere. Your donation is tax-deductible.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PayHere Script */}
      <script
        type="text/javascript"
        src="https://www.payhere.lk/lib/payhere.js"
        async
      ></script>
    </div>
  );
}
