import { describe, it, expect } from 'vitest';

describe('Qualification & Divergence Rules [T-3.23, T-3.24, RULES.md BR-033]', () => {
  it('calculates qualification progress accurately and detects qualification threshold', () => {
    const threshold = 50;
    const computeProgress = (verified: number, thresh: number) =>
      Math.min(100, Math.round((verified / thresh) * 100));

    expect(computeProgress(0, threshold)).toBe(0);
    expect(computeProgress(25, threshold)).toBe(50);
    expect(computeProgress(38, threshold)).toBe(76);
    expect(computeProgress(50, threshold)).toBe(100);
    expect(computeProgress(65, threshold)).toBe(100);
  });

  it('triggers divergence notice only when gap exceeds 10% (BR-033)', () => {
    const isDivergent = (total: number, verified: number) => {
      if (total <= 0) return false;
      return (total - verified) / total > 0.1;
    };

    // Exactly 10% gap (e.g. 50 total, 45 verified) -> not > 10%
    expect(isDivergent(50, 45)).toBe(false);

    // 10.5% gap (e.g. 200 total, 178 verified -> 22/200 = 11%) -> divergent
    expect(isDivergent(200, 178)).toBe(true);

    // PRD example: 47 votes, 38 verified -> 9/47 = 19.1% -> divergent
    expect(isDivergent(47, 38)).toBe(true);

    // 0% gap -> not divergent
    expect(isDivergent(10, 10)).toBe(false);
  });
});
