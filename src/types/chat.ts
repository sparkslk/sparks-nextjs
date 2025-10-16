/**
 * Chat System Type Definitions
 * 
 * These types define the structure of chat messages and conversations
 * for the encrypted in-app messaging system.
 */

export type ConversationType = 'PARENT' | 'PATIENT';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string; // Decrypted content (not stored in DB)
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt?: Date; // Optional as some DB models may not have it
}

export interface Conversation {
  id: string;
  therapistId: string;
  participantId: string;
  participantType: ConversationType;
  patientId: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt?: Date; // Optional as some DB models may not have it
  messages?: Message[];
  // Additional fields for display
  participantName?: string;
  participantAvatar?: string | null;
  unreadCount?: number;
  isOnline?: boolean;
}

export interface ConversationWithDetails extends Conversation {
  therapistName: string;
  therapistAvatar?: string | null;
  participantName: string;
  participantAvatar?: string | null;
  patientName?: string; // For parent conversations (first patient for backward compatibility)
  patientNames?: string[]; // All patient names for parent conversations
  lastMessage?: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  conversationId?: string; // Optional - will be created if not exists
  receiverId: string;
  content: string;
  participantType?: ConversationType; // Required for new conversations
  patientId?: string; // Required if participantType is PARENT
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  conversationId?: string;
  error?: string;
}

export interface GetConversationsResponse {
  success: boolean;
  conversations?: ConversationWithDetails[];
  error?: string;
}

export interface GetMessagesResponse {
  success: boolean;
  messages?: Message[];
  conversation?: Conversation;
  error?: string;
}

export interface MarkAsReadRequest {
  messageIds: string[];
}

export interface MarkAsReadResponse {
  success: boolean;
  updatedCount?: number;
  error?: string;
}

// For real-time updates
export interface MessageEvent {
  type: 'new_message' | 'message_read' | 'typing' | 'online_status';
  conversationId?: string;
  message?: Message;
  userId?: string;
  isOnline?: boolean;
}
