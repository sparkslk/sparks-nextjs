// src/app/therapist/verification/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { Upload, FileText, X } from "lucide-react";

interface FileUpload {
  name: string;
  size: number;
  type: string;
  id?: string; // Document ID from the API
}

interface PersonalFormData {
  phone: string;
  houseNumber: string;
  streetName: string;
  city: string;
  gender: string;
  dateOfBirth: string;
}

interface ProfessionalFormData {
  licenseNumber: string;
  primarySpecialty: string;
  yearsOfExperience: string;
  highestEducation: string;
  institution: string;
  adhdExperience: string;
}

interface CertificationFormData {
  professionalLicense: FileUpload[];
  educationalCertificates: FileUpload[];
  additionalCertifications: FileUpload[];
  referenceFirstName: string;
  referenceLastName: string;
  referenceProfessionalTitle: string;
  referencePhoneNumber: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function TherapistVerificationPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const router = useRouter();

  // Calculate max birth date (21 years ago)
  const today = new Date();
  const maxBirthDate = new Date(
    today.getFullYear() - 21,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  // Form data states
  const [personalData, setPersonalData] = useState<PersonalFormData>({
    phone: "",
    houseNumber: "",
    streetName: "",
    city: "",
    gender: "",
    dateOfBirth: "",
  });

  const [professionalData, setProfessionalData] =
    useState<ProfessionalFormData>({
      licenseNumber: "",
      primarySpecialty: "",
      yearsOfExperience: "",
      highestEducation: "",
      institution: "",
      adhdExperience: "",
    });

  const [certificationData, setCertificationData] =
    useState<CertificationFormData>({
      professionalLicense: [],
      educationalCertificates: [],
      additionalCertifications: [],
      referenceFirstName: "",
      referenceLastName: "",
      referenceProfessionalTitle: "",
      referencePhoneNumber: "",
    });

  const [agreements, setAgreements] = useState({
    backgroundCheck: false,
    termsAndPrivacy: false,
    accurateInfo: false,
  });

  const steps = [
    { title: "General details", description: "Personal information" },
    { title: "Professional details", description: "Professional qualifications" },
    { title: "Certifications", description: "Upload documents" },
    { title: "Review & Submit", description: "Final verification" },
  ];

  const specialties = [
    "ADHD Specialist",
    "Child Psychology",
    "Cognitive Behavioral Therapy",
    "Family Therapy",
    "Behavioral Therapy",
    "Clinical Psychology",
    "Counseling Psychology",
    "Other",
  ];

  const experienceOptions = [
    "0-1 years",
    "0-2 years",
    "2-5 years",
    "5-10 years",
    "10+ years",
  ];

  const educationOptions = [
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "PhD",
    "Other",
  ];

  // Validation functions
  const validatePhoneNumber = (phone: string): string => {
    const phoneRegex = /^\d{10}$/;
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateDateOfBirth = (date: string): string => {
    if (!date.trim()) {
      return "Date of birth is required";
    }

    const today = new Date();
    const birthDate = new Date(date);

    if (birthDate > today) {
      return "Date of birth cannot be in the future";
    }

    // Additional safeguard (though the input max should prevent this)
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      if (age - 1 < 21) {
        return "Therapist must be at least 21 years old";
      }
    } else {
      if (age < 21) {
        return "Therapist must be at least 21 years old";
      }
    }

    return "";
  };

  const validateName = (name: string, fieldName: string): string => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }
    if (!nameRegex.test(name.trim())) {
      return `${fieldName} should only contain letters and spaces`;
    }
    return "";
  };

  const validateAddress = (field: string, fieldName: string): string => {
    if (!field.trim()) {
      return `${fieldName} is required`;
    }
    if (field.trim().length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }
    return "";
  };

  const validateLicenseNumber = (license: string): string => {
    const licenseRegex = /^[A-Za-z0-9]+$/;
    if (license.trim() && license.trim().length < 3) {
      return "License number must be at least 3 characters long";
    }
    if (license.trim() && !licenseRegex.test(license.trim())) {
      return "License number should only contain letters and numbers";
    }
    return "";
  };

  const validateInstitution = (institution: string): string => {
    if (!institution.trim()) {
      return "Institution name is required";
    }
    if (institution.trim().length < 3) {
      return "Institution name must be at least 3 characters long";
    }
    return "";
  };

  const validateFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  };

  const validateFileType = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    return allowedTypes.includes(file.type);
  };

  const handleFileUpload = async (
    category: keyof Pick<
      CertificationFormData,
      | "professionalLicense"
      | "educationalCertificates"
      | "additionalCertifications"
    >,
    files: FileList | null
  ) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (!validateFileType(file)) {
        errors.push(
          `${file.name}: Only PDF, JPG, JPEG, and PNG files are allowed`
        );
        return;
      }

      if (!validateFileSize(file)) {
        errors.push(`${file.name}: File size must be less than 10MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        [category]: errors.join(", "),
      }));
      return;
    }

    if (validFiles.length === 0) return;

    // Clear any previous errors
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[category];
      return newErrors;
    });

    try {
      // Map category names to API values
      const categoryMap = {
        professionalLicense: "PROFESSIONAL_LICENSE",
        educationalCertificates: "EDUCATIONAL_CERTIFICATE",
        additionalCertifications: "ADDITIONAL_CERTIFICATION",
      };

      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("category", categoryMap[category]);

      const response = await fetch("/api/therapist/verification/documents", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setValidationErrors((prev) => ({
          ...prev,
          [category]: result.error || "Failed to upload files",
        }));
        return;
      }

      // Update state with successfully uploaded files
      const uploadedFiles: FileUpload[] = result.documents.map((doc: any) => ({
        name: doc.originalName,
        size: doc.fileSize,
        type: doc.mimeType,
        id: doc.id, // Store the document ID for potential deletion
      }));

      setCertificationData((prev) => ({
        ...prev,
        [category]: [...prev[category], ...uploadedFiles],
      }));
    } catch (error) {
      console.error("File upload error:", error);
      setValidationErrors((prev) => ({
        ...prev,
        [category]: "Failed to upload files. Please try again.",
      }));
    }
  };

  const removeFile = async (
    category: keyof Pick<
      CertificationFormData,
      | "professionalLicense"
      | "educationalCertificates"
      | "additionalCertifications"
    >,
    index: number
  ) => {
    const file = certificationData[category][index];
    
    // If file has an ID, it was uploaded to the server and needs to be deleted
    if (file.id) {
      try {
        const response = await fetch(`/api/therapist/verification/documents/${file.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const result = await response.json();
          console.error("Failed to delete file:", result.error);
          // Continue with local removal even if API deletion fails
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        // Continue with local removal even if API deletion fails
      }
    }

    // Remove from local state
    setCertificationData((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const validatePersonalForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate phone
    const phoneError = validatePhoneNumber(personalData.phone);
    if (phoneError) errors.phone = phoneError;

    // Validate date of birth
    const dobError = validateDateOfBirth(personalData.dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;

    // Validate address fields
    const houseError = validateAddress(
      personalData.houseNumber,
      "House number"
    );
    if (houseError) errors.houseNumber = houseError;

    const streetError = validateAddress(personalData.streetName, "Street name");
    if (streetError) errors.streetName = streetError;

    const cityError = validateAddress(personalData.city, "City");
    if (cityError) errors.city = cityError;

    // Validate gender
    if (!personalData.gender) {
      errors.gender = "Gender selection is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfessionalForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate license number
    const licenseError = validateLicenseNumber(professionalData.licenseNumber);
    if (licenseError) errors.licenseNumber = licenseError;

    // Validate institution
    const institutionError = validateInstitution(professionalData.institution);
    if (institutionError) errors.institution = institutionError;

    // Validate required dropdowns
    if (!professionalData.primarySpecialty) {
      errors.primarySpecialty = "Primary specialty is required";
    }

    if (!professionalData.yearsOfExperience) {
      errors.yearsOfExperience = "Years of experience is required";
    }

    if (!professionalData.highestEducation) {
      errors.highestEducation = "Highest education is required";
    }

    // ADHD experience is optional, but if provided, should have minimum length
    if (
      professionalData.adhdExperience &&
      professionalData.adhdExperience.trim().length > 0 &&
      professionalData.adhdExperience.trim().length < 10
    ) {
      errors.adhdExperience =
        "ADHD experience description should be at least 10 characters if provided";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCertificationForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate file uploads
    if (certificationData.professionalLicense.length === 0) {
      errors.professionalLicense =
        "At least one professional license document is required";
    }

    if (certificationData.educationalCertificates.length === 0) {
      errors.educationalCertificates =
        "At least one educational certificate is required";
    }

    // Validate reference information
    const firstNameError = validateName(
      certificationData.referenceFirstName,
      "Reference first name"
    );
    if (firstNameError) errors.referenceFirstName = firstNameError;

    const lastNameError = validateName(
      certificationData.referenceLastName,
      "Reference last name"
    );
    if (lastNameError) errors.referenceLastName = lastNameError;

    if (!certificationData.referenceProfessionalTitle.trim()) {
      errors.referenceProfessionalTitle =
        "Reference professional title is required";
    } else if (certificationData.referenceProfessionalTitle.trim().length < 3) {
      errors.referenceProfessionalTitle =
        "Professional title must be at least 3 characters long";
    }

    const referencePhoneError = validatePhoneNumber(
      certificationData.referencePhoneNumber
    );
    if (referencePhoneError) errors.referencePhoneNumber = referencePhoneError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError("");

    if (currentStep === 1 && !validatePersonalForm()) {
      setError("Please fix the validation errors before continuing.");
      return;
    }

    if (currentStep === 2 && !validateProfessionalForm()) {
      setError("Please fix the validation errors before continuing.");
      return;
    }

    if (currentStep === 3 && !validateCertificationForm()) {
      setError("Please fix the validation errors before continuing.");
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      setValidationErrors({});
    }
  };

  const handleSubmit = async () => {
    if (
      !agreements.backgroundCheck ||
      !agreements.termsAndPrivacy ||
      !agreements.accurateInfo
    ) {
      setError("Please accept all terms and agreements.");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the data for API submission
      const submissionData = {
        personalInfo: {
          phone: personalData.phone,
          houseNumber: personalData.houseNumber,
          streetName: personalData.streetName,
          city: personalData.city,
          gender: personalData.gender.toUpperCase(),
          dateOfBirth: personalData.dateOfBirth,
        },
        professionalInfo: {
          licenseNumber: professionalData.licenseNumber,
          primarySpecialty: professionalData.primarySpecialty,
          yearsOfExperience: professionalData.yearsOfExperience,
          highestEducation: professionalData.highestEducation,
          institution: professionalData.institution,
          adhdExperience: professionalData.adhdExperience,
        },
        referenceInfo: {
          firstName: certificationData.referenceFirstName,
          lastName: certificationData.referenceLastName,
          professionalTitle: certificationData.referenceProfessionalTitle,
          phoneNumber: certificationData.referencePhoneNumber,
        },
        agreements: {
          backgroundCheck: agreements.backgroundCheck,
          termsAndPrivacy: agreements.termsAndPrivacy,
          accurateInfo: agreements.accurateInfo,
        },
      };

      const response = await fetch("/api/therapist/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Handle validation errors
          const fieldErrors: ValidationErrors = {};
          result.details.forEach((error: any) => {
            const fieldPath = error.path.join(".");
            fieldErrors[fieldPath] = error.message;
          });
          setValidationErrors(fieldErrors);
          setError("Please fix the validation errors before continuing.");
        } else {
          setError(result.error || "Failed to submit verification.");
        }
        return;
      }

      // Success - redirect to success page or dashboard
      router.push("/therapist/verification/success");
    } catch (err) {
      console.error("Verification submission error:", err);
      setError("Failed to submit verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone number input to only allow digits
  const handlePhoneChange = (
    value: string,
    field: "phone" | "referencePhoneNumber"
  ) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

    if (field === "phone") {
      setPersonalData((prev) => ({ ...prev, phone: digitsOnly }));
      // Clear validation error when user starts typing
      if (validationErrors.phone) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
    } else {
      setCertificationData((prev) => ({
        ...prev,
        referencePhoneNumber: digitsOnly,
      }));
      if (validationErrors.referencePhoneNumber) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.referencePhoneNumber;
          return newErrors;
        });
      }
    }
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

  const renderPersonalForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="Enter your mobile number"
              value={personalData.phone}
              onChange={(e) => handlePhoneChange(e.target.value, "phone")}
              className={`mt-1 ${
                validationErrors.phone ? "border-destructive" : ""
              }`}
              maxLength={10}
            />
            {validationErrors.phone && (
              <p className="text-destructive text-xs mt-1">
                {validationErrors.phone}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Address</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="House No."
                  value={personalData.houseNumber}
                  onChange={(e) => {
                    setPersonalData((prev) => ({
                      ...prev,
                      houseNumber: e.target.value,
                    }));
                    clearValidationError("houseNumber");
                  }}
                  className={
                    validationErrors.houseNumber ? "border-destructive" : ""
                  }
                />
                {validationErrors.houseNumber && (
                  <p className="text-destructive text-xs mt-1">
                    {validationErrors.houseNumber}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Street name"
                  value={personalData.streetName}
                  onChange={(e) => {
                    setPersonalData((prev) => ({
                      ...prev,
                      streetName: e.target.value,
                    }));
                    clearValidationError("streetName");
                  }}
                  className={
                    validationErrors.streetName ? "border-destructive" : ""
                  }
                />
                {validationErrors.streetName && (
                  <p className="text-destructive text-xs mt-1">
                    {validationErrors.streetName}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <Input
                placeholder="City"
                value={personalData.city}
                onChange={(e) => {
                  setPersonalData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }));
                  clearValidationError("city");
                }}
                className={validationErrors.city ? "border-destructive" : ""}
              />
              {validationErrors.city && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.city}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender" className="text-sm font-medium">
                Gender *
              </Label>
              <Select
                value={personalData.gender}
                onValueChange={(value) => {
                  setPersonalData((prev) => ({ ...prev, gender: value }));
                  clearValidationError("gender");
                }}
              >
                <SelectTrigger
                  className={`mt-1 ${
                    validationErrors.gender ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select gender">
                    {personalData.gender && (
                      personalData.gender === "male" ? "Male" :
                      personalData.gender === "female" ? "Female" :
                      personalData.gender === "prefer-not-to-say" ? "Prefer not to say" :
                      personalData.gender
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.gender && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.gender}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={personalData.dateOfBirth}
                onChange={(e) => {
                  setPersonalData((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }));
                  clearValidationError("dateOfBirth");
                }}
                className={`mt-1 ${
                  validationErrors.dateOfBirth ? "border-destructive" : ""
                }`}
                max={maxBirthDate}
              />
              {validationErrors.dateOfBirth && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.dateOfBirth}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-primary">
          Professional Information
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Complete your professional profile to begin the verification process.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licenseNumber" className="text-sm font-medium">
                License Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="licenseNumber"
                placeholder="Enter license number"
                value={professionalData.licenseNumber}
                onChange={(e) => {
                  setProfessionalData((prev) => ({
                    ...prev,
                    licenseNumber: e.target.value,
                  }));
                  clearValidationError("licenseNumber");
                }}
                className={`mt-1 ${
                  validationErrors.licenseNumber ? "border-destructive" : ""
                }`}
              />
              {validationErrors.licenseNumber && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.licenseNumber}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="primarySpecialty" className="text-sm font-medium">
                Primary Specialty <span className="text-destructive">*</span>
              </Label>
              <Select
                value={professionalData.primarySpecialty}
                onValueChange={(value) => {
                  setProfessionalData((prev) => ({
                    ...prev,
                    primarySpecialty: value,
                  }));
                  clearValidationError("primarySpecialty");
                }}
              >
                <SelectTrigger
                  className={`mt-1 ${
                    validationErrors.primarySpecialty
                      ? "border-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem
                      key={specialty}
                      value={specialty.toLowerCase().replace(/\s+/g, "-")}
                    >
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.primarySpecialty && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.primarySpecialty}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="yearsOfExperience"
                className="text-sm font-medium"
              >
                Years of Experience <span className="text-destructive">*</span>
              </Label>
              <Select
                value={professionalData.yearsOfExperience}
                onValueChange={(value) => {
                  setProfessionalData((prev) => ({
                    ...prev,
                    yearsOfExperience: value,
                  }));
                  clearValidationError("yearsOfExperience");
                }}
              >
                <SelectTrigger
                  className={`mt-1 ${
                    validationErrors.yearsOfExperience
                      ? "border-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select Experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option.toLowerCase().replace(/\s+/g, "-")}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.yearsOfExperience && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.yearsOfExperience}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="highestEducation" className="text-sm font-medium">
                Highest Education <span className="text-destructive">*</span>
              </Label>
              <Select
                value={professionalData.highestEducation}
                onValueChange={(value) => {
                  setProfessionalData((prev) => ({
                    ...prev,
                    highestEducation: value,
                  }));
                  clearValidationError("highestEducation");
                }}
              >
                <SelectTrigger
                  className={`mt-1 ${
                    validationErrors.highestEducation
                      ? "border-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select Education" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option.toLowerCase().replace(/\s+/g, "-")}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.highestEducation && (
                <p className="text-destructive text-xs mt-1">
                  {validationErrors.highestEducation}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="institution" className="text-sm font-medium">
              Institution <span className="text-destructive">*</span>
            </Label>
            <Input
              id="institution"
              placeholder="University/College name"
              value={professionalData.institution}
              onChange={(e) => {
                setProfessionalData((prev) => ({
                  ...prev,
                  institution: e.target.value,
                }));
                clearValidationError("institution");
              }}
              className={`mt-1 ${
                validationErrors.institution ? "border-destructive" : ""
              }`}
            />
            {validationErrors.institution && (
              <p className="text-destructive text-xs mt-1">
                {validationErrors.institution}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="adhdExperience" className="text-sm font-medium">
              ADHD-Specific Experience
            </Label>
            <Textarea
              id="adhdExperience"
              placeholder="Describe your experience working with ADHD patients..."
              value={professionalData.adhdExperience}
              onChange={(e) => {
                setProfessionalData((prev) => ({
                  ...prev,
                  adhdExperience: e.target.value,
                }));
                clearValidationError("adhdExperience");
              }}
              className={`mt-1 min-h-[120px] ${
                validationErrors.adhdExperience ? "border-destructive" : ""
              }`}
            />
            {validationErrors.adhdExperience && (
              <p className="text-destructive text-xs mt-1">
                {validationErrors.adhdExperience}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="backgroundCheck"
              checked={agreements.backgroundCheck}
              onCheckedChange={(checked) =>
                setAgreements((prev) => ({
                  ...prev,
                  backgroundCheck: checked === true,
                }))
              }
            />
            <Label htmlFor="backgroundCheck" className="text-sm">
              I consent to background check and credential verification
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const FileUploadArea = ({
    category,
    title,
    description,
    files,
  }: {
    category: keyof Pick<
      CertificationFormData,
      | "professionalLicense"
      | "educationalCertificates"
      | "additionalCertifications"
    >;
    title: string;
    description?: string;
    files: FileUpload[];
  }) => (
    <div>
      <Label className="text-sm font-medium block mb-2">
        {title}{" "}
        {(category === "professionalLicense" ||
          category === "educationalCertificates") && (
          <span className="text-destructive">*</span>
        )}
      </Label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors relative ${
          validationErrors[category] ? "border-destructive" : "border-muted"
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-primary" />
          <div>
            <span className="text-primary font-medium cursor-pointer">
              Click to upload
            </span>
            <span className="text-muted-foreground"> or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {description || "PDF, JPG, PNG up to 10MB each"}
          </p>
        </div>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(category, e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {validationErrors[category] && (
        <p className="text-destructive text-xs mt-1">
          {validationErrors[category]}
        </p>
      )}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-blue-50 rounded-md"
            >
              <div className="flex items-center space-x-2 flex-1">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {file.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Open download link
                      window.open(`/api/therapist/verification/documents/${file.id}/download`, '_blank');
                    }}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    title="Download file"
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(category, index)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCertificationForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-primary">
          Certifications & Documents
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload your professional certifications and required documents.
        </p>

        <div className="space-y-6">
          <FileUploadArea
            category="professionalLicense"
            title="Professional License"
            files={certificationData.professionalLicense}
          />

          <FileUploadArea
            category="educationalCertificates"
            title="Educational Certificates"
            files={certificationData.educationalCertificates}
          />

          <FileUploadArea
            category="additionalCertifications"
            title="Additional Certifications"
            description="ADHD specializations, continuing education, etc."
            files={certificationData.additionalCertifications}
          />

          <div>
            <h4 className="text-md font-semibold mb-4">
              Professional References
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="referenceFirstName"
                  className="text-sm font-medium"
                >
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referenceFirstName"
                  value={certificationData.referenceFirstName}
                  onChange={(e) => {
                    setCertificationData((prev) => ({
                      ...prev,
                      referenceFirstName: e.target.value,
                    }));
                    clearValidationError("referenceFirstName");
                  }}
                  className={`mt-1 ${
                    validationErrors.referenceFirstName
                      ? "border-destructive"
                      : ""
                  }`}
                />
                {validationErrors.referenceFirstName && (
                  <p className="text-destructive text-xs mt-1">
                    {validationErrors.referenceFirstName}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="referenceLastName"
                  className="text-sm font-medium"
                >
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referenceLastName"
                  value={certificationData.referenceLastName}
                  onChange={(e) => {
                    setCertificationData((prev) => ({
                      ...prev,
                      referenceLastName: e.target.value,
                    }));
                    clearValidationError("referenceLastName");
                  }}
                  className={`mt-1 ${
                    validationErrors.referenceLastName
                      ? "border-destructive"
                      : ""
                  }`}
                />
                {validationErrors.referenceLastName && (
                  <p className="text-destructive text-xs mt-1">
                    {validationErrors.referenceLastName}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label
                  htmlFor="referenceProfessionalTitle"
                  className="text-sm font-medium"
                >
                  Professional Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referenceProfessionalTitle"
                  value={certificationData.referenceProfessionalTitle}
                  onChange={(e) => {
                    setCertificationData((prev) => ({
                      ...prev,
                      referenceProfessionalTitle: e.target.value,
                    }));
                    clearValidationError("referenceProfessionalTitle");
                  }}
                  className={`mt-1 ${
                    validationErrors.referenceProfessionalTitle
                      ? "border-destructive"
                      : ""
                  }`}
                />
                {validationErrors.referenceProfessionalTitle && (
                  <p className="text-destructive text-xs mt-1">
                    {validationErrors.referenceProfessionalTitle}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="referencePhoneNumber"
                  className="text-sm font-medium"
                >
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referencePhoneNumber"
                  value={certificationData.referencePhoneNumber}
                  onChange={(e) =>
                    handlePhoneChange(e.target.value, "referencePhoneNumber")
                  }
                  className={`mt-1 ${
                    validationErrors.referencePhoneNumber
                      ? "border-destructive"
                      : ""
                  }`}
                  maxLength={10}
                />
                {validationErrors.referencePhoneNumber && (
                  <p className="text-destructive text-xs mt-1">
                    {validationErrors.referencePhoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-primary">
          Review & Submit
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review your information and submit for verification.
        </p>

        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Full Name:</span> {" "}
            {session?.user?.name || ""}
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
            {session?.user?.email || ""}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {personalData.phone}
              </div>
              <div>
                <span className="font-medium">Date of Birth:</span>{" "}
                {personalData.dateOfBirth}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Address:</span>{" "}
                {personalData.houseNumber} {personalData.streetName},{" "}
                {personalData.city}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-3">
              Professional Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">License Number:</span>{" "}
                {professionalData.licenseNumber}
              </div>
              <div>
                <span className="font-medium">License State:</span> 232
              </div>
              <div>
                <span className="font-medium">Primary Specialty:</span>{" "}
                {professionalData.primarySpecialty}
              </div>
              <div>
                <span className="font-medium">Years of Experience:</span>{" "}
                {professionalData.yearsOfExperience}
              </div>
              <div>
                <span className="font-medium">Education Level:</span>{" "}
                {professionalData.highestEducation}
              </div>
              <div>
                <span className="font-medium">Institution:</span>{" "}
                {professionalData.institution}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-3">
              Uploaded Documents
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Professional License:</span>{" "}
                {certificationData.professionalLicense.length} file(s)
              </div>
              <div>
                <span className="font-medium">Educational Certificates:</span>{" "}
                {certificationData.educationalCertificates.length} file(s)
              </div>
              <div>
                <span className="font-medium">Additional Certifications:</span>{" "}
                {certificationData.additionalCertifications.length} file(s)
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="termsAndPrivacy"
                checked={agreements.termsAndPrivacy}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({
                    ...prev,
                    termsAndPrivacy: checked === true,
                  }))
                }
              />
              <Label htmlFor="termsAndPrivacy" className="text-sm">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="backgroundCheckFinal"
                checked={agreements.backgroundCheck}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({
                    ...prev,
                    backgroundCheck: checked === true,
                  }))
                }
              />
              <Label htmlFor="backgroundCheckFinal" className="text-sm">
                I consent to a background check and verification of my
                credentials
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accurateInfo"
                checked={agreements.accurateInfo}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({
                    ...prev,
                    accurateInfo: checked === true,
                  }))
                }
              />
              <Label htmlFor="accurateInfo" className="text-sm">
                I certify that all information provided is accurate and complete
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalForm();
      case 2:
        return renderProfessionalForm();
      case 3:
        return renderCertificationForm();
      case 4:
        return renderReviewForm();
      default:
        return renderPersonalForm();
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
              Therapist Verification
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to begin serving patients
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <Stepper
                steps={steps}
                currentStep={currentStep}
                className="mb-6"
              />
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {renderCurrentStep()}

              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={handleNext}>Continue</Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isLoading ||
                      !agreements.backgroundCheck ||
                      !agreements.termsAndPrivacy ||
                      !agreements.accurateInfo
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? "Submitting..." : "Submit for Verification"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
