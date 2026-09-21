/**
 * Framer Motion spring presets and animations per DESIGN.md §6.2, §6.4
 */

export const spring = {
  rank: { type: 'spring' as const, stiffness: 420, damping: 32 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 28 },
  smooth: { type: 'spring' as const, stiffness: 300, damping: 30 },
};

export const ease = {
  standard: [0.2, 0, 0, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  out: [0.16, 1, 0.3, 1] as const,
};
