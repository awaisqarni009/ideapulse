/**
 * IdeaPulse Error Codes & User-Facing Messages
 * Authoritative mapping per RULES.md §7 and TASKS.md [T-0.16].
 * Never write generic "something went wrong" errors — every failure names what happened and what to do next.
 */

export const IP_ERROR_CODES = [
  'IP_UNAUTHENTICATED',
  'IP_ACCOUNT_NOT_WRITABLE',
  'IP_SELF_VOTE',
  'IP_DUPLICATE_VOTE',
  'IP_VOTE_QUOTA',
  'IP_SUBMIT_COOLDOWN',
  'IP_IDEA_CLOSED',
  'IP_IDEA_LOCKED',
  'IP_IDEA_NOT_FOUND',
  'IP_RETRACTION_WINDOW_CLOSED',
  'IP_VOTE_NOT_FOUND',
  'IP_NO_ACTIVE_CYCLE',
  'IP_CYCLE_ALREADY_FINALIZED',
  'IP_RATE_LIMITED',
  'IP_VALIDATION',
] as const;

export type IpErrorCode = (typeof IP_ERROR_CODES)[number];

export interface ErrorDetails {
  code: IpErrorCode;
  status: number;
  message: string;
  ruleRef?: string;
  nextSlotAt?: string;
  reason?: string;
  retryAfterSeconds?: number;
}

export function isIpErrorCode(code: string): code is IpErrorCode {
  return IP_ERROR_CODES.includes(code as IpErrorCode);
}

export function getIpErrorMessage(
  code: IpErrorCode,
  params?: {
    duration?: string;
    datetime?: string;
    date?: string;
    seconds?: number;
    reason?: 'unconfirmed' | 'suspended' | string;
    customMessage?: string;
  },
): string {
  switch (code) {
    case 'IP_UNAUTHENTICATED':
      return 'Sign in to vote.';

    case 'IP_ACCOUNT_NOT_WRITABLE':
      if (params?.reason === 'suspended' && params.date) {
        return `This account is suspended until ${params.date}. Contact support if you think this is a mistake.`;
      }
      return 'Confirm your email to start voting. Resend the link →';

    case 'IP_SELF_VOTE':
      return "You can't vote on your own idea.";

    case 'IP_DUPLICATE_VOTE':
      return "You've already voted on this idea.";

    case 'IP_VOTE_QUOTA':
      return params?.duration
        ? `You've used all 5 votes. Your next vote unlocks in ${params.duration}.`
        : "You've used all 5 votes. Your next vote unlocks in 24 hours.";

    case 'IP_SUBMIT_COOLDOWN':
      return params?.datetime
        ? `You've used this week's submission. Your next slot opens ${params.datetime}.`
        : "You've used this week's submission. Your next slot opens in 7 days.";

    case 'IP_IDEA_CLOSED':
      return 'Voting is closed on this idea.';

    case 'IP_IDEA_LOCKED':
      return 'This idea is locked because people have already voted on it.';

    case 'IP_IDEA_NOT_FOUND':
      return "That idea doesn't exist.";

    case 'IP_RETRACTION_WINDOW_CLOSED':
      return 'Votes can only be taken back within 10 minutes.';

    case 'IP_VOTE_NOT_FOUND':
      return "There's no vote here to take back.";

    case 'IP_NO_ACTIVE_CYCLE':
      return 'The weekly cycle is closing right now. Try again in a moment.';

    case 'IP_CYCLE_ALREADY_FINALIZED':
      return 'This cycle is already closed.';

    case 'IP_RATE_LIMITED':
      return params?.seconds !== undefined
        ? `Too many requests. Try again in ${params.seconds}s.`
        : 'Too many requests. Please try again shortly.';

    case 'IP_VALIDATION':
      return params?.customMessage ?? 'Please check the required fields and submit again.';

    default:
      return 'An unexpected issue occurred. Please check the rules or try again.';
  }
}

export class IdeaPulseError extends Error {
  public readonly code: IpErrorCode;
  public readonly status: number;
  public readonly ruleRef?: string;
  public readonly nextSlotAt?: string;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'IdeaPulseError';
    this.code = details.code;
    this.status = details.status;
    this.ruleRef = details.ruleRef;
    this.nextSlotAt = details.nextSlotAt;
  }
}
