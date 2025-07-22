"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Basic User type to replace 'any'
interface User {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  [key: string]: unknown;
}

interface UserDetailEditProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedUser: User) => void;
}

const UserDetailEdit: React.FC<UserDetailEditProps> = ({
  user,
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<User>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setValidationErrors(prev => ({
      ...prev,
      email: isValid ? undefined : 'Please enter a valid email address'
    }));
    return isValid;
  };

  const validatePhone = (phone: string): boolean => {
    // Allow empty phone as it's optional
    if (!phone) return true;
    // Accept formats: +94XXXXXXXXX or 0XXXXXXXXX
    const phoneRegex = /^(?:\+94|0)\d{9}$/;
    const isValid = phoneRegex.test(phone);
    setValidationErrors(prev => ({
      ...prev,
      phone: isValid ? undefined : 'Please enter a valid phone number (+94XXXXXXXXX or 0XXXXXXXXX)'
    }));
    return isValid;
  };

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        role: user.role,
        // Common fields
        fullName: (user.name as string) || user.fullName || "",
        fullname: (user.name as string) || user.fullName || "", // For therapist
        email: user.email || "",
        // Patient specific
        gender: user.gender || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
        medicalHistory: user.medicalHistory || "",
        emergencyContact: user.emergencyContact || "",
        // Therapist specific
        licenseNumber: user.licenseNumber || "",
        specialization: user.specialization || "",
        experience: user.experience || "",
        availability: user.availability || "",
        rating: user.rating || "",
        // Guardian specific
        patient: user.patient || "",
        relationship: user.relationship || "",
      });
      setError(null);
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: User) => ({
      ...prev,
      [field]: value,
    }));
    
    // Validate fields on change
    if (field === 'email') {
      validateEmail(value);
    } else if (field === 'phone') {
      validatePhone(value);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    // Validate all fields before submitting
    const isEmailValid = validateEmail(formData.email as string);
    const isPhoneValid = validatePhone(formData.phone as string);

    if (!isEmailValid || !isPhoneValid) {
      setLoading(false);
      const errorMessages = [];
      if (!isEmailValid) errorMessages.push("Please enter a valid email address");
      if (!isPhoneValid) errorMessages.push("Please enter a valid phone number");
      setError(errorMessages.join(". "));
      return;
    }

    try {
      // Prepare the data to send to API based on role
      let apiData: User & Record<string, unknown> = {
        role: user.role,
      };

      // Add role-specific fields matching your API expectations
      if (user.role === "Patient") {
        // Split fullName into firstName and lastName for API
        const nameParts = (formData.fullName || "").trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        apiData = {
          ...apiData,
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          medicalHistory: formData.medicalHistory,
          emergencyContact: formData.emergencyContact,
        };
      } else if (user.role === "Therapist") {
        apiData = {
          ...apiData,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          experience: formData.experience,
          availability: formData.availability,
          rating: parseFloat(formData.rating as string) || null,
        };
      } else if (user.role === "Guardian") {
        apiData = {
          ...apiData,
          relationship: formData.relationship,
        };
      } else if (user.role === "Manager") {
        apiData = {
          ...apiData,
          name: formData.fullName,
          email: formData.email,
        };
      }

      console.log("Sending API data:", apiData);

      // Make API call to update user (using PATCH to match your API)
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const result = await response.json();
      console.log("API response:", result);
      
      // Prepare the updated user data in the raw API format for the users state
      const updatedRawUser = {
        ...user, // Keep existing user data
        id: user.id,
        role: user.role,
        createdAt: user.joinedDate ? `${user.joinedDate}T00:00:00.000Z` : new Date().toISOString(),
        
        // Update fields based on role in the format expected by the raw users array
        ...(user.role === "Patient" && {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          medicalHistory: formData.medicalHistory,
          emergencyContact: formData.emergencyContact,
        }),
        ...(user.role === "Therapist" && {
          fullname: formData.fullname,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          experience: formData.experience,
          availability: formData.availability,
          rating: formData.rating,
        }),
        ...(user.role === "Guardian" && {
          fullName: formData.fullName,
          email: formData.email,
          patient: formData.patient,
          relationship: formData.relationship,
        }),
        ...(user.role === "Manager" && {
          fullName: formData.fullName,
          email: formData.email,
        }),
      };
      
      // Call the onSave callback with the raw user data format
      onSave(updatedRawUser);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const renderPatientFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={(formData.fullName as string) || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={(formData.email as string) || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender ? String(formData.gender) : ""}
            onValueChange={(value) => handleInputChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender">
                {formData.gender ? String(formData.gender) : "Select gender"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="space-y-1">
            <Input
              id="phone"
              value={(formData.phone as string) || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number (e.g., +94XXXXXXXXX)"
              className={validationErrors.phone ? "border-red-500" : ""}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-500">{validationErrors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={(formData.dateOfBirth as string) || ""}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={(formData.address as string) || ""}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Enter address"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicalHistory">Medical History</Label>
        <Textarea
          id="medicalHistory"
          value={(formData.medicalHistory as string) || ""}
          onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
          placeholder="Enter medical history"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Textarea
          id="emergencyContact"
          value={(formData.emergencyContact as string) || ""}
          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
          placeholder="Enter emergency contact details"
          rows={2}
        />
      </div>
    </>
  );

  const renderTherapistFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullname">Full Name *</Label>
          <Input
            id="fullname"
            value={(formData.fullname as string) || ""}
            onChange={(e) => handleInputChange("fullname", e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={(formData.email as string) || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={(formData.licenseNumber as string) || ""}
            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
            placeholder="Enter license number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={(formData.specialization as string) || ""}
            onChange={(e) => handleInputChange("specialization", e.target.value)}
            placeholder="Enter specialization"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience">Experience</Label>
          <Input
            id="experience"
            value={(formData.experience as string) || ""}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            placeholder="Enter experience (e.g., 5 years)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Input
            id="availability"
            value={(formData.availability as string) || ""}
            onChange={(e) => handleInputChange("availability", e.target.value)}
            placeholder="Enter availability"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={(formData.rating as string) || ""}
            onChange={(e) => handleInputChange("rating", e.target.value)}
            placeholder="Enter rating (0-5)"
          />
        </div>
      </div>
    </>
  );

  const renderGuardianFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={(formData.fullName as string) || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={(formData.email as string) || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient">Patient</Label>
          <Input
            id="patient"
            value={(formData.patient as string) || ""}
            onChange={(e) => handleInputChange("patient", e.target.value)}
            placeholder="Enter patient name/ID"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select
            value={(formData.relationship as string) || ""}
            onValueChange={(value) => handleInputChange("relationship", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Spouse">Spouse</SelectItem>
              <SelectItem value="Sibling">Sibling</SelectItem>
              <SelectItem value="Child">Child</SelectItem>
              <SelectItem value="Guardian">Guardian</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


    </>
  );

  const renderManagerFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={(formData.fullName as string) || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={(formData.email as string) || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>
      </div>

      {/*<div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={(formData.status as string) || ""}
          onValueChange={(value) => handleInputChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>*/}
    </>
  );

  const renderFieldsByRole = () => {
    switch (user.role) {
      case "Patient":
        return renderPatientFields();
      case "Therapist":
        return renderTherapistFields();
      case "Guardian":
        return renderGuardianFields();
      case "Manager":
        return renderManagerFields();
      default:
        return renderManagerFields(); // Fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit {user.role} Details
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {renderFieldsByRole()}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-[#8159A8] hover:bg-[#6d4a91]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailEdit;