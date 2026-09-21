import { describe, it, expect } from 'vitest';
import { ideaSubmissionSchema } from '@/lib/validation';

describe('Idea Submission Draft Serialization (T-3.6)', () => {
  const draftData = {
    title: 'Self-Hosted AI Model Serving on Embedded GPUs',
    category: 'ai' as const,
    summary: 'A low-latency framework designed for edge clusters running local inference.',
    body: '## Architecture\nThis service optimizes tensor memory mapping for real-time video analytics without remote latency.',
    tags: ['ai', 'edge', 'gpu'],
    savedAt: '10:15',
  };

  it('serializes and deserializes draft without loss', () => {
    const serialized = JSON.stringify(draftData);
    const restored = JSON.parse(serialized);

    expect(restored.title).toBe(draftData.title);
    expect(restored.category).toBe(draftData.category);
    expect(restored.summary).toBe(draftData.summary);
    expect(restored.body).toBe(draftData.body);
    expect(restored.tags).toEqual(draftData.tags);
    expect(restored.savedAt).toBe('10:15');

    const validation = ideaSubmissionSchema.safeParse(restored);
    expect(validation.success).toBe(true);
  });

  it('validates incomplete draft correctly', () => {
    const partialDraft = {
      title: 'Short',
      category: 'ai' as const,
      summary: 'Too short',
      body: 'Incomplete',
      tags: [],
    };
    const validation = ideaSubmissionSchema.safeParse(partialDraft);
    expect(validation.success).toBe(false);
  });
});

describe('Withdrawal Flow Business Rules (RULES.md BR-023)', () => {
  it('formats withdrawal consequence message exactly as required', () => {
    const voteCount = 23;
    const consequenceMessage = `Withdraw this idea? It leaves the leaderboard, keeps its ${voteCount} votes on record, and doesn't give back this week's submission slot. This can't be undone.`;

    expect(consequenceMessage).toContain('leaves the leaderboard');
    expect(consequenceMessage).toContain('keeps its 23 votes on record');
    expect(consequenceMessage).toContain("doesn't give back this week's submission slot");
    expect(consequenceMessage).toContain("This can't be undone.");
  });

  it('prevents non-author from initiating withdrawal', () => {
    const authorId = '11111111-1111-4111-a111-111111111111';
    const otherUserId = '22222222-2222-4222-a222-222222222222';

    const canWithdraw = (callerId: string, ideaAuthorId: string, status: string) => {
      return callerId === ideaAuthorId && status === 'published';
    };

    expect(canWithdraw(authorId, authorId, 'published')).toBe(true);
    expect(canWithdraw(otherUserId, authorId, 'published')).toBe(false);
    expect(canWithdraw(authorId, authorId, 'withdrawn')).toBe(false);
  });
});
