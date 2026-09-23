import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScrollBehavior } from './usePrefersReducedMotion.js';

/**
 * Anchor navigation that survives HashRouter: the URL hash is owned by the
 * router, so section jumps are done by scrolling to the element instead —
 * and from a legal page we route home first, then scroll.
 */
export default function useAnchorNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const behavior = useScrollBehavior();

  return useCallback(
    (id) => {
      const scroll = () => {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ block: 'start', behavior });
        // Move keyboard focus with the view, not just the viewport.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };

      if (pathname !== '/') {
        navigate('/');
        requestAnimationFrame(() => requestAnimationFrame(scroll));
      } else {
        scroll();
      }
    },
    [behavior, navigate, pathname],
  );
}

/** Back to the very top — routing home first when we are on a legal page. */
export function useGoToTop() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const behavior = useScrollBehavior();

  return useCallback(() => {
    const scroll = () => window.scrollTo({ top: 0, behavior });

    if (pathname !== '/') {
      navigate('/');
      // The new route has to paint before scrolling means anything.
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    } else {
      scroll();
    }
  }, [behavior, navigate, pathname]);
}
