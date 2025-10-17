-- AlterTable
ALTER TABLE "TherapistAvailability" DROP COLUMN "rate",
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;