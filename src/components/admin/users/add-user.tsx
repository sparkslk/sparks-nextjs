"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

// Basic User type to replace 'any'
interface User {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  [key: string]: unknown; // Allow other properties
}

interface AddUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (newUser: User) => void;
}

const AddUser: React.FC<AddUserProps> = ({ open, onOpenChange, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("Patient");
  const [showPassword, setShowPassword] = useState(false);

  // Common fields
  const [formData, setFormData] = useState({
    // Patient fields
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    medicalHistory: "",
    emergencyContact: "",
    
    // Therapist fields
    fullname: "", // Note: API uses different field name for therapist
    licenseNumber: "",
    specialization: "",
    experience: "",
    availability: "",
    
    // Guardian fields
    patient: "",
    relationship: "",
    
    // Common
    temporaryPassword: "",
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      medicalHistory: "",
      emergencyContact: "",
      fullname: "",
      licenseNumber: "",
      specialization: "",
      experience: "",
      availability: "",
      patient: "",
      relationship: "",
      temporaryPassword: "",
    });
    setSelectedRole("Patient");
    setError(null);
    setShowPassword(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data based on role
      let userData: User & Record<string, unknown> = {
        role: selectedRole,
        temporaryPassword: formData.temporaryPassword,
      };

      if (selectedRole === "Patient") {
        userData = {
          ...userData,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          medicalHistory: formData.medicalHistory,
          emergencyContact: formData.emergencyContact,
        };
      } else if (selectedRole === "Therapist") {
        userData = {
          ...userData,
          fullname: formData.fullname, // API uses 'fullname' for therapist
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          experience: formData.experience,
          availability: formData.availability,
        };
      } else if (selectedRole === "Guardian") {
        userData = {
          ...userData,
          fullName: formData.fullName,
          email: formData.email,
          patient: formData.patient,
          relationship: formData.relationship,
        };
      } else if (selectedRole === "Manager") {
        userData = {
          ...userData,
          fullName: formData.fullName,
          email: formData.email,
        };
      }

      // Make API call
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const responseData = await response.json();
      
      // Call onAdd with the created user data
      onAdd(responseData.data || userData);
      
      // Reset form and close modal
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case "Patient":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="medicalHistory" className="text-sm font-medium text-gray-700">
                Medical History
              </Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">
                Emergency Contact
              </Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                className="mt-1"
                placeholder="Name, Phone, Relationship"
              />
            </div>
          </>
        );

      case "Therapist":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                  License Number *
                </Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Experience (years)
                </Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="availability" className="text-sm font-medium text-gray-700">
                Availability
              </Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange("availability", e.target.value)}
                className="mt-1"
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </div>
          </>
        );

      case "Guardian":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient" className="text-sm font-medium text-gray-700">
                  Patient Name
                </Label>
                <Input
                  id="patient"
                  value={formData.patient}
                  onChange={(e) => handleInputChange("patient", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">
                  Relationship
                </Label>
                <Select value={formData.relationship} onValueChange={(value) => handleInputChange("relationship", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case "Manager":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8159A8] flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Add New User
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Create a new user account in the system.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              User Role *
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patient">Patient</SelectItem>
                <SelectItem value="Therapist">Therapist</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          {/* Temporary Password Field */}
          <div>
            <Label htmlFor="temporaryPassword" className="text-sm font-medium text-gray-700">
              Temporary Password *
            </Label>
            <div className="relative mt-1">
              <Input
                id="temporaryPassword"
                type={showPassword ? "text" : "password"}
                value={formData.temporaryPassword}
                onChange={(e) => handleInputChange("temporaryPassword", e.target.value)}
                className="pr-10"
                placeholder="Set a temporary password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 px-3 py-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 border border-red-200 bg-red-50 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#8159A8" }}
              className="hover:bg-[#6b4a8e]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;