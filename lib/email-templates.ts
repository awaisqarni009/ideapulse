/**
 * IdeaPulse Branded Auth Email Templates
 * Brand voice: "Signal through glass" — concise, confident, dark-mode first.
 * Conforms to TASKS.md [T-2.4].
 */

export const EMAIL_SUBJECTS = {
  confirmation: 'Confirm your IdeaPulse account',
  recovery: 'Reset your IdeaPulse password',
  magicLink: 'Your IdeaPulse sign-in link',
  emailChange: 'Confirm your new email address',
} as const;

export function getConfirmationEmailText(confirmationUrl: string): string {
  return `IdeaPulse — Confirm your account

You're one step away from participating in IdeaPulse. Confirm your email address to begin submitting ideas and casting your votes:

${confirmationUrl}

This link expires in 24 hours. If you did not create an IdeaPulse account, please ignore this email.

--
IdeaPulse — Scarcity and signal in product ideas.
Five votes per day. Every vote matters.`;
}

export function getRecoveryEmailText(recoveryUrl: string): string {
  return `IdeaPulse — Reset your password

We received a request to reset the password for your IdeaPulse account:

${recoveryUrl}

This link expires in 1 hour. If you did not request a password reset, please ignore this email.

--
IdeaPulse — Scarcity and signal in product ideas.
Five votes per day. Every vote matters.`;
}
