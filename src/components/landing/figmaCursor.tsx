/* Shared Figma-style multiplayer cursor ("DLSU student"): markup + path / spring / click helpers.
   Used by the apply demo (ApplySection) and the hero stack demo (WeekStack) so both look and
   move identically. All motion is WAAPI on transform/opacity, sampled once, run on the compositor. */

export const OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export type Pt = { x: number; y: number };
export const dist = (p: Pt, r: Pt) => Math.hypot(r.x - p.x, r.y - p.y);

/* Cursor path: a smootherstep target chased by a slightly under-damped spring. Accelerates,
   decelerates, settles with ~1-2% overshoot. Sampled once (16ms) into keyframes; the animation
   then runs on the compositor. y gets its own timing skew so the path is a gentle arc. */
const smoother = (u: number) => u * u * u * (u * (6 * u - 15) + 10);
export function chase(travel: number, skew: number): number[] {
  const W = 24;
  const Z = 0.45;
  const T = travel / 1000;
  const out: number[] = [];
  let x = 0;
  let v = 0;
  for (let i = 0; i < 2400; i++) {
    const t = i / 1000;
    const tg = smoother(Math.min(1, t / T) ** skew);
    v += (W * W * (tg - x) - 2 * Z * W * v) * 0.001;
    x += v * 0.001;
    if (i % 16 === 0) out.push(x);
    if (t > T && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.02) break;
  }
  out.push(1);
  return out;
}

/** Cursor travel time (ms) for a move of `d` px. */
export const travelFor = (d: number, lo = 650, hi = 900) => clamp(520 + d * 0.4, lo, hi);

/** Arrow tip is the origin of the x/y wrappers; the tag is its own trailing layer. Decorative. */
export function FigmaCursor() {
  return (
    <span className="af-cursor" data-af-el="cur" aria-hidden="true">
      <span className="af-mv" data-af-el="ax">
        <span className="af-mv" data-af-el="ay">
          <svg className="af-arrow af-mv" data-af-el="as" width="15" height="21" viewBox="0 0 13 18">
            <path
              d="M5.65 12.37H5.46l-.14.13L.5 16.88V1.2l11.28 11.17z"
              fill="currentColor"
              stroke="#fff"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span className="af-mv" data-af-el="tx">
        <span className="af-mv" data-af-el="ty">
          <span className="af-tag af-mv" data-af-el="tg">
            DLSU student
          </span>
        </span>
      </span>
    </span>
  );
}

/** Cursor footprint relative to the tip: arrow (-2..13, -2..19) plus the tag at (14,18). */
export const TAG_OFFSET = { x: 14, y: 18 };

/** WAAPI helpers bound to a root that contains one <FigmaCursor/>. Times are ms from "now". */
export function cursorKit(root: HTMLElement) {
  const q = (k: string) => root.querySelector<HTMLElement>(`[data-af-el="${k}"]`);
  const anims: Animation[] = [];

  const go = (
    el: Element | null,
    kf: Keyframe[],
    delay: number,
    duration: number,
    o: { easing?: string; fill?: FillMode } = {}
  ) => {
    if (el) anims.push(el.animate(kf, { delay, duration, easing: o.easing ?? OUT, fill: o.fill ?? 'both' }));
  };
  const fade = (el: Element | null, delay: number, duration: number, from: number, to: number, fill: FillMode = 'both') =>
    go(el, [{ opacity: from }, { opacity: to }], delay, duration, { fill });
  /** Press: down in 90ms, back in 180ms (spec), eased out both ways. `prop` = 'scale' composes with an inline transform. */
  const press = (el: Element | null, k: number, at: number, down = 90, up = 180, prop: 'transform' | 'scale' = 'transform') => {
    const v = (s: number): Keyframe => (prop === 'scale' ? { scale: String(s) } : { transform: `scale(${s})` });
    go(
      el,
      [
        { ...v(1), easing: OUT },
        { ...v(k), offset: down / (down + up), easing: OUT },
        v(1),
      ],
      at,
      down + up,
      { easing: 'linear', fill: 'none' }
    );
  };

  /** Cursor move: x and y have separate timing (arc); the tag trails the arrow by 50ms. Returns arrival (ms, relative). */
  const glide = (from: Pt, to: Pt, at: number, travel: number, skewY: number, first: boolean) => {
    const xs = chase(travel, 1);
    const ys = chase(travel, skewY);
    const n = Math.max(xs.length, ys.length);
    const kf = (v: number[], f: number, t: number, ax: 'X' | 'Y'): Keyframe[] =>
      Array.from({ length: n }, (_, i) => ({
        transform: `translate${ax}(${f + (t - f) * (v[Math.min(i, v.length - 1)] ?? 1)}px)`,
        offset: i / (n - 1),
      }));
    const dur = (n - 1) * 16;
    const fill: FillMode = first ? 'both' : 'forwards';
    const lag = 50;
    for (const [i, [ex, ey]] of (
      [
        ['ax', 'ay'],
        ['tx', 'ty'],
      ] as const
    ).entries()) {
      go(q(ex), kf(xs, from.x, to.x, 'X'), at + i * lag, dur, { easing: 'linear', fill });
      go(q(ey), kf(ys, from.y, to.y, 'Y'), at + i * lag, dur, { easing: 'linear', fill });
    }
    return at + travel;
  };

  /** Hover ring in (150ms), tag squash on arrival, then click: arrow .88, target .97, ripple at the tip, result +80ms. */
  const arrive = (
    at: number,
    ring: Element | null,
    target: Element | null,
    rp: Element | null,
    k: number,
    prop: 'transform' | 'scale' = 'transform'
  ) => {
    fade(ring, at, 150, 0, 1, 'forwards');
    go(
      q('tg'),
      [{ transform: 'scale(1)' }, { transform: 'scale(1.06, 0.92)', offset: 0.3 }, { transform: 'scale(1)' }],
      at + 40,
      260,
      { fill: 'none' }
    );
    const click = at + 330;
    press(q('as'), 0.88, click);
    press(q('tg'), 0.94, click);
    press(target, k, click, 90, 180, prop);
    go(rp?.firstElementChild ?? null, [{ opacity: 0.8, transform: 'scale(0.2)' }, { opacity: 0, transform: 'scale(1.15)' }], click, 460, { fill: 'forwards' });
    return click;
  };

  const cancel = () => {
    for (const a of anims) a.cancel();
  };

  /** Interrupted: cancel everything except what keeps the cursor's pose (those are paused), fade it out, then drop all. */
  const release = (hold: Element[], ms: number, done: () => void) => {
    const cur = q('cur');
    const o = cur ? Number.parseFloat(getComputedStyle(cur).opacity) : 0;
    const kept: Animation[] = [];
    for (const a of anims) {
      const t = (a.effect as KeyframeEffect | null)?.target;
      if (t && hold.includes(t as Element)) {
        a.pause();
        kept.push(a);
      } else a.cancel();
    }
    if (!cur || !(o > 0)) {
      cancel();
      done();
      return;
    }
    const out = cur.animate([{ opacity: o }, { opacity: 0 }], { duration: ms, easing: 'linear', fill: 'forwards' });
    anims.push(out);
    out.finished.then(
      () => {
        cancel();
        done();
      },
      () => {}
    );
  };

  /** Park: freeze the cursor where it is now and keep it on screen (it never leaves). */
  const POSE = ['ax', 'ay', 'tx', 'ty'];
  const park = () => {
    const cur = q('cur');
    const shown = !!cur && Number.parseFloat(getComputedStyle(cur).opacity) > 0;
    const pose = POSE.map((k) => q(k)).map((el) => [el, el ? getComputedStyle(el).transform : 'none'] as const);
    cancel();
    if (!cur || !shown) return false;
    for (const [el, t] of pose) if (el) el.style.transform = t;
    cur.style.opacity = '1';
    return true;
  };
  /** Show the cursor still, with its tip at `tip` (root coords). Fallback rest when no pose is worth keeping. */
  const place = (tip: Pt) => {
    cancel();
    for (const [k, v] of [['ax', `translateX(${tip.x}px)`], ['ay', `translateY(${tip.y}px)`], ['tx', `translateX(${tip.x}px)`], ['ty', `translateY(${tip.y}px)`]])
      q(k)?.style.setProperty('transform', v);
    q('cur')?.style.setProperty('opacity', '1');
  };
  /** Undo park before a replay so the timeline owns the cursor again. */
  const unpark = () => {
    q('cur')?.style.removeProperty('opacity');
    for (const k of POSE) q(k)?.style.removeProperty('transform');
  };

  return { q, anims, go, fade, press, glide, arrive, cancel, release, park, place, unpark };
}
