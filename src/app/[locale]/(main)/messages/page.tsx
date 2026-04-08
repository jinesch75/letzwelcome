'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Textarea from '@/components/ui/Textarea';
import EmptyState from '@/components/ui/EmptyState';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

interface MessageGroup {
  date: string;
  messages: Message[];
}

export default function MessagesPage() {
  const t = useTranslations('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageGroup[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const currentUserId = useRef<string>(''); // Will be set from session

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Subscribe to message stream
  useEffect(() => {
    if (!selectedConversationId) return;

    // Close previous connection
    if (sseRef.current) {
      sseRef.current.close();
    }

    // Open new SSE connection
    sseRef.current = new EventSource(
      `/api/messages/stream?conversationId=${selectedConversationId}`
    );

    sseRef.current.addEventListener('message', (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        loadMessages(selectedConversationId);

        // Mark as read if it's not ours
        if (newMessage.senderId !== currentUserId.current) {
          markAsRead(newMessage.id);
        }
      } catch (err) {
        console.error('Failed to parse message event:', err);
      }
    });

    sseRef.current.addEventListener('error', () => {
      sseRef.current?.close();
    });

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [selectedConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to load conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
      if (data.currentUserId) {
        currentUserId.current = data.currentUserId;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();

      // Group messages by date
      const grouped = groupMessagesByDate(data.messages || []);
      setMessages(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  const groupMessagesByDate = (msgs: Message[]): MessageGroup[] => {
    const groups: { [key: string]: Message[] } = {};

    msgs.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationId || !messageInput.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content: messageInput,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessageInput('');
      loadMessages(selectedConversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    loadMessages(conversationId);
  };

  // Desktop layout: two panels
  if (!isMobile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left panel: Conversation list */}
        <div className="md:col-span-1 flex flex-col bg-white rounded-2xl card overflow-hidden">
          <div className="p-6 border-b border-lw-border">
            <h2 className="text-2xl font-display text-lw-charcoal">
              {t('title')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon="💬"
                  title={t('empty.title')}
                  description={t('empty.description')}
                />
              </div>
            ) : (
              <div className="divide-y divide-lw-border">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-4 text-left transition-colors hover:bg-lw-cream ${
                      selectedConversationId === conv.id ? 'bg-lw-blue-light bg-opacity-10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={conv.participantImage}
                        name={conv.participantName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-lw-charcoal truncate">
                            {conv.participantName}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-lw-red text-white text-xs font-medium flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-lw-warm-gray truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-lw-warm-gray mt-1">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: Message thread */}
        <div className="md:col-span-2 flex flex-col bg-white rounded-2xl card overflow-hidden">
          {selectedConversationId ? (
            <>
              {/* Safety reminder banner */}
              <div className="bg-lw-blue-light bg-opacity-10 border-b border-lw-blue-light p-3 text-sm text-lw-blue-deep">
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0">🛡️</span>
                  <span>
                    {t('safetyReminder')}{' '}
                    <a href="#" className="underline font-medium">
                      {t('guidelines')}
                    </a>
                  </span>
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map(group => (
                  <div key={group.date} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-xs text-lw-warm-gray px-3 py-1 bg-lw-cream rounded-full">
                        {group.date}
                      </span>
                    </div>
                    {group.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === currentUserId.current
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            msg.senderId === currentUserId.current
                              ? 'bg-lw-blue-deep text-lw-cream'
                              : 'bg-white border border-lw-border text-lw-charcoal'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              msg.senderId === currentUserId.current
                                ? 'text-lw-cream text-opacity-70'
                                : 'text-lw-warm-gray'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="border-t border-lw-border p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Textarea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder={t('inputPlaceholder')}
                    rows={1}
                    className="resize-none"
                    maxLength={5000}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!messageInput.trim()}
                  >
                    {t('send')}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="💬"
                title={t('selectConversation')}
                description={t('selectDescription')}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile layout: single panel with back button
  return (
    <div className="h-screen flex flex-col">
      {selectedConversationId ? (
        <>
          {/* Header with back button */}
          <div className="bg-white border-b border-lw-border p-4 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedConversationId(null);
                setMessages([]);
              }}
              className="p-2 hover:bg-lw-cream rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-lw-blue-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="font-display text-lg text-lw-charcoal">
                {conversations.find(c => c.id === selectedConversationId)?.participantName}
              </h2>
            </div>
          </div>

          {/* Safety banner */}
          <div className="bg-lw-blue-light bg-opacity-10 border-b border-lw-blue-light p-3 text-xs text-lw-blue-deep">
            {t('safetyReminder')}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(group => (
              <div key={group.date} className="space-y-3">
                <div className="flex justify-center">
                  <span className="text-xs text-lw-warm-gray px-2 py-1 bg-lw-cream rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === currentUserId.current
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        msg.senderId === currentUserId.current
                          ? 'bg-lw-blue-deep text-lw-cream'
                          : 'bg-white border border-lw-border text-lw-charcoal'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-lw-border p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                placeholder={t('inputPlaceholder')}
                rows={1}
                className="resize-none text-sm"
                maxLength={5000}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!messageInput.trim()}
              >
                {t('send')}
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-lw-border">
            <h2 className="text-2xl font-display text-lw-charcoal">
              {t('title')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 flex items-center justify-center h-full">
                <EmptyState
                  icon="💬"
                  title={t('empty.title')}
                  description={t('empty.description')}
                />
              </div>
            ) : (
              <div className="divide-y divide-lw-border">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full p-4 text-left transition-colors hover:bg-lw-cream"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={conv.participantImage}
                        name={conv.participantName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-lw-charcoal truncate">
                            {conv.participantName}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-lw-red text-white text-xs font-medium">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-lw-warm-gray truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
