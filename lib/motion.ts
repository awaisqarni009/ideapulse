export const ease = {
  drape: [0.16, 1, 0.3, 1],
  settle: [0.32, 0.72, 0, 1],
  snap: [0.4, 0, 0.2, 1],
} as const;

export const dur = {
  micro: 0.16,
  ui: 0.28,
  section: 0.8,
  signature: 1.4,
} as const;

// Near-critically damped: heavy, no overshoot per spec §5.1
export const springHeavy = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 34,
  mass: 1.1,
};

export const spring = {
  heavy: springHeavy,
  smooth: { type: 'spring' as const, stiffness: 260, damping: 34, mass: 1.1 },
  rank: { type: 'spring' as const, stiffness: 300, damping: 30 },
  default: springHeavy,
  type: 'spring' as const,
  stiffness: 260,
  damping: 34,
  mass: 1.1,
};
