-- Remove discontinueReason column from Medication table
ALTER TABLE "Medication" DROP COLUMN IF EXISTS "discontinueReason";
