'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Minus, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  'Tell me about features',
  'See pricing',
  'Schedule a demo',
];

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi there! I'm Aura, your AI assistant. How can I help you today?",
};

// Page-specific greetings
const pageGreetings: Record<string, string> = {
  '/': 'Hi! Looking for club management software?',
  '/pricing': 'Have questions about our plans? I can help!',
  '/features': "I see you're exploring our features. Any questions?",
  '/demo': 'Need help scheduling your demo?',
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showProactive, setShowProactive] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Proactive greeting after 30 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowProactive(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate typing
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);

    // Add mock assistant response
    const responses: Record<string, string> = {
      'Tell me about features':
        "ClubVantage offers comprehensive club management including membership management, billing automation, facility booking, golf operations, and our AI assistant Aura. Would you like me to explain any specific feature?",
      'See pricing':
        "We have three plans: Starter ($300/mo), Professional ($800/mo), and Enterprise ($2,500/mo). Each includes different features and member limits. Would you like me to help you choose the right plan?",
      'Schedule a demo':
        "I'd be happy to help you schedule a demo! You can book directly on our demo page, or I can have our team reach out to you. What works better for you?",
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content:
        responses[content] ||
        "Thanks for your message! I'm here to help with any questions about ClubVantage. What would you like to know?",
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const openChat = () => {
    setIsOpen(true);
    setShowProactive(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  // Get current page greeting
  const getCurrentGreeting = () => {
    if (typeof window === 'undefined') return pageGreetings['/'];
    return pageGreetings[window.location.pathname] || pageGreetings['/'];
  };

  return (
    <>
      {/* Proactive bubble */}
      {showProactive && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-up">
          <div className="relative">
            <button
              onClick={openChat}
              className="max-w-xs rounded-xl bg-white p-4 shadow-lg border border-neutral-200 text-left hover:shadow-xl transition-shadow"
            >
              <p className="text-sm text-neutral-700">{getCurrentGreeting()}</p>
            </button>
            <button
              onClick={() => setShowProactive(false)}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3 text-neutral-500" />
            </button>
            {/* Pointer */}
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 bg-white border-r border-b border-neutral-200" />
          </div>
        </div>
      )}

      {/* Chat button (collapsed state) */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-colors animate-pulse hover:animate-none"
          aria-label="Chat with Aura"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat window (expanded state) */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl bg-white shadow-xl border border-neutral-200 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Aura</h3>
                <p className="text-xs text-white/70">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={minimizeChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Minimize"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={closeChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions (show only after welcome) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-100 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button type="submit" size="sm" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
