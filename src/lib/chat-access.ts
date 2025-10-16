/**
 * Chat Access Control Utilities
 * 
 * This module handles authorization for chat operations:
 * - Therapists can message all their patients and parents
 * - Parents/Patients can only message their assigned therapist
 */

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export interface ChatAccessResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a user can access a specific conversation
 */
export async function canAccessConversation(
  userId: string,
  userRole: UserRole,
  conversationId: string
): Promise<boolean> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        therapistId: true,
        participantId: true,
        participantType: true,
        patientId: true,
      },
    });

    if (!conversation) {
      return false;
    }

    // Therapist can access their own conversations
    if (userRole === UserRole.THERAPIST) {
      const therapist = await prisma.therapist.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (therapist && conversation.therapistId === therapist.id) {
        return true;
      }
    }

    // Parent or Patient can access if they are the participant
    if (
      (userRole === UserRole.PARENT_GUARDIAN || userRole === UserRole.NORMAL_USER) &&
      conversation.participantId === userId
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking conversation access:', error);
    return false;
  }
}

/**
 * Check if a user can send a message to a specific receiver
 */
export async function canSendMessage(
  senderId: string,
  senderRole: UserRole,
  receiverId: string,
  participantType?: string,
  patientId?: string
): Promise<boolean> {
  try {
    // Get sender and receiver info
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        include: {
          therapistProfile: true,
          parentGuardianRel: {
            include: {
              patient: {
                include: {
                  primaryTherapist: true,
                },
              },
            },
          },
          patientProfile: {
            include: {
              primaryTherapist: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        include: {
          therapistProfile: true,
        },
      }),
    ]);

    if (!sender || !receiver) {
      return false;
    }

    // Therapist sending message
    if (senderRole === UserRole.THERAPIST && sender.therapistProfile) {
      const therapistId = sender.therapistProfile.id;

      // Check if receiver is their patient or parent of their patient
      if (participantType === 'PARENT' && patientId) {
        const patient = await prisma.patient.findFirst({
          where: {
            id: patientId,
            primaryTherapistId: therapistId,
          },
          include: {
            parentGuardians: {
              where: { userId: receiverId },
            },
          },
        });

        if (patient && patient.parentGuardians.length > 0) {
          return true;
        }
      } else if (participantType === 'PATIENT') {
        const patient = await prisma.patient.findFirst({
          where: {
            userId: receiverId,
            primaryTherapistId: therapistId,
          },
        });

        if (patient) {
          return true;
        }
      }

      return false;
    }

    // Parent or Patient sending message - can only message their therapist
    if (senderRole === UserRole.PARENT_GUARDIAN || senderRole === UserRole.NORMAL_USER) {
      if (!receiver.therapistProfile) {
        return false;
      }

      const therapistId = receiver.therapistProfile.id;

      // Check if receiver is their assigned therapist
      if (sender.patientProfile) {
        if (sender.patientProfile.primaryTherapistId === therapistId) {
          return true;
        }
      }

      // Check if receiver is therapist of any of their children (for parents)
      if (sender.parentGuardianRel && sender.parentGuardianRel.length > 0) {
        const hasTherapist = sender.parentGuardianRel.some(
          (rel) => rel.patient.primaryTherapist?.id === therapistId
        );
        if (hasTherapist) {
          return true;
        }
      }

      return false;
    }

    return false;
  } catch (error) {
    console.error('Error checking message permission:', error);
    return false;
  }
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  patientId?: string
) {
  try {
    // Get both users to determine roles
    const user1 = await prisma.user.findUnique({
      where: { id: userId1 },
      select: { role: true },
    });

    const user2 = await prisma.user.findUnique({
      where: { id: userId2 },
      select: { role: true },
    });

    if (!user1 || !user2) {
      throw new Error('One or both users not found');
    }

    // Determine who is therapist and who is participant
    let therapistUserId: string;
    let participantUserId: string;
    let participantType: 'PARENT' | 'PATIENT';

    if (user1.role === UserRole.THERAPIST) {
      therapistUserId = userId1;
      participantUserId = userId2;
      participantType = user2.role === UserRole.PARENT_GUARDIAN ? 'PARENT' : 'PATIENT';
    } else if (user2.role === UserRole.THERAPIST) {
      therapistUserId = userId2;
      participantUserId = userId1;
      participantType = user1.role === UserRole.PARENT_GUARDIAN ? 'PARENT' : 'PATIENT';
    } else {
      throw new Error('No therapist found in conversation participants');
    }

    // Get therapist ID from user ID
    const therapist = await prisma.therapist.findUnique({
      where: { userId: therapistUserId },
      select: { id: true },
    });

    if (!therapist) {
      throw new Error('Therapist profile not found');
    }

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        therapistId: therapist.id,
        participantId: participantUserId,
        participantType: participantType,
      },
    });

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          therapistId: therapist.id,
          participantId: participantUserId,
          participantType: participantType,
          patientId: patientId || null,
        },
      });
    }

    return conversation;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
}
