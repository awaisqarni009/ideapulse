'use client';

import { useEffect } from 'react';
import { logMetric } from '@/lib/observability/logger';

/**
 * Web Vitals & Speed Insights reporter [T-8.20]
 * Gathers core performance metrics (LCP, FID, CLS, TTFB) from PerformanceObserver.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Observe Paint timings (FCP, LCP)
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          logMetric(`web-vitals.${entry.name}`, Math.round(entry.startTime));
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });

      // Observe Navigation timing (TTFB)
      const navObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const nav = entry as PerformanceNavigationTiming;
          const ttfb = Math.round(nav.responseStart - nav.requestStart);
          logMetric('web-vitals.ttfb', ttfb);
        }
      });
      navObserver.observe({ type: 'navigation', buffered: true });
    } catch {
      // PerformanceObserver fallback ignored gracefully
    }
  }, []);

  return null;
}
