/**
 * Scroll Depth Tracking Hook
 *
 * Tracks user scroll depth at 25%, 50%, 75%, and 100% milestones.
 * Each milestone is only tracked once per page load to avoid duplicate events.
 *
 * @example
 * // In your main App or Home component:
 * function Home() {
 *   useScrollTracking();
 *   return <div>...</div>;
 * }
 */

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/analytics';

const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollTracking(): void {
  const trackedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Avoid division by zero on short pages
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      // Check each threshold
      for (const threshold of SCROLL_THRESHOLDS) {
        if (scrollPercent >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackScrollDepth(threshold);
        }
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position (user might have scrolled before JS loaded)
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

export default useScrollTracking;
