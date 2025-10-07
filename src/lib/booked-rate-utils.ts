// Utility function to manually set bookedRate until Prisma types are updated
// This function should be called after creating a therapy session

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function setBookedRateForSession(sessionId: string, therapistId: string) {
  try {
    // Get the current therapist rate
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { session_rate: true }
    });

    if (therapist) {
      // Update the session with the booked rate using raw SQL to bypass type issues
      await prisma.$executeRaw`
        UPDATE "TherapySession" 
        SET "bookedRate" = ${therapist.session_rate} 
        WHERE id = ${sessionId}
      `;
      
      console.log(`Set bookedRate to ${therapist.session_rate} for session ${sessionId}`);
    }
  } catch (error) {
    console.error('Error setting booked rate:', error);
  }
}

export async function getBookedRate(sessionId: string): Promise<number> {
  try {
    const result = await prisma.$queryRaw<Array<{ bookedRate: number }>>`
      SELECT "bookedRate" FROM "TherapySession" WHERE id = ${sessionId}
    `;
    
    return result[0]?.bookedRate || 0;
  } catch (error) {
    console.error('Error getting booked rate:', error);
    return 0;
  }
}
