"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import {
  Edit,
  Save,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  Upload,
  Star,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";

// Fixed TherapistProfile interface with all required properties
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
}

export default function TherapistProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isCompletionMode = searchParams.get('complete') === 'true';

  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TherapistProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionBanner, setShowCompletionBanner] = useState(isCompletionMode);
  const [error, setError] = useState<string>('');

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/therapist/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        // Map API response to frontend interface
        const profileData: TherapistProfile = {
          name: data.profileData.name,
          email: data.profileData.email,
          phone: data.profileData.phone,
          dateOfBirth: data.profileData.dateOfBirth,
          gender: data.profileData.gender,
          address: {
            houseNumber: data.profileData.address.houseNumber,
            streetName: data.profileData.address.streetName,
            city: data.profileData.address.city,
          },
          profilePicture: data.profileData.hasProfileImage 
            ? "/api/therapist/profile/image"
            : "/images/profile-placeholder.jpg",
          bio: data.profileData.bio,
          licenseNumber: data.profileData.licenseNumber,
          primarySpecialty: data.profileData.primarySpecialty,
          yearsOfExperience: data.profileData.yearsOfExperience,
          highestEducation: data.profileData.highestEducation,
          institution: data.profileData.institution,
          adhdExperience: data.profileData.adhdExperience,
          hourlyRate: data.profileData.hourlyRate,
          bankDetails: {
            accountHolderName: data.profileData.bankDetails.accountHolderName,
            accountNumber: data.profileData.bankDetails.accountNumber,
            bankName: data.profileData.bankDetails.bankName,
            branchName: data.profileData.bankDetails.branchName,
          },
          verificationStatus: data.profileData.verificationStatus,
          verificationDate: data.profileData.verificationDate,
          joinedDate: data.profileData.joinedDate,
          lastUpdated: data.profileData.lastUpdated,
          profileCompletion: data.profileData.profileCompletion,
        };
        setProfile(profileData);
        // Auto-open personal section if in completion mode and profile incomplete
        if (isCompletionMode && data.profileData.profileCompletion < 80) {
          setActiveSection('personal');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user?.role === 'THERAPIST') {
      fetchProfileData();
    }
  }, [session, isCompletionMode]);

  // Show loading state while fetching profile
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700">Loading your profile...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Error Loading Profile</h2>
                <p className="text-sm mt-2">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Show message if no profile found
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-700">Profile Not Found</h2>
              <p className="text-gray-600 mt-2">Unable to load your profile information.</p>
              <Button onClick={() => router.push('/therapist/dashboard')} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-4 h-4" />,
          text: "Verification Pending",
          message: "Your profile is under review by our team",
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Verified Therapist",
          message: "Your profile has been verified and approved",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Action Required",
          message: "Please review and update your information",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Unknown Status",
          message: "",
        };
    }
  };

  // const getCompletionStatus = () => {
  //   const completion = profile.profileCompletion;
  //   if (completion === 100)
  //     return { color: "bg-green-500", status: "Complete" };
  //   if (completion >= 80)
  //     return { color: "bg-blue-500", status: "Almost Complete" };
  //   if (completion >= 60)
  //     return { color: "bg-yellow-500", status: "In Progress" };
  //   return { color: "bg-red-500", status: "Needs Attention" };
  // };

  const startEdit = (section: string) => {
    setActiveSection(section);
    // Properly initialize edit data with current profile values
    if (profile) {
      setEditData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        address: {
          houseNumber: profile.address.houseNumber,
          streetName: profile.address.streetName,
          city: profile.address.city,
        },
        bio: profile.bio,
        licenseNumber: profile.licenseNumber,
        primarySpecialty: profile.primarySpecialty,
        yearsOfExperience: profile.yearsOfExperience,
        highestEducation: profile.highestEducation,
        institution: profile.institution,
        adhdExperience: profile.adhdExperience,
        hourlyRate: profile.hourlyRate,
        bankDetails: {
          accountHolderName: profile.bankDetails.accountHolderName,
          accountNumber: profile.bankDetails.accountNumber,
          bankName: profile.bankDetails.bankName,
          branchName: profile.bankDetails.branchName,
        },
      });
    }
  };

  const cancelEdit = () => {
    setActiveSection(null);
    setEditData({});
  };

  const saveEdit = async () => {
    try {
      setIsLoading(true);
      // Prepare data for API
      const updateData = {
        // Personal information
        phone: editData.phone || profile?.phone,
        dateOfBirth: editData.dateOfBirth || profile?.dateOfBirth,
        gender: editData.gender || profile?.gender,
        houseNumber: editData.address?.houseNumber || profile?.address.houseNumber,
        streetName: editData.address?.streetName || profile?.address.streetName,
        city: editData.address?.city || profile?.address.city,
        bio: editData.bio || profile?.bio,
        // Business information
        hourlyRate: (editData.hourlyRate || profile?.hourlyRate || '0').toString(),
        accountHolderName: editData.bankDetails?.accountHolderName || profile?.bankDetails.accountHolderName,
        accountNumber: editData.bankDetails?.accountNumber || profile?.bankDetails.accountNumber,
        bankName: editData.bankDetails?.bankName || profile?.bankDetails.bankName,
        branchName: editData.bankDetails?.branchName || profile?.bankDetails.branchName,
      };
      
      const response = await fetch('/api/therapist/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Update local state
      if (profile) {
        const updatedProfile = { ...profile, ...editData };
        if (result.completionPercentage !== undefined) {
          updatedProfile.profileCompletion = result.completionPercentage;
        }
        setProfile(updatedProfile);
      }
      // Clear edit data and close section
      setEditData({});
      setActiveSection(null);
      // If in completion mode and profile is now complete, offer to go to dashboard
      if (isCompletionMode && result.completionPercentage >= 80) {
        const shouldRedirect = confirm(
          "Great! Your profile is now complete. Would you like to go to your dashboard?"
        );
        if (shouldRedirect) {
          router.push('/therapist/dashboard');
        }
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileComplete = () => {
    if (profile.profileCompletion >= 80) {
      router.push('/therapist/dashboard');
    } else {
      alert('Please complete the required fields before proceeding to your dashboard.');
    }
  };

  const ProfileHeader = () => {
    const statusInfo = getStatusInfo(profile.verificationStatus);

    return (
      <div className="space-y-6 mb-8">
        {/* Main Profile Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.profilePicture} />
                  <AvatarFallback className="text-3xl bg-primary text-white">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => startEdit("photo")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Update Photo
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </span>
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {profile.licenseNumber}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>

                {/* Status and Progress */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color}`}
                  >
                    {statusInfo.icon}
                    <span className="font-medium">{statusInfo.text}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">Profile Completion</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={profile.profileCompletion}
                        className="w-24"
                      />
                      <span className="font-medium">
                        {profile.profileCompletion}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Message */}
        {statusInfo.message && (
          <Card
            className={`border ${statusInfo.color.split(" ")[2]} ${
              statusInfo.color.split(" ")[0]
            }/20`}
          >
            <CardContent className="p-4">
              <p className="text-sm">{statusInfo.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const EditableSection = ({
    title,
    description,
    icon,
    sectionKey,
    children,
    editChildren,
    required = false,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    sectionKey: string;
    children: React.ReactNode;
    editChildren: React.ReactNode;
    required?: boolean;
  }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {title}
                {required && <span className="text-red-500">*</span>}
              </CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </div>

          {activeSection === sectionKey ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} disabled={isLoading}>
                <Save className="w-4 h-4 mr-1" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEdit(sectionKey)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {activeSection === sectionKey ? editChildren : children}
      </CardContent>
    </Card>
  );

  const InfoItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
      {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProfileHeader />

          {/* Profile Completion Banner */}
          {showCompletionBanner && (
            <Card className="border-blue-200 bg-blue-50 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Welcome! Complete Your Profile
                    </h3>
                    <p className="text-blue-800 mb-4">
                      Congratulations on your approval! To start accepting patients, please complete your profile by adding:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 mb-4">
                      <li>• Personal contact information</li>
                      <li>• Professional hourly rate</li>
                      <li>• Bank account details (optional)</li>
                      <li>• Profile picture (optional)</li>
                    </ul>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          // Auto-open required sections
                          setActiveSection('personal');
                          setShowCompletionBanner(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Complete Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCompletionBanner(false)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-100"
                      >
                        Skip for Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-8">
            {/* Personal Information */}
            <EditableSection
              title="Personal Information"
              description="Your basic contact and personal details"
              icon={<User className="w-5 h-5" />}
              sectionKey="personal"
              required
              editChildren={
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={editData.phone || profile?.phone || ""}
                        onChange={(e) =>
                          setEditData(prev => ({ 
                            ...prev, 
                            phone: e.target.value 
                          }))
                        }
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editData.dateOfBirth || profile?.dateOfBirth || ""}
                        onChange={(e) =>
                          setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={editData.gender || profile?.gender || ""}
                        onValueChange={(value) =>
                          setEditData(prev => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={editData.address?.city || profile?.address?.city || ""}
                        onChange={(e) =>
                          setEditData(prev => ({
                            ...prev,
                            address: {
                              houseNumber: prev.address?.houseNumber || profile?.address?.houseNumber || "",
                              streetName: prev.address?.streetName || profile?.address?.streetName || "",
                              city: e.target.value,
                            },
                          }))
                        }
                        placeholder="Your city"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={editData.bio || profile?.bio || ""}
                      onChange={(e) =>
                        setEditData(prev => ({ 
                          ...prev, 
                          bio: e.target.value 
                        }))
                      }
                      placeholder="Tell patients about your approach and experience..."
                      className="min-h-[100px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editData.bio || profile?.bio || "").length}/500 characters
                    </p>
                  </div>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Phone Number"
                  value={profile.phone}
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoItem
                  label="Date of Birth"
                  value={new Date(profile.dateOfBirth).toLocaleDateString()}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoItem
                  label="Gender"
                  value={
                    profile.gender.charAt(0).toUpperCase() +
                    profile.gender.slice(1).replace("-", " ")
                  }
                />
                <InfoItem
                  label="Location"
                  value={`${profile.address.city}, Sri Lanka`}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </EditableSection>

            {/* Professional Qualifications */}
            <EditableSection
              title="Professional Qualifications"
              description="Your credentials and specializations"
              icon={<GraduationCap className="w-5 h-5" />}
              sectionKey="professional"
              required
              editChildren={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={editData.licenseNumber || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            licenseNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution *</Label>
                      <Input
                        id="institution"
                        value={editData.institution || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            institution: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="adhdExperience">
                      ADHD-Specific Experience
                    </Label>
                    <Textarea
                      id="adhdExperience"
                      value={editData.adhdExperience || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          adhdExperience: e.target.value,
                        })
                      }
                      placeholder="Describe your specific experience with ADHD patients..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              }
            >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      label="License Number"
                      value={profile.licenseNumber}
                      icon={<Award className="w-4 h-4" />}
                    />
                    <InfoItem
                      label="Primary Specialty"
                      value={profile.primarySpecialty
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    />
                    <InfoItem
                      label="Experience Level"
                      value={profile.yearsOfExperience
                        .split("-")
                        .join(" ")
                        .toUpperCase()}
                      icon={<Star className="w-4 h-4" />}
                    />
                    <InfoItem
                      label="Education"
                      value={
                        profile.highestEducation.charAt(0).toUpperCase() +
                        profile.highestEducation.slice(1)
                      }
                    />
                  </div>
                  <InfoItem label="Institution" value={profile.institution} />
                </div>
              </EditableSection>

            {/* Business Settings */}
            <EditableSection
              title="Business Settings"
              description="Your consultation rates and payment information"
              icon={<DollarSign className="w-5 h-5" />}
              sectionKey="business"
              editChildren={
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (LKR) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Rs.
                      </span>
                      <Input
                        id="hourlyRate"
                        className="pl-12"
                        value={editData.hourlyRate || profile?.hourlyRate || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          setEditData(prev => ({ ...prev, hourlyRate: value }));
                        }}
                        placeholder="0 for free consultations"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 0 for free consultations, maximum Rs. 10,000
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountHolder">
                        Account Holder Name *
                      </Label>
                      <Input
                        id="accountHolder"
                        value={editData.bankDetails?.accountHolderName || profile?.bankDetails.accountHolderName || ""}
                        onChange={(e) =>
                          setEditData(prev => ({
                            ...prev,
                            bankDetails: {
                              ...prev.bankDetails,
                              accountHolderName: e.target.value,
                              accountNumber: prev.bankDetails?.accountNumber || profile?.bankDetails.accountNumber || "",
                              bankName: prev.bankDetails?.bankName || profile?.bankDetails.bankName || "",
                              branchName: prev.bankDetails?.branchName || profile?.bankDetails.branchName || "",
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={editData.bankDetails?.bankName || profile?.bankDetails.bankName || ""}
                        onChange={(e) =>
                          setEditData(prev => ({
                            ...prev,
                            bankDetails: {
                              ...prev.bankDetails,
                              accountHolderName: prev.bankDetails?.accountHolderName || profile?.bankDetails.accountHolderName || "",
                              accountNumber: prev.bankDetails?.accountNumber || profile?.bankDetails.accountNumber || "",
                              bankName: e.target.value,
                              branchName: prev.bankDetails?.branchName || profile?.bankDetails.branchName || "",
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        value={editData.bankDetails?.accountNumber || profile?.bankDetails.accountNumber || ""}
                        onChange={(e) =>
                          setEditData(prev => ({
                            ...prev,
                            bankDetails: {
                              ...prev.bankDetails,
                              accountHolderName: prev.bankDetails?.accountHolderName || profile?.bankDetails.accountHolderName || "",
                              accountNumber: e.target.value,
                              bankName: prev.bankDetails?.bankName || profile?.bankDetails.bankName || "",
                              branchName: prev.bankDetails?.branchName || profile?.bankDetails.branchName || "",
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="branchName">Branch Name *</Label>
                      <Input
                        id="branchName"
                        value={editData.bankDetails?.branchName || profile?.bankDetails.branchName || ""}
                        onChange={(e) =>
                          setEditData(prev => ({
                            ...prev,
                            bankDetails: {
                              ...prev.bankDetails,
                              accountHolderName: prev.bankDetails?.accountHolderName || profile?.bankDetails.accountHolderName || "",
                              accountNumber: prev.bankDetails?.accountNumber || profile?.bankDetails.accountNumber || "",
                              bankName: prev.bankDetails?.bankName || profile?.bankDetails.bankName || "",
                              branchName: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              }
            >
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Consultation Rate
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {profile.hourlyRate === "0"
                        ? "Free Consultations"
                        : `Rs. ${profile.hourlyRate}/hour`}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Bank Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        label="Account Holder"
                        value={profile.bankDetails.accountHolderName}
                      />
                      <InfoItem
                        label="Bank"
                        value={profile.bankDetails.bankName}
                      />
                      <InfoItem
                        label="Account Number"
                        value={`****${profile.bankDetails.accountNumber.slice(
                          -4
                        )}`}
                      />
                      <InfoItem
                        label="Branch"
                        value={profile.bankDetails.branchName}
                      />
                    </div>
                  </div>
                </div>
              </EditableSection>
          </div>
        </div>
      </div>
    </div>
  );
}
