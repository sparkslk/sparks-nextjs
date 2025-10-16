/**
 * Temporary Prisma types until client is regenerated
 * These will be replaced by generated types from @prisma/client
 */

export type ConversationType = 'PARENT' | 'PATIENT';

export interface Conversation {
  id: string;
  therapistId: string;
  participantId: string;
  participantType: ConversationType;
  patientId: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  encryptedContent: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}
