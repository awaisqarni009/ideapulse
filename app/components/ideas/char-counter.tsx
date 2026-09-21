'use client';

import React from 'react';

interface CharCounterProps {
  current: number;
  max: number;
  min?: number;
  id?: string;
}

export function CharCounter({ current, max, min, id }: CharCounterProps) {
  const ratio = current / max;
  const isBelowMin = min !== undefined && current < min && current > 0;
  const isOverMax = current > max;
  const isNearLimit = ratio >= 0.95 && !isOverMax;
  const isWarningZone = ratio >= 0.8 && ratio < 0.95;

  let colorClass = 'text-[var(--text-tertiary)]';

  if (isOverMax) {
    colorClass = 'text-[var(--accent-danger)] font-medium';
  } else if (isNearLimit) {
    colorClass = 'text-[var(--accent-warning)] font-medium';
  } else if (isWarningZone) {
    colorClass = 'text-[var(--text-secondary)]';
  }

  return (
    <div
      id={id}
      aria-live="polite"
      className={`text-xs tabular-nums transition-colors duration-150 ${colorClass}`}
    >
      {min !== undefined && current < min && (
        <span className="mr-2 text-[var(--text-tertiary)]">Min: {min}</span>
      )}
      <span>
        {current}/{max}
      </span>
    </div>
  );
}
