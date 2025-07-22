"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Paperclip, Smile, Clock, CheckCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  text: string;
  sender: "therapist" | "patient" | "parent";
  timestamp: string;
  isRead: boolean;
  messageType?: "text" | "file" | "appointment";
  fileInfo?: {
    name: string;
    size: string;
    type: string;
  };
}

interface Conversation {
  id: string;
  patientName: string;
  parentName?: string;
  contactType: "patient" | "parent";
  patientId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: ChatMessage[];
  avatar?: string;
}

export default function TherapistMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Simulate loading conversations data
    setTimeout(() => {
      const conversationData: Conversation[] = [
        {
          id: "1",
          patientName: "Amal Perera",
          parentName: "Priya Perera",
          contactType: "parent",
          patientId: "P001",
          lastMessage: "Thank you for the session notes. Amal has been much better this week.",
          lastMessageTime: "2 hours ago",
          unreadCount: 2,
          isOnline: true,
          messages: [
            {
              id: "m1",
              text: "Good morning Dr. Silva. I wanted to update you on Amal's progress this week.",
              sender: "parent",
              timestamp: "2024-01-15T09:15:00Z",
              isRead: true
            },
            {
              id: "m2",
              text: "Good morning! I'm glad to hear from you. How has Amal been doing with his daily routines?",
              sender: "therapist",
              timestamp: "2024-01-15T09:18:00Z",
              isRead: true
            },
            {
              id: "m3",
              text: "He's been much more consistent with his morning routine. The visualization exercises we discussed are really helping him.",
              sender: "parent",
              timestamp: "2024-01-15T09:22:00Z",
              isRead: true
            },
            {
              id: "m4",
              text: "That's excellent progress! I'd like to introduce some new coping strategies in our next session. Are you available for a brief consultation this week?",
              sender: "therapist",
              timestamp: "2024-01-15T09:25:00Z",
              isRead: true
            },
            {
              id: "m5",
              text: "Thank you for the session notes. Amal has been much better this week.",
              sender: "parent",
              timestamp: "2024-01-15T14:28:00Z",
              isRead: false
            }
          ]
        },
        {
          id: "2",
          patientName: "Ravindi Fernando",
          contactType: "patient",
          patientId: "P002",
          lastMessage: "I've been practicing the breathing exercises daily as we discussed.",
          lastMessageTime: "5 hours ago",
          unreadCount: 1,
          isOnline: false,
          messages: [
            {
              id: "m101",
              text: "Hi Dr. Silva, I've been practicing the breathing exercises daily as we discussed.",
              sender: "patient",
              timestamp: "2024-01-15T11:00:00Z",
              isRead: false
            },
            {
              id: "m102",
              text: "That's wonderful to hear! How are you feeling during stressful situations now?",
              sender: "therapist",
              timestamp: "2024-01-15T11:30:00Z",
              isRead: true
            }
          ]
        },
        {
          id: "3",
          patientName: "Nimal Silva",
          parentName: "Kamala Silva",
          contactType: "parent",
          patientId: "P003",
          lastMessage: "Could we schedule an additional session this week?",
          lastMessageTime: "1 day ago",
          unreadCount: 0,
          isOnline: false,
          messages: [
            {
              id: "m201",
              text: "Good afternoon Dr. Silva. I have some concerns about Nimal's medication side effects.",
              sender: "parent",
              timestamp: "2024-01-14T15:00:00Z",
              isRead: true
            },
            {
              id: "m202",
              text: "I understand your concerns. Can you describe what specific side effects you've noticed?",
              sender: "therapist",
              timestamp: "2024-01-14T15:30:00Z",
              isRead: true
            },
            {
              id: "m203",
              text: "Could we schedule an additional session this week?",
              sender: "parent",
              timestamp: "2024-01-14T16:00:00Z",
              isRead: true
            }
          ]
        }
      ];

      setConversations(conversationData);
      if (conversationData.length > 0) {
        setSelectedConversation(conversationData[0]);
      }
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: ChatMessage = {
        id: `m${selectedConversation.messages.length + 1}`,
        text: newMessage,
        sender: "therapist",
        timestamp: new Date().toISOString(),
        isRead: true
      };

      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                messages: [...conv.messages, message],
                lastMessage: newMessage,
                lastMessageTime: "now",
                unreadCount: 0
              }
            : conv
        )
      );

      // Update selected conversation
      setSelectedConversation(prev => 
        prev ? { ...prev, messages: [...prev.messages, message] } : null
      );

      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.parentName && conv.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timestamp: string) => {
    if (!mounted) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "00:00";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  if (loading) {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-sm">
              <CardHeader className="bg-white border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Conversations</CardTitle>
                  <Badge variant="secondary" className="bg-[#8159A8] text-white">
                    {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
                  </Badge>
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
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      markAsRead(conversation.id);
                    }}
                    className={cn(
                      "p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors",
                      selectedConversation?.id === conversation.id && "bg-[#F5F3FB] border-l-4 border-l-[#8159A8]"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback className="bg-[#8159A8] text-white">
                            {getInitials(conversation.contactType === "parent" && conversation.parentName 
                              ? conversation.parentName 
                              : conversation.patientName)}
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
                              {conversation.contactType === "parent" && conversation.parentName 
                                ? conversation.parentName 
                                : conversation.patientName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {conversation.contactType === "parent" 
                                ? `Parent of ${conversation.patientName}` 
                                : "Patient"}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-[#8159A8] text-white text-xs px-2 py-1">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mb-1">{conversation.lastMessage}</p>
                        <p className="text-xs text-gray-400">{conversation.lastMessageTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback className="bg-[#8159A8] text-white">
                            {getInitials(selectedConversation.contactType === "parent" && selectedConversation.parentName 
                              ? selectedConversation.parentName 
                              : selectedConversation.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.contactType === "parent" && selectedConversation.parentName 
                            ? selectedConversation.parentName 
                            : selectedConversation.patientName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.contactType === "parent" 
                            ? `Parent of ${selectedConversation.patientName} • Patient ID: ${selectedConversation.patientId}` 
                            : `Patient • ID: ${selectedConversation.patientId}`}
                        </p>
                      </div>
                    </div>
                    {/* <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8] hover:bg-[#F5F3FB]">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8] hover:bg-[#F5F3FB]">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8] hover:bg-[#F5F3FB]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div> */}
                  </div>
                </CardHeader>
                
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#F5F3FB]/30 to-white">
                  {/* Date Header */}
                  <div className="text-center mb-6">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Today</span>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end space-x-2",
                          message.sender === 'therapist' && "flex-row-reverse space-x-reverse"
                        )}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 mb-1">
                          <AvatarFallback className={cn(
                            "text-white text-sm font-medium",
                            message.sender === 'therapist' ? 'bg-[#8159A8]' : 'bg-[#8159A8]'
                          )}>
                            {message.sender === 'therapist' ? 'DR' : 
                             message.sender === 'parent' ? 'P' : 'PT'}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Message Bubble */}
                        <div className={cn(
                          "flex-1 max-w-xs",
                          message.sender === 'therapist' && "flex justify-end"
                        )}>
                          <div
                            className={cn(
                              "px-4 py-3 rounded-2xl relative",
                              message.sender === 'therapist'
                                ? 'bg-[#F5F3FB] text-gray-900 rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md border border-gray-100 shadow-sm'
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <div className={cn(
                              "flex items-center justify-between mt-2 gap-2",
                              message.sender === 'therapist' ? 'text-purple-100' : 'text-gray-400'
                            )}>
                              <span className="text-xs">{formatTime(message.timestamp)}</span>
                              {message.sender === 'therapist' && (
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
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
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
