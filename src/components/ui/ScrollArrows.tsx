import { ChevronLeft, ChevronRight } from 'lucide-react';

/* Two pinned arrows for a horizontally scrolling strip. Place both INSIDE the scroller (first and last
   child). They show only on a side that has more content (the strip's data-fade-l / data-fade-r, set by
   useScrollFade) and scroll it by about a page on tap. Decorative for assistive tech: arrow keys and
   native scrolling still work, so they are not focusable. */

function page(e: React.MouseEvent<HTMLElement>, dir: 1 | -1) {
  const el = e.currentTarget.parentElement?.parentElement; // span.scroll-btn > span.scroll-arrow > the strip
  if (!el) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: calm ? 'auto' : 'smooth' });
}

export function ScrollArrows({ side }: { side: 'l' | 'r' }) {
  const Icon = side === 'l' ? ChevronLeft : ChevronRight;
  return (
    <span className="scroll-arrow" data-side={side} aria-hidden="true">
      {/* a span, not a button: page rules like ".seg button" must not restyle it */}
      <span className="scroll-btn" onClick={(e) => page(e, side === 'l' ? -1 : 1)}>
        <Icon />
      </span>
    </span>
  );
}
