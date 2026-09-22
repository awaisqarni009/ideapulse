import { formatDistanceToNowStrict } from 'date-fns';

/**
 * Vote Error Mapping System per RULES.md §7, ARCHITECTURE.md §1.1, and TASKS.md [T-3.10].
 * Discriminated union guaranteeing no generic "something went wrong" errors.
 */

export type VoteErrorCode =
  | 'IP_UNAUTHENTICATED'
  | 'IP_ACCOUNT_NOT_WRITABLE'
  | 'IP_SELF_VOTE'
  | 'IP_DUPLICATE_VOTE'
  | 'IP_VOTE_QUOTA'
  | 'IP_IDEA_CLOSED'
  | 'IP_IDEA_NOT_FOUND'
  | 'IP_NO_ACTIVE_CYCLE'
  | 'IP_RATE_LIMITED'
  | 'IP_RETRACTION_WINDOW_CLOSED'
  | 'IP_VOTE_NOT_FOUND'
  | 'UNKNOWN';

export interface VoteError {
  code: VoteErrorCode;
  message: string;
  nextSlotAt?: string;
  remainingDuration?: string;
  reason?: string;
  ruleAnchor?: string;
}

export function formatQuotaDuration(nextSlotIso?: string): string {
  if (!nextSlotIso) return 'in 24 hours';
  try {
    const nextSlot = new Date(nextSlotIso);
    if (isNaN(nextSlot.getTime())) return 'in 24 hours';
    const diffMs = nextSlot.getTime() - Date.now();
    if (diffMs <= 0) return 'shortly';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch {
    return 'in 24 hours';
  }
}

export function parseVoteError(error: any): VoteError {
  const rawMessage = (error?.message || error?.details || String(error || '')).trim();

  // 1. Unauthenticated (RULES.md BR-001)
  if (rawMessage.includes('IP_UNAUTHENTICATED') || error?.code === '42501') {
    return {
      code: 'IP_UNAUTHENTICATED',
      message: 'Sign in to vote.',
      ruleAnchor: 'BR-001',
    };
  }

  // 2. Unconfirmed / Suspended Account (RULES.md BR-002)
  if (rawMessage.includes('IP_ACCOUNT_NOT_WRITABLE')) {
    return {
      code: 'IP_ACCOUNT_NOT_WRITABLE',
      message: 'Confirm your email to start voting. Resend the link →',
      reason: 'unconfirmed',
      ruleAnchor: 'BR-002',
    };
  }

  // 3. Self-vote attempt (RULES.md BR-012)
  if (
    rawMessage.includes('IP_SELF_VOTE') ||
    rawMessage.includes('CHECK (voter_id <> idea_author_id)')
  ) {
    return {
      code: 'IP_SELF_VOTE',
      message: "You can't vote on your own idea.",
      ruleAnchor: 'BR-012',
    };
  }

  // 4. Duplicate vote (RULES.md BR-011)
  if (
    rawMessage.includes('IP_DUPLICATE_VOTE') ||
    rawMessage.includes('UNIQUE (idea_id, voter_id)')
  ) {
    return {
      code: 'IP_DUPLICATE_VOTE',
      message: "You've already voted on this idea.",
      ruleAnchor: 'BR-011',
    };
  }

  // 5. Vote Quota Exceeded: IP_VOTE_QUOTA:<timestamp> (RULES.md BR-010)
  if (rawMessage.includes('IP_VOTE_QUOTA')) {
    const parts = rawMessage.split('IP_VOTE_QUOTA:');
    const nextSlotTimestamp = parts[1]?.split('\n')[0]?.trim();
    const duration = formatQuotaDuration(nextSlotTimestamp);
    return {
      code: 'IP_VOTE_QUOTA',
      nextSlotAt: nextSlotTimestamp,
      remainingDuration: duration,
      message: `You've used all 5 votes. Your next vote unlocks in ${duration}.`,
      ruleAnchor: 'BR-010',
    };
  }

  // 6. Closed Idea (RULES.md BR-013)
  if (rawMessage.includes('IP_IDEA_CLOSED')) {
    return {
      code: 'IP_IDEA_CLOSED',
      message: 'Voting is closed on this idea.',
      ruleAnchor: 'BR-013',
    };
  }

  // 7. Not Found (RULES.md BR-017)
  if (rawMessage.includes('IP_IDEA_NOT_FOUND')) {
    return {
      code: 'IP_IDEA_NOT_FOUND',
      message: "That idea doesn't exist.",
      ruleAnchor: 'BR-017',
    };
  }

  // 8. No Active Cycle (RULES.md BR-043)
  if (rawMessage.includes('IP_NO_ACTIVE_CYCLE')) {
    return {
      code: 'IP_NO_ACTIVE_CYCLE',
      message: 'Voting is closed between cycles.',
      ruleAnchor: 'BR-043',
    };
  }

  // 9. Rate Limited (RULES.md BR-032)
  if (rawMessage.toLowerCase().includes('rate limit') || rawMessage.includes('IP_RATE_LIMITED')) {
    return {
      code: 'IP_RATE_LIMITED',
      message: 'Too many votes in a short window. Please wait a moment.',
      ruleAnchor: 'BR-032',
    };
  }

  // 10. Retraction Window Closed (RULES.md BR-014)
  if (rawMessage.includes('IP_RETRACTION_WINDOW_CLOSED')) {
    return {
      code: 'IP_RETRACTION_WINDOW_CLOSED',
      message: 'Votes can only be taken back within 10 minutes.',
      ruleAnchor: 'BR-014',
    };
  }

  // 11. Vote Not Found for Retraction (RULES.md BR-015)
  if (rawMessage.includes('IP_VOTE_NOT_FOUND')) {
    return {
      code: 'IP_VOTE_NOT_FOUND',
      message: "There's no vote here to take back.",
      ruleAnchor: 'BR-015',
    };
  }

  return {
    code: 'UNKNOWN',
    message: rawMessage || 'Unable to cast vote. Please try again.',
  };
}
