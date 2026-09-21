import type { Variants } from 'framer-motion';

/**
 * Signature Vote Motion System per DESIGN.md §6.3 and §7.2
 * Total sequence duration 640ms, five overlapping stages:
 * - 0ms: Button scale 0.96 (90ms)
 * - 60ms: Expanding ring wave (scale 0.8 -> 1.9, opacity 0.9 -> 0, 420ms)
 * - 90ms: Snappy spring rebound
 * - 120ms: Border & glow cross-fade
 * - 140ms: Count roll (old digit up/out, new digit up from below, 260ms)
 * - 200ms: Icon swaps to filled with spring pop (scale 1 -> 1.18 -> 1)
 * - 260ms: Quota pip extinguishes
 *
 * Reduced Motion (DESIGN.md §6.5):
 * Instant state change, feedback preserved, zero transform/scale/drift.
 */

export const voteRing: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1.9,
    opacity: [0, 0.9, 0],
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.06 },
  },
};

export const countRoll: Variants = {
  initial: (reduce: boolean) => (reduce ? { y: 0, opacity: 1 } : { y: 14, opacity: 0 }),
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (reduce: boolean) =>
    reduce
      ? { y: 0, opacity: 0 }
      : { y: -14, opacity: 0, transition: { duration: 0.18, ease: [0.7, 0, 0.84, 0] } },
};

export const iconPop: Variants = {
  initial: { scale: 1 },
  pop: (reduce: boolean) =>
    reduce
      ? { scale: 1 }
      : {
          scale: [1, 1.18, 1],
          transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
        },
};

export const rejectionShake: Variants = {
  initial: { x: 0 },
  shake: (reduce: boolean) =>
    reduce
      ? { x: 0 }
      : {
          x: [0, -6, 5, -3, 0],
          transition: { duration: 0.26, ease: 'easeInOut' },
        },
};
