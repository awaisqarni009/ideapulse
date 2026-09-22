'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Vote,
  Trophy,
  Lightbulb,
  Mail,
  ArrowRight,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'voting' | 'proposals' | 'cycles' | 'security';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'voting',
    question: 'How does the rolling 5 votes per 24 hours quota work?',
    answer:
      'Unlike platforms with arbitrary midnight resets, IdeaPulse uses a continuous rolling window. At the moment you attempt to cast a vote, the database counts all non-retracted votes you cast in the preceding 24 hours. If that count is less than 5, your vote is accepted.',
  },
  {
    category: 'voting',
    question: 'Can I retract a vote after casting it?',
    answer:
      'Yes! You have a 1-hour grace period after casting a vote to retract it if you change your mind. Retracting a vote will deduct the vote from the idea’s verified count, but it will still count against your 24-hour quota to prevent quota cycling abuse.',
  },
  {
    category: 'voting',
    question: 'Can I vote for my own proposal?',
    answer:
      'No. Self-voting is strictly forbidden and rejected at the database level by a PostgreSQL CHECK constraint. This ensures all votes reflect genuine peer consensus.',
  },
  {
    category: 'proposals',
    question: 'How many ideas can I submit per cycle?',
    answer:
      'Every user is limited to submitting exactly 1 proposal per active 7-day cycle. This invariant encourages creators to pitch only their highest-conviction concept rather than flooding the community with drafts.',
  },
  {
    category: 'proposals',
    question: 'What does "Qualified" status mean?',
    answer:
      'When an idea accumulates 5 verified peer votes, it officially crosses the qualification threshold. The moment it crosses this mark, an immutable qualification timestamp (qualified_at) is permanently recorded, which is later used as the first tie-breaker during cycle close.',
  },
  {
    category: 'proposals',
    question: 'Can I edit my idea after submitting?',
    answer:
      'You can update your idea’s title, summary, and description while the cycle is active. However, you cannot transfer authorship or change its creation timestamp.',
  },
  {
    category: 'cycles',
    question: 'When do incubation cycles start and end?',
    answer:
      'Cycles run on a strict 7-day cadence, concluding every Sunday at midnight UTC. An automated background worker triggers finalization, ranks all qualified ideas, crowns the cycle champion, and immediately initializes the next cycle.',
  },
  {
    category: 'cycles',
    question: 'How are leaderboard ties resolved?',
    answer:
      'If two or more ideas finish with the exact same number of verified votes, ties are broken deterministically by qualified_at (the idea that reached 5 votes earliest wins). If still tied, the earlier submission timestamp (created_at) breaks the tie.',
  },
  {
    category: 'cycles',
    question: 'What happens to past cycle winners?',
    answer:
      'All completed cycles and winning proposals are permanently archived in our Hall of Fame and Cycle History explorer (/cycles/1). Winning creators gain verified creator badges and community funding grants.',
  },
  {
    category: 'security',
    question: 'Why do I need to confirm my email address?',
    answer:
      'To prevent Sybil attacks and automated bot armies from manipulating rankings, only verified email accounts can cast votes or submit proposals. Unverified users can still browse and read proposals.',
  },
  {
    category: 'security',
    question: 'Is my IP address or personal data stored?',
    answer:
      'No raw IP addresses are ever stored. IdeaPulse hashes incoming client IPs with a daily rotating salt (ip_hash) strictly to defend against DDoS attacks and brute-force voting. Your privacy is protected.',
  },
  {
    category: 'security',
    question: 'Are vote counts real-time?',
    answer:
      'Yes! IdeaPulse leverages Supabase Realtime to broadcast live vote count and qualification state changes across all connected clients without polling or screen refresh.',
  },
];

export function FAQClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'voting', label: 'Voting & Quotas', icon: Vote },
    { id: 'proposals', label: 'Proposals', icon: Lightbulb },
    { id: 'cycles', label: 'Cycles & Leaderboard', icon: Trophy },
    { id: 'security', label: 'Security & Anti-Sybil', icon: ShieldCheck },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  const toggleIndex = (idx: number) => {
    if (openIndices.includes(idx)) {
      setOpenIndices(openIndices.filter((i) => i !== idx));
    } else {
      setOpenIndices([...openIndices, idx]);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      {/* Category Pills */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? 'border border-[var(--border-accent)] bg-[var(--indigo)] text-white shadow-[var(--glow-indigo-sm)]'
                  : 'border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion List */}
      <div className="mt-10 space-y-4">
        {filteredItems.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              className="glass-card-nextgen overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-display text-base font-bold text-[var(--text-primary)]">
                  {item.question}
                </span>
                <span
                  className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[var(--indigo-bright)]' : ''
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-6 py-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Box */}
      <div className="mt-20 rounded-[var(--radius-xl)] border border-[var(--border-accent)] bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] p-8 text-center shadow-[var(--glow-indigo-sm)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tint-indigo)] text-[var(--indigo-bright)]">
          <Mail className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-[var(--text-primary)]">
          Still have questions?
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[var(--text-secondary)]">
          Our community and core contributors are active 24/7 on Discord and via email support.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:support@ideapulse.dev"
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--indigo)] px-5 py-2.5 text-xs font-semibold text-white shadow-[var(--glow-indigo-sm)] transition-all hover:bg-[var(--indigo-bright)]"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Contact Support</span>
          </a>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-accent)]"
          >
            <span>Submit Your Idea</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
