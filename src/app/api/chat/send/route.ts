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
import { getOrCreateConversation, canSendMessage } from '@/lib/chat-access';
import { encryptMessage } from '@/lib/encryption';
import { UserRole } from '@prisma/client';

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

    if (!receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const senderId = session.user.id;
    const senderRole = session.user.role as UserRole;

    // Get or create conversation
    const conversation = conversationId
      ? await (prisma as any).conversation.findUnique({ where: { id: conversationId } })
      : await getOrCreateConversation(senderId, receiverId, patientId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or could not be created' },
        { status: 404 }
      );
    }

    // Check if user is part of this conversation
    const isTherapistInConv = await prisma.therapist.findFirst({
      where: { 
        id: conversation.therapistId,
        userId: senderId 
      },
    });
    
    const isParticipant = conversation.participantId === senderId;
    const canSend = isTherapistInConv || isParticipant;

    if (!canSend) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to send messages in this conversation' },
        { status: 403 }
      );
    }

    // Encrypt the message
    const encryptedContent = encryptMessage(content);

    // Create message
    const message = await (prisma as any).message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        encryptedContent,
        isRead: false,
      },
    });

    // Update conversation's lastMessageAt
    await (prisma as any).conversation.update({
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
