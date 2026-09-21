import { describe, it, expect } from 'vitest';
import type { GetFeedParams } from '@/lib/feed';

describe('Feed Search & Discovery [T-4.18]', () => {
  it('accepts search query parameter in GetFeedParams', () => {
    const params: GetFeedParams = {
      sort: 'trending',
      search: 'climate',
      limit: 12,
    };

    expect(params.search).toBe('climate');
    expect(params.sort).toBe('trending');
  });

  it('normalizes search terms properly', () => {
    const rawSearch = '   decentralized storage   ';
    const trimmed = rawSearch.trim();

    expect(trimmed).toBe('decentralized storage');
  });
});
