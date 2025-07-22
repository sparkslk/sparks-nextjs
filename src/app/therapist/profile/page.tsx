"use client";

import { useState } from "react";
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

const mockProfile: TherapistProfile = {
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "0771234567",
  dateOfBirth: "1985-03-15",
  gender: "female",
  address: {
    houseNumber: "123",
    streetName: "Colombo Road",
    city: "Kandy",
  },
  profilePicture: "/images/profile-placeholder.jpg",
  bio: "Experienced ADHD specialist with over 8 years of practice. I focus on cognitive behavioral therapy and holistic approaches.",
  licenseNumber: "LIC123456",
  primarySpecialty: "adhd-specialist",
  yearsOfExperience: "5-10-years",
  highestEducation: "doctorate",
  institution: "University of Colombo",
  adhdExperience:
    "Extensive experience working with ADHD patients including children and adults.",
  hourlyRate: "2500",
  bankDetails: {
    accountHolderName: "Sarah Johnson",
    accountNumber: "1234567890123",
    bankName: "Commercial Bank",
    branchName: "Kandy",
  },
  verificationStatus: "approved",
  verificationDate: "2025-01-10T10:30:00Z",
  joinedDate: "2025-01-05T14:20:00Z",
  lastUpdated: "2025-01-15T09:15:00Z",
  profileCompletion: 85,
};

export default function TherapistProfilePage() {
  const [profile, setProfile] = useState<TherapistProfile>(mockProfile);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TherapistProfile>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    setEditData({ ...profile });
  };

  const cancelEdit = () => {
    setActiveSection(null);
    setEditData({});
  };

  const saveEdit = async () => {
    setIsLoading(true);
    try {
      // TODO: API call
      setProfile(editData);
      setActiveSection(null);
      setEditData({});
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsLoading(false);
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
                        value={editData.phone || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editData.dateOfBirth || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={editData.gender || ""}
                        onValueChange={(value) =>
                          setEditData({ ...editData, gender: value })
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
                        value={editData.address?.city || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            address: {
                              ...editData.address,
                              city: e.target.value,
                            },
                          })
                        }
                        placeholder="Your city"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={editData.bio || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                      placeholder="Tell patients about your approach and experience..."
                      className="min-h-[100px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(editData.bio || "").length}/500 characters
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
                        value={editData.hourlyRate || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            hourlyRate: e.target.value.replace(/[^0-9.]/g, ""),
                          })
                        }
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
                        value={editData.bankDetails?.accountHolderName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            bankDetails: {
                              ...editData.bankDetails,
                              accountHolderName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={editData.bankDetails?.bankName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            bankDetails: {
                              ...editData.bankDetails,
                              bankName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        value={editData.bankDetails?.accountNumber || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            bankDetails: {
                              ...editData.bankDetails,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="branchName">Branch Name *</Label>
                      <Input
                        id="branchName"
                        value={editData.bankDetails?.branchName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            bankDetails: {
                              ...editData.bankDetails,
                              branchName: e.target.value,
                            },
                          })
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
