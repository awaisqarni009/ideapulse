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
  | 'UNKNOWN';

export interface VoteError {
  code: VoteErrorCode;
  message: string;
  nextSlotAt?: string;
  remainingDuration?: string;
  reason?: string;
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

  // 1. Unauthenticated
  if (rawMessage.includes('IP_UNAUTHENTICATED') || error?.code === '42501') {
    return {
      code: 'IP_UNAUTHENTICATED',
      message: 'Sign in to vote.',
    };
  }

  // 2. Unconfirmed / Suspended Account
  if (rawMessage.includes('IP_ACCOUNT_NOT_WRITABLE')) {
    return {
      code: 'IP_ACCOUNT_NOT_WRITABLE',
      message: 'Confirm your email to start voting. Resend the link →',
      reason: 'unconfirmed',
    };
  }

  // 3. Self-vote attempt
  if (
    rawMessage.includes('IP_SELF_VOTE') ||
    rawMessage.includes('CHECK (voter_id <> idea_author_id)')
  ) {
    return {
      code: 'IP_SELF_VOTE',
      message: "You can't vote on your own idea.",
    };
  }

  // 4. Duplicate vote
  if (
    rawMessage.includes('IP_DUPLICATE_VOTE') ||
    rawMessage.includes('UNIQUE (idea_id, voter_id)')
  ) {
    return {
      code: 'IP_DUPLICATE_VOTE',
      message: "You've already voted on this idea.",
    };
  }

  // 5. Vote Quota Exceeded: IP_VOTE_QUOTA:<timestamp>
  if (rawMessage.includes('IP_VOTE_QUOTA')) {
    const parts = rawMessage.split('IP_VOTE_QUOTA:');
    const nextSlotTimestamp = parts[1]?.split('\n')[0]?.trim();
    const duration = formatQuotaDuration(nextSlotTimestamp);
    return {
      code: 'IP_VOTE_QUOTA',
      nextSlotAt: nextSlotTimestamp,
      remainingDuration: duration,
      message: `You've used all 5 votes. Your next vote unlocks in ${duration}.`,
    };
  }

  // 6. Closed Idea
  if (rawMessage.includes('IP_IDEA_CLOSED')) {
    return {
      code: 'IP_IDEA_CLOSED',
      message: 'Voting is closed on this idea.',
    };
  }

  // 7. Not Found
  if (rawMessage.includes('IP_IDEA_NOT_FOUND')) {
    return {
      code: 'IP_IDEA_NOT_FOUND',
      message: "That idea doesn't exist.",
    };
  }

  // 8. No Active Cycle
  if (rawMessage.includes('IP_NO_ACTIVE_CYCLE')) {
    return {
      code: 'IP_NO_ACTIVE_CYCLE',
      message: 'Voting is closed between cycles.',
    };
  }

  // 9. Rate Limited
  if (rawMessage.toLowerCase().includes('rate limit')) {
    return {
      code: 'IP_RATE_LIMITED',
      message: 'Too many votes in a short window. Please wait a moment.',
    };
  }

  return {
    code: 'UNKNOWN',
    message: rawMessage || 'Unable to cast vote. Please try again.',
  };
}
