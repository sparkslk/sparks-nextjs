/**
 * API: Get messages for a specific conversation
 * 
 * GET /api/chat/conversation/[id]
 * 
 * Returns all messages in a conversation and marks them as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { canAccessConversation } from '@/lib/chat-access';
import { decryptMessage } from '@/lib/encryption';
import { UserRole } from '@prisma/client';
import type { Message } from '@/types/chat';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const conversationId = params.id;
    const userId = session.user.id;
    const userRole = session.user.role as UserRole;

    // Check if conversation exists
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this conversation
    const hasAccess = await canAccessConversation(userId, userRole, conversationId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all messages
    const rawMessages = await (prisma as any).message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // Decrypt messages
    const messages: Message[] = rawMessages.map((msg: any) => {
      try {
        return {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: decryptMessage(msg.encryptedContent),
          isRead: msg.isRead,
          readAt: msg.readAt,
          createdAt: msg.createdAt,
        };
      } catch (error) {
        console.error(`Error decrypting message ${msg.id}:`, error);
        return {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: '[Encrypted message]',
          isRead: msg.isRead,
          readAt: msg.readAt,
          createdAt: msg.createdAt,
        };
      }
    });

    // Mark messages as read for the current user
    await (prisma as any).message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
