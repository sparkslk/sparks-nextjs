/**
 * API: Send a new message
 * 
 * POST /api/chat/send
 * 
 * Body: { conversationId?, receiverId, content, patientId? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getOrCreateConversation } from '@/lib/chat-access';
import { encryptMessage } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, receiverId, content, patientId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { success: false, error: 'Missing receiverId' },
        { status: 400 }
      );
    }

    const senderId = session.user.id;

    // Get or create conversation
    const conversation = conversationId
      ? await prisma.conversation.findUnique({ where: { id: conversationId } })
      : await getOrCreateConversation(senderId, receiverId, patientId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or could not be created' },
        { status: 404 }
      );
    }

    // If no content provided, just return the conversation (used for creating empty conversations)
    if (!content || content.trim() === '') {
      return NextResponse.json({
        success: true,
        conversation: {
          id: conversation.id,
          therapistId: conversation.therapistId,
          participantId: conversation.participantId,
          patientId: conversation.patientId,
          participantType: conversation.participantType,
        },
      });
    }

    // Check if user is part of this conversation
    const therapist = await prisma.therapist.findFirst({
      where: { 
        id: conversation.therapistId,
      },
      select: { userId: true }
    });
    
    const isTherapistInConv = therapist && therapist.userId === senderId;
    const isParticipant = conversation.participantId === senderId;
    const canSend = isTherapistInConv || isParticipant;

    if (!canSend) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to send messages in this conversation' },
        { status: 403 }
      );
    }

    // Determine actual receiver userId (not therapist record ID)
    let actualReceiverId = receiverId;
    if (isParticipant && therapist) {
      // Parent/Patient sending to therapist - use therapist's userId
      actualReceiverId = therapist.userId;
    } else if (isTherapistInConv) {
      // Therapist sending to parent/patient - use conversation's participantId
      actualReceiverId = conversation.participantId;
    }

    // Encrypt the message
    const encryptedContent = encryptMessage(content);

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId: actualReceiverId,
        encryptedContent,
        isRead: false,
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content, // Return decrypted content
        isRead: message.isRead,
        readAt: message.readAt,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
