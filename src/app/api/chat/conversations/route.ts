/**
 * API: Get all conversations for the authenticated user
 * 
 * GET /api/chat/conversations
 * 
 * Returns:
 * - For therapists: All conversations with their patients and parents
 * - For parents/patients: Only conversation with their assigned therapist
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { decryptMessage } from '@/lib/encryption';
import type { ConversationWithDetails } from '@/types/chat';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role as UserRole;

    let conversations: ConversationWithDetails[] = [];

    if (userRole === UserRole.THERAPIST) {
      // Get therapist's ID
      const therapist = await prisma.therapist.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!therapist) {
        return NextResponse.json(
          { success: false, error: 'Therapist profile not found' },
          { status: 404 }
        );
      }

      // Get all conversations for this therapist
      const rawConversations = await (prisma as any).conversation.findMany({
        where: { therapistId: therapist.id },
        include: {
          Message: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      // Get participant details and unread counts
      conversations = await Promise.all(
        rawConversations.map(async (conv: any) => {
          const participant = await prisma.user.findUnique({
            where: { id: conv.participantId },
            select: { id: true, name: true, image: true },
          });

          let patientName = undefined;
          let patientNames: string[] = [];
          
          if (conv.participantType === 'PARENT') {
            // Get all patients for this parent who have this therapist
            const parentGuardians = await prisma.parentGuardian.findMany({
              where: {
                userId: conv.participantId,
                patient: {
                  primaryTherapistId: therapist.id,
                },
              },
              include: {
                patient: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            });

            patientNames = parentGuardians.map(
              (pg) => `${pg.patient.firstName} ${pg.patient.lastName}`
            );
            
            // For backward compatibility, set patientName to first patient
            patientName = patientNames.length > 0 ? patientNames[0] : undefined;
          } else if (conv.patientId) {
            // Single patient (PATIENT type conversation)
            const patient = await prisma.patient.findUnique({
              where: { id: conv.patientId },
              select: { firstName: true, lastName: true },
            });
            patientName = patient ? `${patient.firstName} ${patient.lastName}` : undefined;
            patientNames = patientName ? [patientName] : [];
          }

          const unreadCount = await (prisma as any).message.count({
            where: {
              conversationId: conv.id,
              receiverId: userId,
              isRead: false,
            },
          });

          let lastMessage = undefined;
          if (conv.Message.length > 0) {
            try {
              lastMessage = decryptMessage(conv.Message[0].encryptedContent);
            } catch (error) {
              console.error('Error decrypting last message:', error);
              lastMessage = '[Encrypted message]';
            }
          }

          return {
            ...conv,
            therapistName: session.user.name || 'Therapist',
            therapistAvatar: session.user.image,
            participantName: participant?.name || 'Unknown',
            participantAvatar: participant?.image,
            patientName,
            patientNames, // Add array of all patient names
            lastMessage,
            unreadCount,
            isOnline: false, // TODO: Implement online status
          } as ConversationWithDetails;
        })
      );
    } else {
      // Parent or Patient - get their conversation with therapist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          patientProfile: {
            include: {
              primaryTherapist: {
                include: {
                  user: true,
                },
              },
            },
          },
          parentGuardianRel: {
            include: {
              patient: {
                include: {
                  primaryTherapist: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Get therapist(s) this user can chat with
      const therapists = new Set<string>();
      
      if (user.patientProfile?.primaryTherapist) {
        therapists.add(user.patientProfile.primaryTherapist.id);
      }
      
      user.parentGuardianRel.forEach((rel) => {
        if (rel.patient.primaryTherapist) {
          therapists.add(rel.patient.primaryTherapist.id);
        }
      });

      if (therapists.size === 0) {
        return NextResponse.json({
          success: true,
          conversations: [],
        });
      }

      // Get conversations with these therapists
      const rawConversations = await (prisma as any).conversation.findMany({
        where: {
          participantId: userId,
          therapistId: { in: Array.from(therapists) },
        },
        include: {
          Message: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      // Get therapist details
      conversations = await Promise.all(
        rawConversations.map(async (conv: any) => {
          const therapist = await prisma.therapist.findUnique({
            where: { id: conv.therapistId },
            include: { user: true },
          });

          let patientName = undefined;
          if (conv.participantType === 'PARENT' && conv.patientId) {
            const patient = await prisma.patient.findUnique({
              where: { id: conv.patientId },
              select: { firstName: true, lastName: true },
            });
            patientName = patient ? `${patient.firstName} ${patient.lastName}` : undefined;
          }

          const unreadCount = await (prisma as any).message.count({
            where: {
              conversationId: conv.id,
              receiverId: userId,
              isRead: false,
            },
          });

          let lastMessage = undefined;
          if (conv.Message.length > 0) {
            try {
              lastMessage = decryptMessage(conv.Message[0].encryptedContent);
            } catch (error) {
              console.error('Error decrypting last message:', error);
              lastMessage = '[Encrypted message]';
            }
          }

          return {
            ...conv,
            therapistName: therapist?.user.name || 'Therapist',
            therapistAvatar: therapist?.user.image,
            participantName: session.user.name || 'User',
            participantAvatar: session.user.image,
            patientName,
            lastMessage,
            unreadCount,
            isOnline: false, // TODO: Implement online status
          } as ConversationWithDetails;
        })
      );
    }

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
