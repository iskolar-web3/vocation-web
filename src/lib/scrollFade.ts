import { type RefObject, useEffect } from 'react';

/** Sets data-fade-l / data-fade-r while more of a horizontally scrolling control is hidden on that side. */
/** `mounted` re-runs the setup when the strip is rendered conditionally. */
export function useScrollFade(ref: RefObject<HTMLElement | null>, mounted: unknown = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.toggleAttribute('data-fade-l', max > 1 && el.scrollLeft > 1);
      el.toggleAttribute('data-fade-r', max > 1 && el.scrollLeft < max - 1);
    };
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null;
    ro?.observe(el);
    for (const c of Array.from(el.children)) ro?.observe(c);
    return () => {
      el.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [ref, mounted]);
}
