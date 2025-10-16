"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip, Smile, Clock, CheckCheck, Check, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getConversations, sendMessage, getMessages, startMessagePolling } from "@/lib/chat-api";
import type { ConversationWithDetails, Message } from "@/types/chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TherapistMessagesPage() {
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
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (session?.user) {
      loadConversations();
    }
  }, [session]);

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
    if (!newMessage.trim() || !selectedConversation || sending || !session?.user) return;
    
    setSending(true);
    setError(null);
    
    const result = await sendMessage({
      conversationId: selectedConversation.id,
      receiverId: selectedConversation.participantId,
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
      prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
    );
  };

  const loadAvailableParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const response = await fetch('/api/chat/available-participants');
      const data = await response.json();
      
      if (data.success && data.participants) {
        setAvailableParticipants(data.participants);
      } else {
        console.error('Failed to load participants:', data.error);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
    setLoadingParticipants(false);
  };

  const handleStartNewChat = async (participant: any) => {
    setSending(true);
    setError(null);
    
    try {
      const result = await sendMessage({
        receiverId: participant.userId,
        content: "Hello! I'd like to discuss your progress.",
        patientId: participant.patientId,
      });
      
      if (result.success) {
        setShowNewChatDialog(false);
        // Reload conversations to show the new one
        await loadConversations();
        
        // Select the newly created conversation
        const newConversation = conversations.find(c => c.participantId === participant.userId);
        if (newConversation) {
          setSelectedConversation(newConversation);
        }
      } else {
        setError(result.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError("Failed to start conversation");
    }
    
    setSending(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#8159A8]">Messages</h1>
          <p className="text-gray-600">Communicate with patients and their families</p>
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
            <Card className="h-full shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Conversations</CardTitle>
                  <div className="flex items-center gap-2">
                    <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={loadAvailableParticipants}
                          className="text-[#8159A8] border-[#8159A8] hover:bg-[#8159A8]/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New Chat
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Start New Chat</DialogTitle>
                          <DialogDescription>
                            Select a patient or parent to start a conversation
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 max-h-[400px] overflow-y-auto">
                          {loadingParticipants ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8159A8] mx-auto"></div>
                              <p className="mt-2 text-gray-500">Loading participants...</p>
                            </div>
                          ) : availableParticipants.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>No participants available</p>
                              <p className="text-sm mt-2">You need assigned patients first</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {availableParticipants.map((participant, index) => (
                                <div
                                  key={`${participant.userId}-${index}`}
                                  onClick={() => handleStartNewChat(participant)}
                                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={participant.avatar} />
                                      <AvatarFallback className="bg-[#8159A8] text-white">
                                        {getInitials(participant.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-900">{participant.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {participant.type}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-500">
                                        Patient: {participant.patientName}
                                        {participant.relationship && ` (${participant.relationship})`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Badge variant="secondary" className="bg-[#8159A8] text-white">
                      {conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)} unread
                    </Badge>
                  </div>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients or parents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8]"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-120px)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={cn(
                        "p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors",
                        selectedConversation?.id === conversation.id && "bg-[#F5F3FB] border-l-4 border-l-[#8159A8]"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.participantAvatar} />
                            <AvatarFallback className="bg-[#8159A8] text-white">
                              {getInitials(conversation.participantName || 'User')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-medium text-gray-900 truncate">
                                {conversation.participantName || 'User'}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {conversation.participantType === 'PARENT' && conversation.patientName 
                                  ? `Parent of ${conversation.patientName}` 
                                  : "Patient"}
                              </p>
                            </div>
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <Badge className="bg-[#8159A8] text-white text-xs px-2 py-1">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mb-1">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          {conversation.lastMessageAt && (
                            <p className="text-xs text-gray-400">
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
              <Card className="h-full shadow-sm flex flex-col">
                {/* Chat Header */}
                <CardHeader className="bg-white border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.participantAvatar} />
                          <AvatarFallback className="bg-[#8159A8] text-white">
                            {getInitials(selectedConversation.participantName || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.participantName || 'User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.participantType === 'PARENT' && selectedConversation.patientName 
                            ? `Parent of ${selectedConversation.patientName}` 
                            : "Patient"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#F5F3FB]/30 to-white">
                  {/* Date Header */}
                  <div className="text-center mb-6">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
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
                        <Avatar className="h-8 w-8 mb-1">
                          <AvatarFallback className={cn(
                            "text-white text-sm font-medium",
                            isMyMessage(message) ? 'bg-[#8159A8]' : 'bg-blue-500'
                          )}>
                            {isMyMessage(message) ? 'DR' : 
                             selectedConversation.participantType === 'PARENT' ? 'P' : 'PT'}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Message Bubble */}
                        <div className={cn(
                          "flex-1 max-w-xs",
                          isMyMessage(message) && "flex justify-end"
                        )}>
                          <div
                            className={cn(
                              "px-4 py-3 rounded-2xl relative",
                              isMyMessage(message)
                                ? 'bg-[#F5F3FB] text-gray-900 rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md border border-gray-100 shadow-sm'
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className={cn(
                              "flex items-center justify-between mt-2 gap-2",
                              isMyMessage(message) ? 'text-gray-500' : 'text-gray-400'
                            )}>
                              <span className="text-xs">{formatTime(message.createdAt)}</span>
                              {isMyMessage(message) && (
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
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 border-t border-gray-200 bg-white">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Thank you for the update. ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      Thank you for the update
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Let's schedule a follow-up session. ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      Schedule follow-up
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Please continue with the current plan. ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      Continue current plan
                    </Button>
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                  <div className="flex items-end space-x-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8]/20 hover:bg-[#F5F3FB]">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8]/20 hover:bg-[#F5F3FB]">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full shadow-sm flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-[#F5F3FB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-[#8159A8]" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a patient or parent from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
