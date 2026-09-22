import { describe, it, expect } from 'vitest';
import { parseVoteError } from '@/lib/votes/errors';
import fs from 'fs';
import path from 'path';

describe('States & Resilience [T-7.7 to T-7.10, DESIGN.md §7.11, RULES.md §7]', () => {
  describe('T-7.7: Empty States Verbatim Compliance', () => {
    const feedEmptyStateCode = fs.readFileSync(
      path.join(process.cwd(), 'app/components/feed/feed-empty-state.tsx'),
      'utf-8',
    );
    const leaderboardCode = fs.readFileSync(
      path.join(process.cwd(), 'app/components/leaderboard/realtime-leaderboard.tsx'),
      'utf-8',
    );
    const profileCode = fs.readFileSync(
      path.join(process.cwd(), 'app/u/[username]/page.tsx'),
      'utf-8',
    );
    const rewardsCode = fs.readFileSync(
      path.join(process.cwd(), 'app/components/profile/profile-rewards.tsx'),
      'utf-8',
    );

    it('implements Feed, no results: "No ideas match these filters" with "Clear filters" action', () => {
      expect(feedEmptyStateCode).toContain('No ideas match these filters');
      expect(feedEmptyStateCode).toContain('Clear filters');
    });

    it('implements Feed, no ideas at all: "This cycle is waiting for its first idea" with "Post an idea" action', () => {
      expect(feedEmptyStateCode).toContain('This cycle is waiting for its first idea');
      expect(feedEmptyStateCode).toContain('Post an idea');
    });

    it('implements Leaderboard, empty: "Nothing has been voted on yet this cycle" with "Browse ideas" action', () => {
      expect(leaderboardCode).toContain('Nothing has been voted on yet this cycle');
      expect(leaderboardCode).toContain('Browse ideas');
    });

    it('implements Your profile, no ideas: "You haven\'t posted an idea yet" with "Post your first idea" action', () => {
      expect(profileCode).toContain("You haven't posted an idea yet");
      expect(profileCode).toContain('Post your first idea');
    });

    it('implements Rewards, none: "No idea reached 50 votes this cycle" with "See cycle results" action', () => {
      expect(rewardsCode).toContain('No idea reached 50 votes this cycle');
      expect(rewardsCode).toContain('See cycle results');
    });
  });

  describe('T-7.8: Error States Linked to Rule Anchors', () => {
    it('maps all vote errors to canonical RULES.md rule anchors', () => {
      expect(parseVoteError('IP_UNAUTHENTICATED').ruleAnchor).toBe('BR-001');
      expect(parseVoteError('IP_ACCOUNT_NOT_WRITABLE').ruleAnchor).toBe('BR-002');
      expect(parseVoteError('IP_VOTE_QUOTA:2026-09-22T00:00:00Z').ruleAnchor).toBe('BR-010');
      expect(parseVoteError('IP_DUPLICATE_VOTE').ruleAnchor).toBe('BR-011');
      expect(parseVoteError('IP_SELF_VOTE').ruleAnchor).toBe('BR-012');
      expect(parseVoteError('IP_IDEA_CLOSED').ruleAnchor).toBe('BR-013');
      expect(parseVoteError('IP_RETRACTION_WINDOW_CLOSED').ruleAnchor).toBe('BR-014');
      expect(parseVoteError('IP_VOTE_NOT_FOUND').ruleAnchor).toBe('BR-015');
      expect(parseVoteError('IP_IDEA_NOT_FOUND').ruleAnchor).toBe('BR-017');
      expect(parseVoteError('IP_RATE_LIMITED').ruleAnchor).toBe('BR-032');
      expect(parseVoteError('IP_NO_ACTIVE_CYCLE').ruleAnchor).toBe('BR-043');
    });

    it('verifies VoteButton renders rule links for inline errors', () => {
      const voteButtonCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/votes/vote-button.tsx'),
        'utf-8',
      );
      expect(voteButtonCode).toContain('/rules#${inlineError.ruleAnchor}');
    });

    it('verifies IdeaForm renders rule links for submission errors', () => {
      const ideaFormCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/ideas/idea-form.tsx'),
        'utf-8',
      );
      expect(ideaFormCode).toContain('/rules#${serverError.ruleAnchor}');
    });
  });

  describe('T-7.9: Loading States Layout Preservation', () => {
    it('verifies LeaderboardRowSkeleton maintains min-h-[72px] matching LeaderboardRow', () => {
      const skeletonCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/leaderboard/leaderboard-skeleton.tsx'),
        'utf-8',
      );
      const rowCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/leaderboard/leaderboard-row.tsx'),
        'utf-8',
      );

      expect(skeletonCode).toContain('min-h-[72px]');
      expect(rowCode).toContain('min-h-[72px]');
    });

    it('verifies IdeaCardSkeleton maintains exact padding and radius matching IdeaCard', () => {
      const skeletonCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/ideas/idea-card-skeleton.tsx'),
        'utf-8',
      );
      const cardCode = fs.readFileSync(
        path.join(process.cwd(), 'app/components/ideas/idea-card.tsx'),
        'utf-8',
      );

      expect(skeletonCode).toContain('rounded-[var(--radius-lg)]');
      expect(cardCode).toContain('rounded-[var(--radius-lg)]');
      expect(skeletonCode).toContain('p-6');
      expect(cardCode).toContain('p-6');
    });
  });

  describe('T-7.10: 404 and 500 Pages in Design Language', () => {
    it('verifies 404 page exists and links to home, feed, and rules', () => {
      const notFoundCode = fs.readFileSync(path.join(process.cwd(), 'app/not-found.tsx'), 'utf-8');
      expect(notFoundCode).toContain('Page Not Found');
      expect(notFoundCode).toContain('href="/"');
      expect(notFoundCode).toContain('href="/feed"');
      expect(notFoundCode).toContain('href="/rules"');
    });

    it('verifies 500 error boundary exists with retry reset action and rules link', () => {
      const errorCode = fs.readFileSync(path.join(process.cwd(), 'app/error.tsx'), 'utf-8');
      expect(errorCode).toContain('System Interruption');
      expect(errorCode).toContain('reset()');
      expect(errorCode).toContain('href="/rules"');
    });

    it('verifies global-error root boundary exists with fallback reload action', () => {
      const globalErrorCode = fs.readFileSync(
        path.join(process.cwd(), 'app/global-error.tsx'),
        'utf-8',
      );
      expect(globalErrorCode).toContain('Fatal Error');
      expect(globalErrorCode).toContain('reset()');
    });
  });
});
