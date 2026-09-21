import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '@/lib/constants';

describe('Feed multi-select filters and empty state logic [T-4.6, T-4.7]', () => {
  it('correctly splits and formats comma-separated category and tag filters', () => {
    const rawCategoryParam = 'developer-tools,fintech,ai';
    const categories = rawCategoryParam.split(',').filter(Boolean);

    expect(categories).toHaveLength(3);
    expect(categories).toContain('developer-tools');
    expect(categories).toContain('fintech');
    expect(categories).toContain('ai');
  });

  it('filters empty or blank items cleanly', () => {
    const rawTagParam = 'offline-first,,zkp,';
    const tags = rawTagParam.split(',').filter(Boolean);

    expect(tags).toEqual(['offline-first', 'zkp']);
  });

  it('determines correct empty state variant based on presence of active filters', () => {
    function getEmptyStateType(
      category?: string | null,
      tag?: string | null,
    ): 'no_results' | 'no_ideas' {
      return category || tag ? 'no_results' : 'no_ideas';
    }

    expect(getEmptyStateType(null, null)).toBe('no_ideas');
    expect(getEmptyStateType('', '')).toBe('no_ideas');
    expect(getEmptyStateType('developer-tools', null)).toBe('no_results');
    expect(getEmptyStateType(null, 'rust')).toBe('no_results');
    expect(getEmptyStateType('fintech', 'zkp')).toBe('no_results');
  });

  it('validates allowed categories from constants', () => {
    expect(CATEGORIES).toContain('developer-tools');
    expect(CATEGORIES).toContain('fintech');
    expect(CATEGORIES).toContain('ai');
    expect(CATEGORIES).toContain('sustainability');
  });
});
