"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, Send, Paperclip, Smile, Clock, CheckCheck, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getConversations, sendMessage, getMessages, startMessagePolling } from "@/lib/chat-api";
import type { ConversationWithDetails, Message } from "@/types/chat";

export default function ParentMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      
      // Start polling for new messages
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
      
      stopPollingRef.current = startMessagePolling(
        selectedConversation.id,
        (result) => {
          if (result.success && result.messages) {
            setMessages(result.messages);
            scrollToBottom();
          }
        },
        3000 // Poll every 3 seconds
      );
    }
    
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    };
  }, [selectedConversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getConversations();
    
    if (result.success && result.conversations) {
      setConversations(result.conversations);
      if (result.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(result.conversations[0]);
      }
    } else {
      setError(result.error || "Failed to load conversations");
    }
    
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const result = await getMessages(conversationId);
    
    if (result.success && result.messages) {
      setMessages(result.messages);
    } else {
      setError(result.error || "Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    
    setSending(true);
    setError(null);
    
    // Find therapist user ID from conversation
    const result = await sendMessage({
      conversationId: selectedConversation.id,
      receiverId: selectedConversation.therapistId, // This needs to be therapist's userId
      content: newMessage.trim(),
    });
    
    if (result.success && result.message) {
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, result.message!]);
      setNewMessage("");
      scrollToBottom();
      
      // Reload conversations to update last message
      loadConversations();
    } else {
      setError(result.error || "Failed to send message");
    }
    
    setSending(false);
  };

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read locally
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.patientName && conv.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timestamp: Date | string) => {
    if (!mounted) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "00:00";
    }
  };

  const formatDate = (timestamp: Date | string) => {
    if (!mounted) return "";
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return "";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isMyMessage = (message: Message) => {
    return message.senderId === session?.user?.id;
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8159A8] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  font-inter text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-1">Messages</h1>
          <p className="text-muted-foreground text-base font-medium">Communicate with your child&#39;s therapist</p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-sm bg-card border border-border rounded-lg">
              <CardHeader className="bg-card border-b border-border pb-4 rounded-t-lg">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">Conversations</CardTitle>
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)} unread
                  </Badge>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search therapist or child..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground border-border"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-120px)] overflow-y-auto bg-card rounded-b-lg">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={cn(
                        "p-4 cursor-pointer border-b border-border hover:bg-muted transition-colors",
                        selectedConversation?.id === conversation.id && "bg-muted border-l-4 border-l-primary"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.therapistAvatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(conversation.therapistName)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-medium text-foreground truncate">
                                {conversation.therapistName}
                              </h3>
                              {conversation.patientName && (
                                <p className="text-xs text-muted-foreground">
                                  Child: {conversation.patientName}
                                </p>
                              )}
                            </div>
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                          {conversation.lastMessageAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(conversation.lastMessageAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full shadow-sm flex flex-col bg-card border border-border rounded-lg">
                {/* Chat Header */}
                <CardHeader className="bg-card border-b border-border flex-shrink-0 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.therapistAvatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(selectedConversation.therapistName)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {selectedConversation.therapistName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.patientName ? `Regarding: ${selectedConversation.patientName}` : 'Therapist'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-muted">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-background rounded-b-lg">
                  {/* Date Header */}
                  <div className="text-center mb-6">
                    <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full shadow-sm">
                      {messages.length > 0 ? formatDate(messages[0].createdAt) : 'Today'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end space-x-2",
                          isMyMessage(message) && "flex-row-reverse space-x-reverse"
                        )}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 mb-1 shadow-md">
                          <AvatarFallback className={cn(
                            "text-white text-sm font-medium",
                            isMyMessage(message) ? 'bg-green-500' : 'bg-primary'
                          )}>
                            {isMyMessage(message) ? 'ME' : 'DR'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Message Bubble */}
                        <div className={cn(
                          "flex-1 max-w-xs",
                          isMyMessage(message) && "flex justify-end"
                        )}>
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full shadow-sm flex flex-col bg-card border border-border rounded-lg">
                {/* Chat Header */}
                <CardHeader className="bg-card border-b border-border flex-shrink-0 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(selectedConversation.therapistName)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {selectedConversation.therapistName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Regarding: {selectedConversation.childName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-muted">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-background rounded-b-lg">
                  {/* Date Header */}
                  <div className="text-center mb-6">
                    <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full shadow-sm">Today</span>
                  </div>
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end space-x-2",
                          message.sender === 'parent' && "flex-row-reverse space-x-reverse"
                        )}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 mb-1 shadow-md">
                          <AvatarFallback className={cn(
                            "text-white text-sm font-medium",
                            message.sender === 'parent' ? 'bg-green-500' : 'bg-primary'
                          )}>
                            {message.sender === 'parent' ? 'ME' : 'DR'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Message Bubble */}
                        <div className={cn(
                          "flex-1 max-w-xs",
                          message.sender === 'parent' && "flex justify-end"
                        )}>
                          <div
                            className={cn(
                              "px-4 py-3 rounded-2xl relative border",
                              message.sender === 'parent'
                                ? 'bg-primary text-primary-foreground rounded-br-md border-primary/30 shadow-lg'
                                : 'bg-card text-foreground rounded-bl-md border-border shadow-sm'
                            )}
                          >
                            <p className="text-sm leading-relaxed font-sans">{message.text}</p>
                            <div className={cn(
                              "flex items-center justify-between mt-2 gap-2",
                              message.sender === 'parent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              <span className="text-xs font-mono">{formatTime(message.timestamp)}</span>
                              {message.sender === 'parent' && (
                                <div className="flex items-center">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="px-4 py-2 border-t border-border bg-card rounded-b-lg">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("That sounds perfect! ")}
                      className="text-xs border-primary/20 text-primary hover:bg-muted"
                    >
                      That sounds perfect!
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Can we schedule a call? ")}
                      className="text-xs border-primary/20 text-primary hover:bg-muted"
                    >
                      Can we schedule a call?
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("I have some concerns ")}
                      className="text-xs border-primary/20 text-primary hover:bg-muted"
                    >
                      I have some concerns
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Thank you! ")}
                      className="text-xs border-primary/20 text-primary hover:bg-muted"
                    >
                      Thank you!
                    </Button>
                  </div>
                </div>
                {/* Message Input */}
                <div className="border-t border-border p-4 bg-card flex-shrink-0 rounded-b-lg">
                  <div className="flex items-end space-x-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-muted">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-muted">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none font-sans bg-background text-foreground border-border"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-md"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full shadow-sm flex items-center justify-center bg-card border border-border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a therapist from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}