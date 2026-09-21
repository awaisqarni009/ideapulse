import { format } from 'date-fns';

/**
 * Format next-slot message per RULES.md BR-020:
 * "You've used this week's submission. Your next slot opens Thursday 14 March at 09:12 UTC."
 */
export function formatNextSlotMessage(timestampStr?: string): string {
  if (!timestampStr) {
    return "You've used this week's submission. Your next slot opens in 7 days.";
  }
  try {
    const d = new Date(timestampStr);
    if (isNaN(d.getTime())) {
      return "You've used this week's submission. Your next slot opens in 7 days.";
    }
    const dayStr = format(d, 'EEEE d MMMM');
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    return `You've used this week's submission. Your next slot opens ${dayStr} at ${hours}:${minutes} UTC.`;
  } catch {
    return "You've used this week's submission. Your next slot opens in 7 days.";
  }
}
