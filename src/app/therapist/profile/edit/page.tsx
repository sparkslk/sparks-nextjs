"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
} from "lucide-react";

interface TherapistProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: {
    houseNumber: string;
    streetName: string;
    city: string;
  };
  bio: string;
  hourlyRate: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
  };
  hasProfileImage: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function TherapistEditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<TherapistProfileData | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  // Form data state
  const [formData, setFormData] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "",
    houseNumber: "",
    streetName: "",
    city: "",
    bio: "",
    hourlyRate: "",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/therapist/profile");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        const profileData = data.profileData;

        setProfile(profileData);
        
        // Set profile image URL
        if (profileData.hasProfileImage) {
          setProfileImageUrl(`/api/therapist/profile/image?t=${Date.now()}`);
        }

        // Initialize form data
        setFormData({
          phone: profileData.phone || "",
          dateOfBirth: profileData.dateOfBirth || "",
          gender: profileData.gender?.toUpperCase() || "",
          houseNumber: profileData.address.houseNumber || "",
          streetName: profileData.address.streetName || "",
          city: profileData.address.city || "",
          bio: profileData.bio || "",
          hourlyRate: profileData.hourlyRate || "0",
          accountHolderName: profileData.bankDetails.accountHolderName || "",
          accountNumber: profileData.bankDetails.accountNumber || "",
          bankName: profileData.bankDetails.bankName || "",
          branchName: profileData.bankDetails.branchName || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setSaveError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === "THERAPIST") {
      fetchProfile();
    }
  }, [session]);

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle profile image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Please upload a JPG or PNG image",
      }));
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Image size must be less than 5MB",
      }));
      return;
    }

    // Clear any previous errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.profileImage;
      return newErrors;
    });

    // Set the file and preview
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfileImageUrl(previewUrl);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // Bio validation
    if (!formData.bio.trim()) {
      newErrors.bio = "Professional bio is required";
    } else if (formData.bio.trim().length < 50) {
      newErrors.bio = "Bio must be at least 50 characters";
    } else if (formData.bio.trim().length > 500) {
      newErrors.bio = "Bio must not exceed 500 characters";
    }

    // Hourly rate validation
    if (!formData.hourlyRate) {
      newErrors.hourlyRate = "Hourly rate is required";
    } else {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        newErrors.hourlyRate = "Please enter a valid rate (0 or higher)";
      } else if (rate > 10000) {
        newErrors.hourlyRate = "Rate cannot exceed Rs. 10,000";
      }
    }

    // Bank details validation
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      setSaveError("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      // First, update profile image if selected
      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", selectedFile);

        const imageResponse = await fetch("/api/therapist/profile/image", {
          method: "POST",
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.error || "Failed to upload profile image");
        }
      }

      // Update profile data
      const updateData = {
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        houseNumber: formData.houseNumber,
        streetName: formData.streetName,
        city: formData.city,
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        branchName: formData.branchName,
      };

      const response = await fetch("/api/therapist/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Show success message
      setSaveSuccess(true);
      
      // Redirect to profile page after short delay
      setTimeout(() => {
        router.push("/therapist/profile");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              Unable to load your profile data.
            </p>
            <Button onClick={() => router.push("/therapist/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/therapist/profile")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">
              Update your professional information and settings
            </p>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Profile updated successfully! Redirecting...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {saveError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{saveError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a professional photo that patients will see
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32 border-4 border-gray-100">
                    <AvatarImage src={profileImageUrl} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                  {errors.profileImage && (
                    <p className="text-sm text-red-600">{errors.profileImage}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    JPG or PNG, maximum 5MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your basic contact and personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name and Email (Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Name
                    </Label>
                    <Input value={profile.name} disabled />
                    <p className="text-xs text-gray-500">
                      Contact admin to change your name
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input value={profile.email} disabled />
                    <p className="text-xs text-gray-500">
                      Contact admin to change your email
                    </p>
                  </div>
                </div>

                {/* Phone, DOB, Gender */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+94 XX XXX XXXX"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="dateOfBirth"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleChange("dateOfBirth", e.target.value)
                      }
                      className={errors.dateOfBirth ? "border-red-500" : ""}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-xs text-red-600">{errors.dateOfBirth}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange("gender", value)}
                    >
                      <SelectTrigger
                        className={errors.gender ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-xs text-red-600">{errors.gender}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="House Number"
                      value={formData.houseNumber}
                      onChange={(e) =>
                        handleChange("houseNumber", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Street Name"
                      value={formData.streetName}
                      onChange={(e) =>
                        handleChange("streetName", e.target.value)
                      }
                    />
                    <div className="space-y-2">
                      <Input
                        placeholder="City *"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-600">{errors.city}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell patients about your approach, experience, and expertise..."
                    className={`min-h-[120px] ${
                      errors.bio ? "border-red-500" : ""
                    }`}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    {errors.bio ? (
                      <p className="text-xs text-red-600">{errors.bio}</p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {formData.bio.length}/500 characters (minimum 50)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Set your consultation rates and payment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hourly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">
                    Consultation Rate (LKR per hour) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      Rs.
                    </span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      max="10000"
                      value={formData.hourlyRate}
                      onChange={(e) => handleChange("hourlyRate", e.target.value)}
                      className={`pl-12 ${errors.hourlyRate ? "border-red-500" : ""}`}
                      placeholder="0 for free consultations"
                    />
                  </div>
                  {errors.hourlyRate ? (
                    <p className="text-xs text-red-600">{errors.hourlyRate}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Enter 0 for free consultations, maximum Rs. 10,000
                    </p>
                  )}
                </div>

                {/* Bank Details */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium">Bank Account Details *</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountHolderName">
                        Account Holder Name *
                      </Label>
                      <Input
                        id="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={(e) =>
                          handleChange("accountHolderName", e.target.value)
                        }
                        placeholder="Full name as per bank records"
                        className={
                          errors.accountHolderName ? "border-red-500" : ""
                        }
                      />
                      {errors.accountHolderName && (
                        <p className="text-xs text-red-600">
                          {errors.accountHolderName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) =>
                          handleChange("accountNumber", e.target.value)
                        }
                        placeholder="Bank account number"
                        className={errors.accountNumber ? "border-red-500" : ""}
                      />
                      {errors.accountNumber && (
                        <p className="text-xs text-red-600">
                          {errors.accountNumber}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) =>
                          handleChange("bankName", e.target.value)
                        }
                        placeholder="e.g., Bank of Ceylon"
                        className={errors.bankName ? "border-red-500" : ""}
                      />
                      {errors.bankName && (
                        <p className="text-xs text-red-600">{errors.bankName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchName">Branch Name *</Label>
                      <Input
                        id="branchName"
                        value={formData.branchName}
                        onChange={(e) =>
                          handleChange("branchName", e.target.value)
                        }
                        placeholder="e.g., Colombo 03"
                        className={errors.branchName ? "border-red-500" : ""}
                      />
                      {errors.branchName && (
                        <p className="text-xs text-red-600">
                          {errors.branchName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/therapist/profile")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="min-w-[150px]"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
