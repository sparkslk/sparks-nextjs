"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import ParentNavigation from "../navigation/parentNavigation";

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
}

export default function ParentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
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
        timestamp: "2024-01-15T16:00:00Z",
        isRead: true
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, messages: [...conv.messages, message] }
            : conv
        )
      );

      // Update selected conversation
      if (selectedConversation) {
        setSelectedConversation(prev => 
          prev ? { ...prev, messages: [...prev.messages, message] } : null
        );
      }

      setNewMessage("");
    }
  };

  const formatTime = (timestamp: string) => {
    if (!mounted) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "00:00";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentNavigation />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-sm">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)] overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{conversation.therapistName}</h3>
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          className="text-xs px-2 py-1"
                          style={{ backgroundColor: '#8159A8', color: 'white' }}
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Child: {conversation.childName}</p>
                    <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conversation.lastMessageTime}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full shadow-sm flex flex-col">
                <CardHeader className="bg-white border-b border-gray-200 flex-shrink-0">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {selectedConversation.therapistName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Regarding: {selectedConversation.childName}</p>
                </CardHeader>
                
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: '#f5f3ff' }}>
                  {/* Date Header */}
                  <div className="text-center mb-6">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Today</span>
                  </div>
                  
                  <div className="space-y-6">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${message.sender === 'parent' ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          message.sender === 'parent' ? 'bg-green-500' : 'bg-purple-500'
                        }`}>
                          {message.sender === 'parent' ? 'ME' : 'NS'}
                        </div>
                        
                        {/* Message Content */}
                        <div className={`flex-1 max-w-xs ${message.sender === 'parent' ? 'flex justify-end' : ''}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.sender === 'parent'
                                ? 'bg-purple-500 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p className={`text-xs mt-2 ${
                              message.sender === 'parent' ? 'text-purple-100' : 'text-gray-400'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Reply Suggestions */}
                <div className="px-4 py-2 border-t border-gray-200 bg-white">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                      That sounds perfect!
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                      Can we schedule a call?
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                      I have some concerns
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                      Thank you!
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                  <div className="flex space-x-2">
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
                      style={{ backgroundColor: '#8159A8' }}
                      className="text-white hover:opacity-90 px-6"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full shadow-sm flex items-center justify-center">
                <div className="text-center text-gray-500">
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