"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, DollarSign, CreditCard } from "lucide-react";

interface ProfileData {
  profilePicture: File | null;
  profilePictureUrl: string;
  bio: string;
  hourlyRate: string;
  bankAccountNumber: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [profileData, setProfileData] = useState<ProfileData>({
    profilePicture: null,
    profilePictureUrl: "",
    bio: "",
    hourlyRate: "",
    bankAccountNumber: "",
    accountHolderName: "",
    bankName: "",
    branchName: "",
  });

  // Validation functions
  const validateBio = (bio: string): string => {
    if (!bio.trim()) {
      return "Bio is required";
    }
    if (bio.trim().length < 50) {
      return "Bio must be at least 50 characters long";
    }
    if (bio.trim().length > 500) {
      return "Bio must not exceed 500 characters";
    }
    return "";
  };

  const validateHourlyRate = (rate: string): string => {
    if (!rate.trim()) {
      return "Hourly rate is required";
    }
    const numRate = parseFloat(rate);
    if (isNaN(numRate)) {
      return "Please enter a valid number";
    }
    if (numRate < 0) {
      return "Hourly rate cannot be negative";
    }
    if (numRate > 10000) {
      return "Hourly rate cannot exceed Rs. 10,000";
    }
    return "";
  };

  const validateBankAccount = (account: string): string => {
    if (!account.trim()) {
      return "Bank account number is required";
    }
    if (account.trim().length < 8) {
      return "Bank account number must be at least 8 characters long";
    }
    return "";
  };

  const validateName = (name: string): string => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return "This field is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (!nameRegex.test(name.trim())) {
      return "Name should only contain letters and spaces";
    }
    return "";
  };

  const validateBankName = (bank: string): string => {
    if (!bank.trim()) {
      return "Bank name is required";
    }
    if (bank.trim().length < 2) {
      return "Bank name must be at least 2 characters long";
    }
    return "";
  };

  const validateBranchName = (branch: string): string => {
    if (!branch.trim()) {
      return "Branch name is required";
    }
    if (branch.trim().length < 2) {
      return "Branch name must be at least 2 characters long";
    }
    return "";
  };

  const validateProfilePicture = (file: File): string => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a JPG or PNG image";
    }
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }
    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateProfilePicture(file);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, profilePicture: error }));
      return;
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.profilePicture;
      return newErrors;
    });

    const url = URL.createObjectURL(file);
    setProfileData((prev) => ({
      ...prev,
      profilePicture: file,
      profilePictureUrl: url,
    }));
  };

  const handleRateChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    setProfileData((prev) => ({ ...prev, hourlyRate: numericValue }));
    clearValidationError("hourlyRate");
  };

  const clearValidationError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate profile picture
    if (!profileData.profilePicture) {
      errors.profilePicture = "Profile picture is required";
    }

    // Validate bio
    const bioError = validateBio(profileData.bio);
    if (bioError) errors.bio = bioError;

    // Validate hourly rate
    const rateError = validateHourlyRate(profileData.hourlyRate);
    if (rateError) errors.hourlyRate = rateError;

    // Validate bank details
    const accountError = validateBankAccount(profileData.bankAccountNumber);
    if (accountError) errors.bankAccountNumber = accountError;

    const nameError = validateName(profileData.accountHolderName);
    if (nameError) errors.accountHolderName = nameError;

    const bankError = validateBankName(profileData.bankName);
    if (bankError) errors.bankName = bankError;

    const branchError = validateBranchName(profileData.branchName);
    if (branchError) errors.branchName = branchError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to save profile data
      console.log("Saving profile data:", profileData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to dashboard
      router.push("/therapist/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Image
              src="/images/sparkslogo.png"
              alt="SPARKS"
              width={120}
              height={40}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-primary mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Add the finishing touches to start helping patients
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a professional profile picture that patients will see
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage
                      src={profileData.profilePictureUrl}
                      alt="Profile picture"
                    />
                    <AvatarFallback className="text-2xl">
                      <User className="w-16 h-16" />
                    </AvatarFallback>
                  </Avatar>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Picture
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <p className="text-xs text-muted-foreground text-center">
                    JPG or PNG format, max 5MB
                  </p>

                  {validationErrors.profilePicture && (
                    <p className="text-destructive text-sm">
                      {validationErrors.profilePicture}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Bio</CardTitle>
                <CardDescription>
                  Write a brief description of your experience and approach to
                  therapy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }));
                      clearValidationError("bio");
                    }}
                    className={`min-h-[120px] ${
                      validationErrors.bio ? "border-destructive" : ""
                    }`}
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{profileData.bio.length}/500 characters</span>
                    <span>Minimum 50 characters</span>
                  </div>
                  {validationErrors.bio && (
                    <p className="text-destructive text-xs">
                      {validationErrors.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Rate Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Hourly Rate
                </CardTitle>
                <CardDescription>
                  Set your consultation fee per hour (Leave as 0 for free
                  consultations)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Rate (LKR) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      Rs.
                    </span>
                    <Input
                      id="hourlyRate"
                      value={profileData.hourlyRate}
                      onChange={(e) => handleRateChange(e.target.value)}
                      className={`pl-12 ${
                        validationErrors.hourlyRate ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {validationErrors.hourlyRate && (
                    <p className="text-destructive text-xs">
                      {validationErrors.hourlyRate}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Details
                </CardTitle>
                <CardDescription>
                  Add your bank information for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">
                      Account Holder Name *
                    </Label>
                    <Input
                      id="accountHolderName"
                      value={profileData.accountHolderName}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          accountHolderName: e.target.value,
                        }));
                        clearValidationError("accountHolderName");
                      }}
                      className={
                        validationErrors.accountHolderName
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {validationErrors.accountHolderName && (
                      <p className="text-destructive text-xs">
                        {validationErrors.accountHolderName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number *</Label>
                    <Input
                      id="bankAccountNumber"
                      value={profileData.bankAccountNumber}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          bankAccountNumber: e.target.value,
                        }));
                        clearValidationError("bankAccountNumber");
                      }}
                      className={
                        validationErrors.bankAccountNumber
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {validationErrors.bankAccountNumber && (
                      <p className="text-destructive text-xs">
                        {validationErrors.bankAccountNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={profileData.bankName}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          bankName: e.target.value,
                        }));
                        clearValidationError("bankName");
                      }}
                      className={
                        validationErrors.bankName ? "border-destructive" : ""
                      }
                    />
                    {validationErrors.bankName && (
                      <p className="text-destructive text-xs">
                        {validationErrors.bankName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch Name *</Label>
                    <Input
                      id="branchName"
                      value={profileData.branchName}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          branchName: e.target.value,
                        }));
                        clearValidationError("branchName");
                      }}
                      className={
                        validationErrors.branchName ? "border-destructive" : ""
                      }
                    />
                    {validationErrors.branchName && (
                      <p className="text-destructive text-xs">
                        {validationErrors.branchName}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full max-w-md bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isLoading
                  ? "Setting up your profile..."
                  : "Complete Setup & Go to Dashboard"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
