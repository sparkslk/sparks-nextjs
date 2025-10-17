import { z } from 'zod';

// Validation schemas for therapist verification
export const personalInfoSchema = z.object({
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  houseNumber: z.string()
    .min(2, "House number must be at least 2 characters long"),
  streetName: z.string()
    .min(2, "Street name must be at least 2 characters long"),
  city: z.string()
    .min(2, "City must be at least 2 characters long"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    required_error: "Gender selection is required"
  }),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        actualAge = age - 1;
      }
      
      return actualAge >= 21;
    }, "Therapist must be at least 21 years old")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, "Date of birth cannot be in the future")
});

export const professionalInfoSchema = z.object({
  licenseNumber: z.string()
    .optional()
    .refine((license) => {
      if (!license || license.trim() === '') return true;
      return license.trim().length >= 3 && /^[A-Za-z0-9]+$/.test(license.trim());
    }, "License number must be at least 3 characters long and contain only letters and numbers"),
  primarySpecialty: z.string()
    .min(1, "Primary specialty is required"),
  yearsOfExperience: z.string()
    .min(1, "Years of experience is required"),
  highestEducation: z.string()
    .min(1, "Highest education is required"),
  institution: z.string()
    .min(3, "Institution name must be at least 3 characters long"),
  adhdExperience: z.string()
    .optional()
    .refine((exp) => {
      if (!exp || exp.trim() === '') return true;
      return exp.trim().length >= 10;
    }, "ADHD experience description should be at least 10 characters if provided")
});

export const referenceInfoSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters long")
    .regex(/^[a-zA-Z\s]+$/, "First name should only contain letters and spaces"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters long")
    .regex(/^[a-zA-Z\s]+$/, "Last name should only contain letters and spaces"),
  professionalTitle: z.string()
    .min(3, "Professional title must be at least 3 characters long"),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string()
    .email("Valid email is required")
    .optional()
});

export const agreementsSchema = z.object({
  backgroundCheck: z.boolean()
    .refine((val) => val === true, "Background check consent is required"),
  termsAndPrivacy: z.boolean()
    .refine((val) => val === true, "Terms and privacy agreement is required"),
  accurateInfo: z.boolean()
    .refine((val) => val === true, "Accurate information certification is required")
});

export const verificationSubmissionSchema = z.object({
  personalInfo: personalInfoSchema,
  professionalInfo: professionalInfoSchema,
  referenceInfo: referenceInfoSchema,
  agreements: agreementsSchema
});

// File validation
export const fileValidationSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB"),
  type: z.string().refine(
    (type) => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(type),
    "Only PDF, JPG, JPEG, and PNG files are allowed"
  )
});

export const documentCategorySchema = z.enum([
  'PROFESSIONAL_LICENSE',
  'EDUCATIONAL_CERTIFICATE', 
  'ADDITIONAL_CERTIFICATION'
]);

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type ReferenceInfo = z.infer<typeof referenceInfoSchema>;
export type Agreements = z.infer<typeof agreementsSchema>;
export type VerificationSubmission = z.infer<typeof verificationSubmissionSchema>;
export type FileValidation = z.infer<typeof fileValidationSchema>;
export type DocumentCategory = z.infer<typeof documentCategorySchema>;