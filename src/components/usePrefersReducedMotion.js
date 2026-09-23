import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the OS "reduce motion" setting so scripted scrolling can fall back
 * to an instant jump — the CSS-only rules in index.css cannot reach
 * window.scrollTo / element.scrollBy.
 */
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true,
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia(QUERY);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** 'auto' | 'smooth', ready to hand to scrollTo / scrollBy / scrollIntoView. */
export function useScrollBehavior() {
  return usePrefersReducedMotion() ? 'auto' : 'smooth';
}
