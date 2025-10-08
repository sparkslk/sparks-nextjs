"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePassword } from "@/lib/password-validation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/lib/auth";

export default function TherapistSignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    specialization: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      setIsLoading(false);
      return;
    }


    try {
      console.log("Attempting therapist signup with data:", {
        email: formData.email,
        name: formData.name,
        role: UserRole.THERAPIST,
        specialization: formData.specialization,
      });

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: UserRole.THERAPIST,
          metadata: {
            specialization: formData.specialization,
          },
        }),
      });

      const data = await response.json();
      console.log("Signup response:", { status: response.status, data });

      if (!response.ok) {
        console.error("Signup failed:", data);
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in the user after successful signup
      console.log("Attempting to sign in after signup...");
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        console.error("Sign in failed:", result.error);
        throw new Error("Failed to sign in after registration");
      }

      // Redirect to verification page
      console.log("Redirecting to therapist verification...");
      router.push("/therapist/verification");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/sparkslogo.png"
              alt="SPARKS Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Therapist Registration
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create your therapist account to join SPARKS
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium">
                Specialization
              </Label>
              <Input
                id="specialization"
                name="specialization"
                type="text"
                placeholder="e.g., CBT, Family Therapy, etc."
                value={formData.specialization}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11"
              />
              {formData.password && (
                <PasswordStrengthIndicator password={formData.password} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Therapist Account"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Not a therapist?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Regular signup
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}