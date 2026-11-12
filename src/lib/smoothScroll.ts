import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/* Gentle wheel smoothing (a light "scrolljack"): mouse-wheel / trackpad input eases toward its target
   instead of stepping. Touch stays native (iOS/Android momentum is already right). Off under
   prefers-reduced-motion (Lenis default). Pauses while a Radix dialog/sheet/menu holds its scroll lock, and
   lets nested scrollers (sheets, menus, dialogs) scroll natively. */
export let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true,
    autoToggle: true,
    stopInertiaOnNavigate: true,
    prevent: (node) => !!node.closest('[role="dialog"], [data-lenis-prevent]'),
  });
  // Radix dialogs/sheets/menus lock scroll via body[data-scroll-locked]; Lenis drives window.scrollTo
  // directly, so it must pause while that lock is on or the page would scroll under the overlay.
  const sync = () => (document.body.hasAttribute('data-scroll-locked') ? lenis?.stop() : lenis?.start());
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
}

/** Scroll to top through Lenis when it runs, so the two never fight. */
export function scrollToTop() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lenis) lenis.scrollTo(0, { immediate: reduce });
  else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}
