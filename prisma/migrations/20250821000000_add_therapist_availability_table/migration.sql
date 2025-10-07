-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "TherapistAvailability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceType" "RecurrenceType",
    "recurrenceDays" INTEGER[],
    "recurrenceEndDate" TIMESTAMP(3),
    "sessionDuration" INTEGER NOT NULL DEFAULT 60,
    "breakBetweenSessions" INTEGER NOT NULL DEFAULT 15,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rate" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TherapistAvailability_therapistId_idx" ON "TherapistAvailability"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistAvailability_dayOfWeek_idx" ON "TherapistAvailability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "TherapistAvailability_isActive_idx" ON "TherapistAvailability"("isActive");

-- CreateIndex
CREATE INDEX "TherapistAvailability_therapistId_dayOfWeek_isActive_idx" ON "TherapistAvailability"("therapistId", "dayOfWeek", "isActive");

-- AddForeignKey
ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
