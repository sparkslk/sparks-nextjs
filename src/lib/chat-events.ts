/**
 * Chat Event Emitter
 * 
 * Simple event system to notify components about chat updates
 * This allows the sidebar to update when messages are received
 */

type ChatEventType = 'message-received' | 'message-read' | 'unread-count-changed';
type ChatEventListener = (data?: any) => void;

class ChatEventEmitter {
  private listeners: Map<ChatEventType, Set<ChatEventListener>> = new Map();

  on(event: ChatEventType, listener: ChatEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: ChatEventType, listener: ChatEventListener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  emit(event: ChatEventType, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  // Helper to notify about new unread messages
  notifyUnreadCountChanged() {
    this.emit('unread-count-changed');
  }

  // Helper to notify about message received
  notifyMessageReceived(conversationId: string) {
    this.emit('message-received', { conversationId });
  }

  // Helper to notify about messages read
  notifyMessagesRead(conversationId: string) {
    this.emit('message-read', { conversationId });
  }
}

// Export singleton instance
export const chatEvents = new ChatEventEmitter();
