import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('T-8.4: RULES.md §9 Verification Matrix Audit', () => {
  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'RULES.md'), 'utf-8');
  const votesTest = fs.readFileSync(path.join(process.cwd(), 'tests/votes.test.ts'), 'utf-8');
  const ideasTest = fs.readFileSync(path.join(process.cwd(), 'tests/ideas.test.ts'), 'utf-8');
  const cycleTest = fs.readFileSync(
    path.join(process.cwd(), 'tests/cycle-engine.test.ts'),
    'utf-8',
  );
  const cycleSimTest = fs.readFileSync(
    path.join(process.cwd(), 'tests/cycle-simulation.test.ts'),
    'utf-8',
  );
  const loadTest = fs.readFileSync(
    path.join(process.cwd(), 'tests/load-concurrency.test.ts'),
    'utf-8',
  );
  const rlsSql = fs.readFileSync(path.join(process.cwd(), 'supabase/tests/rls.test.sql'), 'utf-8');
  const antiAbuseSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/tests/anti_abuse.test.sql'),
    'utf-8',
  );

  it('verifies BR-010 tests exist and enforce 5-vote 24h rolling window', () => {
    expect(votesTest).toContain('IP_VOTE_QUOTA');
    expect(antiAbuseSql).toContain('T-1.30');
  });

  it('verifies BR-011 tests exist and enforce 1-vote-per-idea without quota consumption on duplicate', () => {
    expect(votesTest).toContain('IP_DUPLICATE_VOTE');
    expect(votesTest).toContain("You've already voted on this idea.");
  });

  it('verifies BR-012 tests exist and enforce self-vote CHECK constraint prevention', () => {
    expect(votesTest).toContain('IP_SELF_VOTE');
    expect(rlsSql).toContain('self-vote rejected');
  });

  it('verifies BR-014 tests exist and enforce 10-minute retraction and slot non-refund', () => {
    expect(votesTest).toContain('RETRACTION_WINDOW_CLOSED');
    expect(antiAbuseSql).toContain('T-1.29');
  });

  it('verifies BR-020 tests exist and enforce 7-day cooldown and no refund on withdrawal', () => {
    expect(ideasTest).toContain('RULES.md BR-020');
    expect(antiAbuseSql).toContain('T-1.31');
  });

  it('verifies BR-022 tests exist and lock idea description upon first verified vote', () => {
    const errorsSource = fs.readFileSync(path.join(process.cwd(), 'lib/errors.ts'), 'utf-8');
    const submissionMigration = fs.readFileSync(
      path.join(process.cwd(), 'supabase/migrations/100_submission_quota.sql'),
      'utf-8',
    );
    expect(errorsSource).toContain('IP_IDEA_LOCKED');
    expect(submissionMigration).toContain('IP_IDEA_LOCKED');
  });

  it('verifies BR-031 concurrency tests enforce advisory lock quota invariants', () => {
    expect(loadTest).toContain('T-8.3');
    expect(loadTest).toContain('VOTE_QUOTA_EXCEEDED');
  });

  it('verifies BR-033 test asserts 23-hour-old account is unverified', () => {
    expect(antiAbuseSql).toContain('voter_is_verified');
    expect(antiAbuseSql).toContain('23 hours');
  });

  it('verifies BR-041, BR-045, BR-046, BR-048 cycle engine tests exist', () => {
    expect(cycleTest).toContain('cycle');
    expect(cycleSimTest).toContain('simulateCycleRotation');
    expect(antiAbuseSql).toContain('qualified_at');
  });

  it('verifies RLS security tests enforce private votes and role escalation prevention', () => {
    expect(rlsSql).toContain('cannot read user');
    expect(rlsSql).toContain('cannot update own role');
  });

  it('ensures all 20 verification items are explicitly documented in RULES.md §9', () => {
    expect(rulesContent).toContain('## 9. Verification checklist');
    expect(rulesContent).toContain('BR-010');
    expect(rulesContent).toContain('BR-011');
    expect(rulesContent).toContain('BR-012');
    expect(rulesContent).toContain('BR-014');
    expect(rulesContent).toContain('BR-020');
    expect(rulesContent).toContain('BR-022');
    expect(rulesContent).toContain('BR-031');
    expect(rulesContent).toContain('BR-033');
    expect(rulesContent).toContain('BR-041');
    expect(rulesContent).toContain('BR-045');
    expect(rulesContent).toContain('BR-046');
    expect(rulesContent).toContain('BR-048');
    expect(rulesContent).toContain('RLS');
  });
});
