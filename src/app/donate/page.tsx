"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DonatePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");

  // Predefined amounts
  const predefinedAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalAmount = getFinalAmount();

    // Validation
    if (!finalAmount || finalAmount <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    if (!isAnonymous && !donorName && !donorEmail) {
      setError("Please provide your name or email for non-anonymous donations");
      return;
    }

    setLoading(true);

    try {
      // Call initiate API
      const response = await fetch("/api/donation/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalAmount,
          donorName: isAnonymous ? null : donorName,
          donorEmail: isAnonymous ? null : donorEmail,
          donorPhone: isAnonymous ? null : donorPhone,
          isAnonymous,
          message,
          userId: session?.user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate donation");
      }

      console.log("Donation initiated successfully:", data);

      // Create form and submit to PayHere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payhereUrl;

      // Add all payment details as hidden fields
      Object.entries(data.paymentDetails).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Error initiating donation:", err);
      setError(err instanceof Error ? err.message : "Failed to process donation");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
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
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}>
            <Heart className="w-8 h-8" style={{ color: "#8159A8" }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SPARKS
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Your generous donation helps us provide quality ADHD therapy and support
            services to children and families in need. Every contribution makes a
            difference.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
        </div>

        {/* Donation Form */}
        <Card className="border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
          <CardHeader className="text-white" style={{ background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)` }}>
            <CardTitle className="text-2xl">Make a Donation</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Select Amount (LKR)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "default" : "outline"}
                      className={`h-16 text-lg font-semibold transition-all duration-300 ${
                        selectedAmount === amount
                          ? ""
                          : "border-2 hover:shadow-md"
                      }`}
                      style={selectedAmount === amount ? {
                        background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                        color: "white"
                      } : {
                        borderColor: "#8159A8",
                        color: "#8159A8"
                      }}
                      onClick={() => handleAmountClick(amount)}
                    >
                      LKR {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="customAmount" className="text-sm mb-2 block">
                    Or enter custom amount
                  </Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <Label htmlFor="anonymous" className="text-base cursor-pointer">
                  Make this donation anonymous
                </Label>
              </div>

              {/* Donor Information (hidden if anonymous) */}
              {!isAnonymous && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Donor Information</h3>
                  <div>
                    <Label htmlFor="donorName">Name</Label>
                    <Input
                      id="donorName"
                      type="text"
                      placeholder="Your full name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donorEmail">Email</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donorPhone">Phone (Optional)</Label>
                    <Input
                      id="donorPhone"
                      type="tel"
                      placeholder="+94 71 234 5678"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Leave a message of support..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                  color: "white"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Donate LKR {getFinalAmount().toLocaleString()}
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <p className="text-xs text-center text-gray-500">
                Your payment is processed securely through PayHere. We do not store
                your card details.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Impact Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center bg-white border-gray-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-2" style={{ color: "#8159A8" }}>1,000+</div>
              <p className="text-gray-600">Children Helped</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-white border-gray-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-2" style={{ color: "#8159A8" }}>500+</div>
              <p className="text-gray-600">Therapy Sessions</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-white border-gray-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-2" style={{ color: "#8159A8" }}>100%</div>
              <p className="text-gray-600">Goes to Support</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
