'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  tokensCount?: number;
}

const MAX_TOKENS = 1000;

const WEBSITE_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['hoodie', 'shadow matrix', 'fleece', 'gsm', 'fabric', 'cotton'],
    answer:
      'Our flagship Shadow Matrix Heavyweight Hoodie is custom-milled from 500 GSM loopback French terry cotton. It features double-needle reinforced stitching, ribbed cuffs, and an oversized double-layered hood. Price is $98 with sizes from S to XXL.',
  },
  {
    keywords: ['jacket', 'cyber', 'techwear', 'waterproof', 'membrane', 'outerwear'],
    answer:
      'The Cyber-Spec Modular Techwear Jacket ($185) features a 20,000mm hydrostatic waterproof membrane, YKK Aquaguard taped zippers, modular magnetic cargo pockets, and adjustable storm-hood cuffs for extreme weather.',
  },
  {
    keywords: ['price', 'cost', 'how much', 'cheap', 'expensive'],
    answer:
      'PULSEWEAR pricing ranges from $45 for modular accessories up to $98 for 500 GSM heavyweight hoodies and $185 for technical outerwear. Use coupon code "PULSE20" at checkout for 20% off your first drop.',
  },
  {
    keywords: ['size', 'sizing', 'fit', 'measurement', 'chart', 'xxl', 'small', 'medium', 'large'],
    answer:
      'PULSEWEAR garments feature an engineered boxy, oversized streetwear cut. If you prefer a tailored fit, size down one size. Sizes range from S (Chest 38-40"), M (40-42"), L (42-44"), XL (44-46") to XXL (48-50"). Check our interactive Size Guide on any product page.',
  },
  {
    keywords: ['shipping', 'delivery', 'time', 'courier', 'dispatch', 'fast', 'track'],
    answer:
      'We provide express courier delivery across all regions within 2 to 4 business days. Standard shipping is $10, and shipping is completely FREE on all orders over $100. Real-time tracking IDs are issued upon dispatch.',
  },
  {
    keywords: ['return', 'refund', 'exchange', 'policy', 'guarantee', 'days'],
    answer:
      'We offer a 30-day no-questions-asked return and exchange policy. Garments must be unworn in original packaging with intact streetwear security tags.',
  },
  {
    keywords: ['payment', 'pay', 'cod', 'cash', 'card', 'credit', 'wallet'],
    answer:
      'We accept Cash on Delivery (COD), Visa / Mastercard credit and debit cards, and Digital Wallets during checkout. All transactions are protected via 256-bit encryption.',
  },
  {
    keywords: ['discount', 'promo', 'coupon', 'code', 'sale', 'offer'],
    answer:
      'You can apply promo code "PULSE20" at checkout to receive an instant 20% discount on your order subtotal!',
  },
  {
    keywords: ['voting', 'incubator', 'cycle', 'vote', 'community', 'drop'],
    answer:
      'IdeaPulse Incubator runs 7-day community voting cycles (currently active: Cycle 21). Verified members vote on upcoming concept drops. The top-voted garment enters full-scale manufacturing!',
  },
  {
    keywords: ['contact', 'email', 'phone', 'support', 'help', 'admin'],
    answer:
      'You can reach our dedicated support desk at support@pulsewear.store or via the customer contact form in our footer.',
  },
  {
    keywords: ['about', 'pulsewear', 'who are you', 'brand', 'story'],
    answer:
      'PULSEWEAR is a high-performance streetwear incubator. We blend heavyweight custom textiles with decentralized community voting to drop limited-edition technical garments.',
  },
];

export function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'bot',
      text: 'Hello! I am your PULSEWEAR Store Assistant. Ask me anything about our streetwear drops, fabrics, sizing, shipping, or community voting.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load token counter from localStorage
  useEffect(() => {
    try {
      const savedTokens = localStorage.getItem('pulsewear_chatbot_tokens');
      if (savedTokens) {
        const val = parseInt(savedTokens, 10);
        if (!isNaN(val)) setTokensUsed(val);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const updateTokens = (additionalTokens: number) => {
    const updated = Math.min(MAX_TOKENS, tokensUsed + additionalTokens);
    setTokensUsed(updated);
    try {
      localStorage.setItem('pulsewear_chatbot_tokens', updated.toString());
    } catch {
      // ignore
    }
    return updated;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    if (tokensUsed >= MAX_TOKENS) {
      return;
    }

    // Estimate query tokens (~4 characters per token)
    const promptTokens = Math.max(5, Math.ceil(query.length / 4));
    const newTokensTotal = updateTokens(promptTokens);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (newTokensTotal >= MAX_TOKENS) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: 'Your tokens have run short. Please recharge or contact admin / try again later.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();

      // Check if question matches website domain
      let matchedAnswer: string | null = null;
      for (const item of WEBSITE_KNOWLEDGE) {
        if (item.keywords.some((k) => lower.includes(k))) {
          matchedAnswer = item.answer;
          break;
        }
      }

      // Teacher rule: If outside website domain, strictly return exact text
      const replyText = matchedAnswer || 'I can only help with information about this website.';

      // Estimate response tokens
      const replyTokens = Math.max(10, Math.ceil(replyText.length / 4));
      const finalTokens = updateTokens(replyTokens);

      setIsTyping(false);

      if (finalTokens >= MAX_TOKENS) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `b-cutoff-${Date.now()}`,
            sender: 'bot',
            text: 'Your tokens have run short. Please recharge or contact admin / try again later.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 600);
  };

  const isExhausted = tokensUsed >= MAX_TOKENS;
  const tokenPercentage = Math.min(100, Math.round((tokensUsed / MAX_TOKENS) * 100));

  return (
    <>
      {/* Floating Chat Trigger Button on bottom-right of EVERY page */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close Website Assistant' : 'Open AI Website Assistant'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5A1F] to-[#ff7e47] text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[#FF5A1F]/40 active:scale-95 sm:bottom-8 sm:right-8"
        style={{
          boxShadow:
            '0 10px 30px -5px rgba(255, 90, 31, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="PULSEWEAR AI Website Assistant"
          className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#15181B] shadow-2xl backdrop-blur-xl transition-all duration-200 sm:right-8 sm:w-[390px]"
          style={{
            boxShadow:
              '0 25px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header with Live Token Counter */}
          <div className="border-b border-white/10 bg-[#1F2327] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5A1F]/20 text-[#FF5A1F]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    PULSEWEAR Assistant
                  </h3>
                  <p className="text-[10px] text-emerald-400">● Grounded Store AI</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#8A8F95] transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Token Counter Widget in Header */}
            <div className="mt-3 rounded-md border border-white/10 bg-[#15181B] p-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#8A8F95]">Token Counter:</span>
                <span
                  className={`font-bold ${
                    isExhausted
                      ? 'text-red-400'
                      : tokensUsed > 800
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                  }`}
                >
                  {tokensUsed} / {MAX_TOKENS} tokens used
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all duration-300 ${
                    isExhausted
                      ? 'bg-red-500'
                      : tokensUsed > 800
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-indigo-500 to-[#FF5A1F]'
                  }`}
                  style={{ width: `${tokenPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#FF5A1F]/20 text-[#FF5A1F]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#FF5A1F] text-white shadow-sm'
                      : 'border border-white/10 bg-[#1F2327] text-slate-200'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="mt-1 block text-right font-mono text-[9px] opacity-60">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[#8A8F95]">
                <Bot className="h-4 w-4 animate-spin text-[#FF5A1F]" />
                <span className="text-[11px]">Assistant is searching website...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Exhausted Token Banner or Input Box */}
          {isExhausted ? (
            <div className="border-t border-red-500/30 bg-red-500/10 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Limit Reached</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight text-red-300">
                Your tokens have run short. Please recharge or contact admin / try again later.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="border-t border-white/10 bg-[#1F2327] p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, sizes, prices..."
                  className="flex-1 rounded-lg border border-white/15 bg-[#15181B] px-3 py-2 text-xs text-white placeholder:text-[#8A8F95]/60 focus:border-[#FF5A1F] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send query"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5A1F] text-white transition-all hover:bg-[#e04f1b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
