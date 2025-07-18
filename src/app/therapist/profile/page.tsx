"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Clock,
  Edit3,
  Save,
  X,
  Building,
  Star,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { ProfileStatsCard, SpecializationDisplay } from "@/components/therapist/ProfileComponents";
import { ProfileLoadingSkeleton } from "@/components/therapist/ProfileLoadingSkeleton";

interface TherapistProfile {
  id: string;
  licenseNumber: string;
  specialization: string[];
  experience: number;
  bio: string;
  availability: any;
  rating?: number;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  organization: {
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TherapistStats {
  totalPatients: number;
  todayAppointments: number;
  completedSessions: number;
  pendingTasks: number;
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TherapistProfilePage() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [stats, setStats] = useState<TherapistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<TherapistProfile>>({});

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/therapist/profile");
      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          setProfile(data);
          setEditedProfile(data);
        } else {
          console.error("Invalid profile data received:", data);
          toast.error("Invalid profile data received");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to load profile:", errorData);
        toast.error(errorData.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/therapist/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    toast.info("Edit mode enabled. Make your changes and save when ready.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile || {});
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/therapist/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: editedProfile.bio,
          specialization: editedProfile.specialization,
          experience: editedProfile.experience,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecializationChange = (value: string) => {
    const specializations = value.split(",").map(s => s.trim()).filter(s => s);
    handleInputChange("specialization", specializations);
  };

  if (isLoading) {
    return <ProfileLoadingSkeleton />;
  }

  if (!profile || !profile.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">
            Unable to load your profile information. Please try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your professional profile and information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-blue-100">
                  <AvatarImage src={profile.user?.image || undefined} alt={profile.user?.name || "Therapist"} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(profile.user?.name || profile.user?.email || "T")}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <CardTitle className="text-xl">{profile.user?.name || "Unknown Therapist"}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <Award className="h-4 w-4" />
                Licensed Therapist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.user?.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">License: {profile.licenseNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.organization?.name || "No organization"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.experience || 0} years experience</span>
              </div>
              {profile.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{profile.rating} rating</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {stats && (
            <div className="mt-6">
              <ProfileStatsCard stats={stats} />
            </div>
          )}
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="professional" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="professional">Professional Info</TabsTrigger>
              <TabsTrigger value="specializations">Specializations</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Your professional details and biography
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="license">License Number</Label>
                      <Input
                        id="license"
                        value={profile.licenseNumber}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      {isEditing ? (
                        <Input
                          id="experience"
                          type="number"
                          value={editedProfile.experience || 0}
                          onChange={(e) =>
                            handleInputChange("experience", parseInt(e.target.value) || 0)
                          }
                          className="mt-1"
                        />
                      ) : (
                        <Input
                          id="experience"
                          value={profile.experience || 0}
                          disabled
                          className="mt-1"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Professional Biography</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editedProfile.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell us about your professional background, approach to therapy, and what makes you unique as a therapist..."
                        className="mt-1 min-h-[120px]"
                      />
                    ) : (
                      <Textarea
                        id="bio"
                        value={profile.bio || "No biography provided"}
                        disabled
                        className="mt-1 min-h-[120px]"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specializations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Areas of Specialization</CardTitle>
                  <CardDescription>
                    The therapeutic areas and approaches you specialize in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div>
                      <Label htmlFor="specializations">
                        Specializations (comma-separated)
                      </Label>
                      <Input
                        id="specializations"
                        value={editedProfile.specialization?.join(", ") || ""}
                        onChange={(e) => handleSpecializationChange(e.target.value)}
                        placeholder="e.g., ADHD, Anxiety, Depression, Family Therapy"
                        className="mt-1"
                      />
                      <div className="mt-3">
                        <SpecializationDisplay
                          specializations={editedProfile.specialization || []}
                          isEditing={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <SpecializationDisplay
                      specializations={profile.specialization}
                      isEditing={false}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                  <CardDescription>
                    Manage your working hours and availability for sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Availability Management
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Set your availability through the dedicated availability page
                    </p>
                    <Button asChild>
                      <a href="/therapist/setAvailability">
                        Manage Availability
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
