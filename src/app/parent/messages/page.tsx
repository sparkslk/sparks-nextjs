"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, Clock, CheckCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  text: string;
  sender: "parent" | "therapist";
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  therapistName: string;
  childName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  avatar?: string;
  isOnline?: boolean;
}

export default function ParentMessagesPage() {
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
    setTimeout(() => {
      const conversationData: Conversation[] = [
        {
          id: "1",
          therapistName: "Dr. Nirmal Silva",
          childName: "Amal",
          lastMessage: "Excellent! I'd like to gradually introduce some new social interaction exercises next week. Would that work with your family schedule?",
          lastMessageTime: "2 hours ago",
          unreadCount: 2,
          isOnline: true,
          messages: [
            {
              id: "m1",
              text: "Good morning! I wanted to follow up on Amal's progress this week. He's been doing exceptionally well with his therapy sessions.",
              sender: "therapist",
              timestamp: "2024-01-15T09:15:00Z",
              isRead: true
            },
            {
              id: "m2",
              text: "Thank you, Doctor! Yes, we've noticed he's been more engaged during our evening conversations. His mood seems much more stable too.",
              sender: "parent",
              timestamp: "2024-01-15T09:18:00Z",
              isRead: true
            },
            {
              id: "m3",
              text: "That's wonderful to hear! I've also noticed improvement in his focus during our sessions. How has he been with completing his daily tasks?",
              sender: "therapist",
              timestamp: "2024-01-15T09:22:00Z",
              isRead: true
            },
            {
              id: "m4",
              text: "He's been completing most tasks on time. Sometimes needs a gentle reminder for his evening medication, but overall very good progress.",
              sender: "parent",
              timestamp: "2024-01-15T09:25:00Z",
              isRead: true
            },
            {
              id: "m5",
              text: "Excellent! I'd like to gradually introduce some new social interaction exercises next week. Would that work with your family schedule?",
              sender: "therapist",
              timestamp: "2024-01-15T09:28:00Z",
              isRead: false
            }
          ]
        },
        {
          id: "2",
          therapistName: "Dr. Kamala Wijesinghe",
          childName: "Sahan",
          lastMessage: "Let's schedule a follow-up session next week.",
          lastMessageTime: "1 day ago",
          unreadCount: 1,
          isOnline: false,
          messages: [
            {
              id: "m101",
              text: "Good afternoon Dr. Wijesinghe, I have some concerns about Sahan's medication.",
              sender: "parent",
              timestamp: "2024-01-14T15:00:00Z",
              isRead: true
            },
            {
              id: "m102",
              text: "I understand your concerns. Can you tell me more about what you've observed?",
              sender: "therapist",
              timestamp: "2024-01-14T15:30:00Z",
              isRead: true
            },
            {
              id: "m103",
              text: "Let's schedule a follow-up session next week.",
              sender: "therapist",
              timestamp: "2024-01-14T16:00:00Z",
              isRead: false
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
        sender: "parent",
        timestamp: new Date().toISOString(),
        isRead: true
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, messages: [...conv.messages, message], lastMessage: newMessage, lastMessageTime: "now", unreadCount: 0 }
            : conv
        )
      );

      setSelectedConversation(prev => 
        prev ? { ...prev, messages: [...prev.messages, message] } : null
      );

      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.childName.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your child&#39;s therapist</p>
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
                    placeholder="Search therapist or child..."
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
                            {getInitials(conversation.therapistName)}
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
                              {conversation.therapistName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Child: {conversation.childName}
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
                            {getInitials(selectedConversation.therapistName)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.therapistName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Regarding: {selectedConversation.childName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8] hover:bg-[#F5F3FB]">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8] hover:bg-[#F5F3FB]">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8] hover:bg-[#F5F3FB]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
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
                          message.sender === 'parent' && "flex-row-reverse space-x-reverse"
                        )}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 mb-1">
                          <AvatarFallback className={cn(
                            "text-white text-sm font-medium",
                            message.sender === 'parent' ? 'bg-green-500' : 'bg-[#8159A8]'
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
                              "px-4 py-3 rounded-2xl relative",
                              message.sender === 'parent'
                                ? 'bg-[#8159A8] text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md border border-gray-100 shadow-sm'
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <div className={cn(
                              "flex items-center justify-between mt-2 gap-2",
                              message.sender === 'parent' ? 'text-purple-100' : 'text-gray-400'
                            )}>
                              <span className="text-xs">{formatTime(message.timestamp)}</span>
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
                <div className="px-4 py-2 border-t border-gray-200 bg-white">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("That sounds perfect! ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      That sounds perfect!
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Can we schedule a call? ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      Can we schedule a call?
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("I have some concerns ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      I have some concerns
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewMessage("Thank you! ")}
                      className="text-xs border-[#8159A8]/20 text-[#8159A8] hover:bg-[#F5F3FB]"
                    >
                      Thank you!
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