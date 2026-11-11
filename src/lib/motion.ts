import { type RefObject, useLayoutEffect, useRef } from 'react';

/* Motion helpers (BUILD.md §4). No dependencies. Velocity is always px/s. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Apple's rubber band: resistance grows with distance. Works for negative offsets too. */
export function rubberband(offset: number, dimension: number, c = 0.55): number {
  const o = Math.abs(offset);
  const r = (1 - 1 / ((o * c) / dimension + 1)) * dimension;
  return offset < 0 ? -r : r;
}

/** Apple's projection: where a flick of `velocity` (px/s) would come to rest. */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export interface SpringOptions {
  from: number;
  to: number;
  /** Initial velocity in units/s (carry it over from the gesture). */
  velocity?: number;
  /** Perceptual duration in seconds (Apple "response"). Default .35 */
  response?: number;
  /** Damping ratio. 1 = critically damped (no overshoot, default). <1 bounces. */
  damping?: number;
  onUpdate: (value: number) => void;
  /** Rest threshold in value units (default .1, tuned for px). Use ~.001 for 0..1 values. */
  restDelta?: number;
  /** Jump straight to `to` under prefers-reduced-motion (default true). */
  respectReducedMotion?: boolean;
}

export interface SpringHandle {
  /** Cancel now. The promise resolves (never rejects). */
  stop: () => void;
  promise: Promise<void>;
}

/** Spring a number from `from` to `to`, carrying velocity. rAF + fixed-step integration. */
export function spring(opts: SpringOptions): SpringHandle {
  const { from, to, onUpdate, response = 0.35, damping = 1, restDelta = 0.1 } = opts;
  let resolve: () => void = () => {};
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  if (opts.respectReducedMotion !== false && prefersReducedMotion()) {
    onUpdate(to);
    resolve();
    return { stop: () => {}, promise };
  }

  const omega = (2 * Math.PI) / response;
  const k = omega * omega; // stiffness (mass = 1)
  const c = 2 * damping * omega; // damping coefficient
  const step = 1 / 240;
  let x = from;
  let v = opts.velocity ?? 0;
  let last = performance.now();
  let raf = 0;
  let done = false;

  const finish = (snap: boolean) => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    if (snap) onUpdate(to);
    resolve();
  };

  const frame = (now: number) => {
    let dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    while (dt > 0) {
      const h = Math.min(step, dt);
      v += (-k * (x - to) - c * v) * h;
      x += v * h;
      dt -= h;
    }
    if (Math.abs(x - to) < restDelta && Math.abs(v) < restDelta * 5) {
      finish(true);
      return;
    }
    onUpdate(x);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { stop: () => finish(false), promise };
}

/**
 * Sliding pill/underline indicator (M7/M8). Attach the returned ref to an absolutely
 * positioned `<span className="slide-ind" />` inside `containerRef` (which must be
 * `position: relative`). The active child is the one with `data-key={activeKey}`.
 * First paint is placed without a transition; later changes animate via CSS.
 * `box: true` also sets height + translateY (use for 2D grids of cells).
 */
export function useSlidingIndicator<T extends HTMLElement = HTMLSpanElement>(
  containerRef: RefObject<HTMLElement | null>,
  activeKey: string | number | null | undefined,
  options: { box?: boolean } = {}
): RefObject<T | null> {
  const indRef = useRef<T>(null);
  const box = options.box === true;
  const keyRef = useRef(activeKey);
  keyRef.current = activeKey;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const ind = indRef.current;
    if (!container || !ind) return;

    const place = (instant: boolean) => {
      const key = keyRef.current;
      const target =
        key == null
          ? null
          : container.querySelector<HTMLElement>(`[data-key="${String(key).replace(/"/g, '\\"')}"]`);
      if (!target) {
        ind.removeAttribute('data-measured');
        return;
      }
      if (instant) ind.removeAttribute('data-ready');
      const c = container.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const x = t.left - c.left - container.clientLeft + container.scrollLeft;
      const y = t.top - c.top - container.clientTop + container.scrollTop;
      ind.style.width = `${t.width}px`;
      ind.style.transform = box ? `translate(${x}px, ${y}px)` : `translateX(${x}px)`;
      if (box) ind.style.height = `${t.height}px`;
      ind.setAttribute('data-measured', '');
      if (instant) {
        // commit the un-transitioned position, then enable transitions
        void ind.offsetWidth;
        requestAnimationFrame(() => ind.setAttribute('data-ready', ''));
      }
    };

    const first = !ind.hasAttribute('data-measured');
    place(first);
    if (!first && !ind.hasAttribute('data-ready')) ind.setAttribute('data-ready', '');

    // Re-measure (without animating) when layout moves under us: resize, font load.
    let raf = 0;
    const remeasure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => place(true));
    };
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(remeasure) : null;
    ro?.observe(container);
    for (const child of Array.from(container.children)) ro?.observe(child);
    void document.fonts?.ready.then(remeasure);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [activeKey, box, containerRef]);

  return indRef;
}

/**
 * Reveal-once on scroll (M15, landing only). Put `className="reveal"` and this ref on the
 * element. `data-reveal="pending"` hides it (set before paint); it flips to "done" the first
 * time 15% is visible. Reduced motion and missing IntersectionObserver skip the hidden state.
 */
export function useRevealOnce<T extends HTMLElement = HTMLElement>(
  options: { threshold?: number; rootMargin?: string } = {}
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin } = options;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') {
      el.setAttribute('data-reveal', 'done');
      return;
    }
    el.setAttribute('data-reveal', 'pending');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.setAttribute('data-reveal', 'done');
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
