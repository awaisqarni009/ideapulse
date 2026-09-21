import { describe, it, expect } from 'vitest';

describe('Auth & Account State Logic (T-2.14, T-2.15)', () => {
  it('correctly determines account writable status per RULES.md BR-002 & BR-038', () => {
    function isAccountWritable(
      user: { email_confirmed_at: string | null },
      profile: { status: string; suspended_until: string | null },
    ) {
      const isConfirmed = !!user.email_confirmed_at;
      const isSuspended =
        profile.status === 'suspended' ||
        (profile.suspended_until ? new Date(profile.suspended_until) > new Date() : false);
      return isConfirmed && profile.status === 'active' && !isSuspended;
    }

    // Fully confirmed, active, not suspended -> Writable
    expect(
      isAccountWritable(
        { email_confirmed_at: '2026-01-01T00:00:00Z' },
        { status: 'active', suspended_until: null },
      ),
    ).toBe(true);

    // Unconfirmed email -> NOT writable (BR-002)
    expect(
      isAccountWritable({ email_confirmed_at: null }, { status: 'active', suspended_until: null }),
    ).toBe(false);

    // Suspended account -> NOT writable (BR-038)
    expect(
      isAccountWritable(
        { email_confirmed_at: '2026-01-01T00:00:00Z' },
        { status: 'suspended', suspended_until: null },
      ),
    ).toBe(false);

    // Active status but suspended_until in the future -> NOT writable
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    expect(
      isAccountWritable(
        { email_confirmed_at: '2026-01-01T00:00:00Z' },
        { status: 'active', suspended_until: futureDate },
      ),
    ).toBe(false);

    // Active status and suspended_until in the past -> Writable
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    expect(
      isAccountWritable(
        { email_confirmed_at: '2026-01-01T00:00:00Z' },
        { status: 'active', suspended_until: pastDate },
      ),
    ).toBe(true);
  });

  it('correctly calculates remaining cooldown days for username modification', () => {
    function getRemainingDays(updatedAt: string): number {
      const lastUpdateMs = new Date(updatedAt).getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const timeSinceUpdate = Date.now() - lastUpdateMs;
      if (timeSinceUpdate < thirtyDaysMs) {
        return Math.ceil((thirtyDaysMs - timeSinceUpdate) / (24 * 60 * 60 * 1000));
      }
      return 0;
    }

    // Updated 5 days ago -> 25 days remaining
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRemainingDays(fiveDaysAgo)).toBe(25);

    // Updated 31 days ago -> 0 days remaining (can change)
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRemainingDays(thirtyOneDaysAgo)).toBe(0);
  });
});
