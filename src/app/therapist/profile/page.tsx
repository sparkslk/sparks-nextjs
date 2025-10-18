"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  DollarSign,
  CreditCard,
  CheckCircle,
  Shield,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface TherapistProfile {
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
  profilePicture: string;
  bio: string;
  licenseNumber: string;
  primarySpecialty: string;
  yearsOfExperience: string;
  highestEducation: string;
  institution: string;
  adhdExperience: string;
  hourlyRate: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
  };
  verificationStatus: string;
  verificationDate: string;
  joinedDate: string;
  lastUpdated: string;
  profileCompletion: number;
  hasProfileImage: boolean;
}

export default function TherapistProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/therapist/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();
        
        const profileData: TherapistProfile = {
          name: data.profileData.name,
          email: data.profileData.email,
          phone: data.profileData.phone || "",
          dateOfBirth: data.profileData.dateOfBirth || "",
          gender: data.profileData.gender || "",
          address: {
            houseNumber: data.profileData.address.houseNumber || "",
            streetName: data.profileData.address.streetName || "",
            city: data.profileData.address.city || "",
          },
          profilePicture: data.profileData.hasProfileImage
            ? `/api/therapist/profile/image?t=${Date.now()}`
            : "",
          bio: data.profileData.bio || "",
          licenseNumber: data.profileData.licenseNumber || "",
          primarySpecialty: data.profileData.primarySpecialty || "",
          yearsOfExperience: data.profileData.yearsOfExperience || "",
          highestEducation: data.profileData.highestEducation || "",
          institution: data.profileData.institution || "",
          adhdExperience: data.profileData.adhdExperience || "",
          hourlyRate: data.profileData.hourlyRate || "0",
          bankDetails: {
            accountHolderName: data.profileData.bankDetails.accountHolderName || "",
            accountNumber: data.profileData.bankDetails.accountNumber || "",
            bankName: data.profileData.bankDetails.bankName || "",
            branchName: data.profileData.bankDetails.branchName || "",
          },
          verificationStatus: data.profileData.verificationStatus || "pending",
          verificationDate: data.profileData.verificationDate || "",
          joinedDate: data.profileData.joinedDate || "",
          lastUpdated: data.profileData.lastUpdated || "",
          profileCompletion: data.completionPercentage || 0,
          hasProfileImage: data.profileData.hasProfileImage || false,
        };
        
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === "THERAPIST") {
      fetchProfileData();
    }
  }, [session]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Verified",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Pending",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: status,
        };
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const formatSpecialty = (specialty: string) => {
    return specialty
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatGender = (gender: string) => {
    if (!gender) return "Not specified";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Not specified";
    }
  };

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Profile</h2>
            <p className="text-gray-600 mb-4">{error || "Profile not found"}</p>
            <Button onClick={() => router.push("/therapist/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadge = getStatusBadge(profile.verificationStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                View and manage your professional information
              </p>
            </div>
            <Button
              onClick={() => router.push("/therapist/profile/edit")}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                      <AvatarImage src={profile.profilePicture} alt={profile.name} />
                      <AvatarFallback className="text-3xl bg-primary text-white">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div
                      className={`mt-4 px-3 py-1.5 rounded-full border text-sm font-medium flex items-center gap-2 ${statusBadge.color}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {profile.name}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                      {profile.licenseNumber && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{profile.licenseNumber}</span>
                        </div>
                      )}
                      {profile.address.city && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{profile.address.city}, Sri Lanka</span>
                        </div>
                      )}
                    </div>

                    {profile.bio && (
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {profile.bio}
                      </p>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Profile Completion
                        </span>
                        <span
                          className={`text-sm font-bold ${getCompletionColor(
                            profile.profileCompletion
                          )}`}
                        >
                          {profile.profileCompletion}%
                        </span>
                      </div>
                      <Progress value={profile.profileCompletion} className="h-2" />
                      {profile.profileCompletion < 100 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Complete your profile to improve visibility and credibility
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Your qualifications and expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Primary Specialty
                    </p>
                    <p className="text-gray-900">
                      {profile.primarySpecialty
                        ? formatSpecialty(profile.primarySpecialty)
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Years of Experience
                    </p>
                    <p className="text-gray-900">
                      {profile.yearsOfExperience
                        ? profile.yearsOfExperience.replace("-", " ").toUpperCase()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Highest Education
                    </p>
                    <p className="text-gray-900">
                      {profile.highestEducation
                        ? profile.highestEducation.charAt(0).toUpperCase() +
                          profile.highestEducation.slice(1)
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Institution
                    </p>
                    <p className="text-gray-900">
                      {profile.institution || "Not specified"}
                    </p>
                  </div>
                  {profile.adhdExperience && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        ADHD-Specific Experience
                      </p>
                      <p className="text-gray-900">{profile.adhdExperience}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Details
                </CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Date of Birth
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">
                        {formatDate(profile.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                    <p className="text-gray-900">{formatGender(profile.gender)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Member Since
                    </p>
                    <p className="text-gray-900">{formatDate(profile.joinedDate)}</p>
                  </div>
                </div>
                
                {(profile.address.houseNumber || profile.address.streetName || profile.address.city) && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-900">
                        {[
                          profile.address.houseNumber,
                          profile.address.streetName,
                          profile.address.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Your rates and payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Consultation Rate
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-900">
                        {profile.hourlyRate === "0" || !profile.hourlyRate
                          ? "Free Consultations"
                          : `Rs. ${parseFloat(profile.hourlyRate).toLocaleString()}/hour`}
                      </span>
                    </div>
                  </div>
                </div>

                {(profile.bankDetails.accountHolderName ||
                  profile.bankDetails.bankName) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Bank Account Details
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.bankDetails.accountHolderName && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Account Holder
                          </p>
                          <p className="text-gray-900">
                            {profile.bankDetails.accountHolderName}
                          </p>
                        </div>
                      )}
                      {profile.bankDetails.bankName && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                          <p className="text-gray-900">
                            {profile.bankDetails.bankName}
                          </p>
                        </div>
                      )}
                      {profile.bankDetails.accountNumber && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Account Number
                          </p>
                          <p className="text-gray-900 font-mono">
                            ****{profile.bankDetails.accountNumber.slice(-4)}
                          </p>
                        </div>
                      )}
                      {profile.bankDetails.branchName && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Branch</p>
                          <p className="text-gray-900">
                            {profile.bankDetails.branchName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
