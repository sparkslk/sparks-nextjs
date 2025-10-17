/**
 * Chat API Client Utilities
 * 
 * Frontend utilities for interacting with the encrypted chat system
 */

import type {
  SendMessageRequest,
  SendMessageResponse,
  GetConversationsResponse,
  GetMessagesResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
} from '@/types/chat';

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<GetConversationsResponse> {
  try {
    const response = await fetch('/api/chat/conversations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to fetch conversations' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(conversationId: string): Promise<GetMessagesResponse> {
  try {
    const response = await fetch(`/api/chat/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to fetch messages' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send a message
 */
export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  try {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to send message' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<MarkAsReadResponse> {
  try {
    const response = await fetch('/api/chat/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageIds } as MarkAsReadRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to mark messages as read' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Poll for new messages (simple polling approach)
 * In production, consider using WebSocket or Server-Sent Events
 */
export function startMessagePolling(
  conversationId: string,
  onNewMessage: (messages: GetMessagesResponse) => void,
  intervalMs: number = 5000
): () => void {
  let isPolling = true;
  let lastMessageCount = 0;

  const poll = async () => {
    if (!isPolling) return;

    const result = await getMessages(conversationId);
    if (result.success && result.messages) {
      if (result.messages.length > lastMessageCount) {
        lastMessageCount = result.messages.length;
        onNewMessage(result);
      }
    }

    if (isPolling) {
      setTimeout(poll, intervalMs);
    }
  };

  poll();

  // Return cleanup function
  return () => {
    isPolling = false;
  };
}
