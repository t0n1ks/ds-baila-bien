import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Anchor navigation that survives HashRouter: the URL hash is owned by the
 * router, so section jumps are done by scrolling to the element instead —
 * and from a legal page we route home first, then scroll.
 */
export default function useAnchorNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id) => {
      const scroll = () => {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ block: 'start' });
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
    [navigate, pathname],
  );
}
