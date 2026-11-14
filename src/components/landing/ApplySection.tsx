import { ArrowRight, ArrowUpRight, ExternalLink, RotateCcw } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import { useInternship } from '../../services/queries';
import type { InternshipCard } from '../../types/api';
import { FigmaCursor, type Pt, cursorKit, dist, travelFor } from './figmaCursor';

const STACK = '(max-width: 899px)';

/**
 * One-shot BR-001 demo (~3.8s), plays as soon as the cards are ~70% on screen, and on Replay. Armed (panels hidden) by JS
 * only (data-af), so no-JS / no-observer / reduced-motion show the static design. All motion is
 * WAAPI on transform/opacity/clip-path with delays on one timeline; geometry is measured once at
 * the start (resize -> cancel + finish). A fake "DLSU student" multiplayer cursor drives it.
 * Stacked layout: the move to step 3 waits until panel 3 is >=60% visible.
 */
function playDemo(stage: HTMLElement, onEnd: () => void): () => void {
  const all = (k: string) => Array.from(stage.querySelectorAll<HTMLElement>(`[data-af-el="${k}"]`));
  const q = (k: string) => all(k)[0] ?? null;
  const kit = cursorKit(stage);
  kit.unpark();
  const { go, fade, glide, arrive, anims } = kit;
  let live = true;
  let io: IntersectionObserver | undefined;
  const w0 = window.innerWidth;
  const stop = () => {
    live = false;
    io?.disconnect();
    window.removeEventListener('resize', onResize);
    for (const a of anims) a.cancel();
  };
  const finish = () => {
    if (!live) return;
    kit.park(); // the cursor stays where it ended
    stop();
    stage.dataset.af = 'done';
    onEnd();
  };
  function onResize() {
    if (window.innerWidth !== w0) finish(); // ignore mobile URL-bar height jitter
  }
  window.addEventListener('resize', onResize);

  // ---- measure once ----
  const sr = stage.getBoundingClientRect();
  const rel = (el: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height } : { x: 0, y: 0, w: 0, h: 0 };
  };
  const a = rel(q('card'));
  const b = rel(q('pill'));
  const p1: Pt = { x: Math.min(a.x + a.w * 0.9, sr.width - 96), y: a.y + a.h * 0.78 };
  // tip in the pill's right padding, high enough that the tag clears the chip below
  const p2: Pt = { x: b.x + b.w - 10, y: b.y + b.h * 0.18 };
  const p0: Pt = { x: Math.max(6, a.x - 70), y: a.y + a.h + 70 };
  const lens = all('track').map((t) => (t.clientHeight > t.clientWidth ? t.clientHeight : t.clientWidth));
  const vert = all('track').map((t) => t.clientHeight > t.clientWidth);
  const stacked = window.matchMedia(STACK).matches;
  const [rp1, rp2] = all('rp');
  if (rp1) rp1.style.transform = `translate(${p1.x}px,${p1.y}px)`;
  if (rp2) rp2.style.transform = `translate(${p2.x}px,${p2.y}px)`;

  // ---- phase 1: cursor enters, hovers + clicks the role card, step 2 resolves (panels are already visible) ----
  const E = 120;
  fade(q('cur'), E, 150, 0, 1);
  const A1 = glide(p0, p1, E, travelFor(dist(p0, p1), 650, 900), 0.8, true);
  const K1 = arrive(A1, q('edge'), q('card'), rp1 ?? null, 0.97);
  fade(q('edge'), K1 + 320, 200, 1, 0, 'forwards');

  const comet = (i: number, at: number) => {
    const c = all('comet')[i];
    const ax = vert[i] ? 'translateY' : 'translateX';
    go(c, [{ opacity: 1, transform: `${ax}(-24px)` }, { opacity: 1, transform: `${ax}(${lens[i]}px)` }], at, 380, { easing: 'cubic-bezier(0.5, 0, 0.5, 1)', fill: 'none' });
    go(
      all('lit')[i],
      [{ opacity: 0, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.3)', offset: 0.3 }, { opacity: 0, transform: 'scale(1)' }],
      at + 380,
      300,
      { fill: 'none' }
    );
  };
  const C1 = K1 + 80; // result follows the click
  comet(0, C1);
  const D = C1 + 380; // comet lands: step 2 resolves
  go(q('focus'), [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], D, 850, { fill: 'none' });
  go(q('dom'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], D, 420);
  go(q('bar'), [{ opacity: 1, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], D, 600, { easing: 'linear' });
  fade(q('bar'), D + 600, 200, 1, 0, 'forwards');

  // ---- phase 2: cursor travels (arc) to the pill while step 2 finishes, hover, click, chip, stay on the pill ----
  const phase2 = (L: number) => {
    const travel = travelFor(dist(p1, p2), 650, 950);
    const A2 = glide(p1, p2, L, travel, stacked ? 1 : 0.7, false);
    comet(1, A2 - 330);
    const K2 = arrive(A2, q('pedge'), q('pill'), rp2 ?? null, 0.97);
    const icon = q('icon');
    go(icon, [{ opacity: 1, transform: 'translate(0,0)' }, { opacity: 0, transform: 'translate(6px,-6px)' }], K2, 150, { fill: 'forwards' });
    go(icon, [{ opacity: 0, transform: 'translate(-6px,6px)' }, { opacity: 1, transform: 'translate(0,0)' }], K2 + 150, 220, { fill: 'forwards' });
    go(q('chip'), [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], K2 + 80, 300);
    fade(q('pedge'), K2 + 320, 200, 1, 0, 'forwards');
    // no drift: the cursor stays parked on the pill it just clicked
    Promise.all(anims.map((x) => x.finished)).then(finish, () => {});
  };

  stage.dataset.af = 'play';
  const t0 = performance.now();
  if (!stacked) {
    phase2(D + 160);
  } else {
    const p3 = all('step')[2];
    if (p3) {
      io = new IntersectionObserver(
        (es) => {
          if (!live || !es.some((e) => e.intersectionRatio >= 0.6)) return;
          io?.disconnect();
          phase2(Math.max(0, D + 160 - (performance.now() - t0))); // never overlap phase 1's cursor
        },
        { threshold: [0, 0.3, 0.6, 1] }
      );
      io.observe(p3);
    }
  }
  return stop;
}

function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** BR-001: apply is an outbound redirect. The domain comes from the role's own apply URL. */
export function ApplySection({ role }: { role?: InternshipCard }) {
  const host = hostOf(useInternship(role?.slug ?? '').data?.external_apply_url);
  const title = role?.title ?? 'A role you like';
  const company = role ? `${role.company.name}, ${role.location}` : 'Company, City';
  const where = host ?? 'the company’s own site';
  const stageRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const [canReplay, setCanReplay] = useState(false);
  const reduce = prefersReducedMotion();

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.dataset.af = 'done';
      return;
    }
    if (typeof IntersectionObserver !== 'function') return;
    let stop = () => {};
    let alive = true;
    const start = () => {
      stop();
      setCanReplay(false);
      stop = playDemo(el, () => alive && setCanReplay(true));
    };
    replayRef.current = start;
    el.dataset.af = 'armed';
    // Start almost instantly once the cards are mostly on screen (70% of the card row, or of the first
    // panel when stacked taller than the screen), even mid-scroll, so a fast scroller still catches it.
    let fired = false;
    const watchable = () => {
      const r = el.getBoundingClientRect();
      const tall = r.height > window.innerHeight * 0.8;
      const t = tall ? (el.querySelector('[data-af-el="step"]')?.getBoundingClientRect() ?? r) : r;
      const vis = Math.min(t.bottom, window.innerHeight) - Math.max(t.top, 64);
      return document.visibilityState === 'visible' && vis >= t.height * 0.7;
    };
    const check = () => {
      if (fired || !alive || !watchable()) return;
      fired = true;
      io.disconnect();
      window.removeEventListener('scroll', check);
      start();
    };
    const io = new IntersectionObserver(check, { threshold: [0, 0.25, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
    io.observe(el);
    window.addEventListener('scroll', check, { passive: true });
    return () => {
      alive = false;
      window.removeEventListener('scroll', check);
      io.disconnect();
      stop();
      delete el.dataset.af;
    };
  }, []);

  const conn = (
    <div className="af-conn" data-af-el="conn" aria-hidden="true">
      <span className="af-track" data-af-el="track">
        <i className="af-comet" data-af-el="comet" />
      </span>
      <span className="af-hd">
        <ArrowRight />
        <ArrowRight className="af-lit" data-af-el="lit" />
      </span>
    </div>
  );
  const name = host ?? 'their site';
  return (
    <div className="af-root">
      <div className="sh">
        <h2 className="t-h2 af-main-h" id="af-h">
          You apply on their site, not ours
        </h2>
      </div>
      <div className="af-stage" ref={stageRef}>
        <div className="af-steps">
          <div className="panel af-step" data-af-el="step">
            <span className="af-n">1</span>
            <h3 className="af-title">Find a role on Vocation</h3>
            <div className="af-mini" data-af-el="card">
              <span className="af-mono" aria-hidden="true">
                {(role?.company.name ?? 'Company').slice(0, 2).toUpperCase()}
              </span>
              <div className="af-mini-body">
                <p className="ttl">{title}</p>
                <p className="t-meta">{company}</p>
              </div>
              <span className="af-ov af-edge" data-af-el="edge" />
              <span className="af-ov af-wave" data-af-el="wave" />
            </div>
            <p className="af-note">Curated student roles with upfront details.</p>
          </div>
          {conn}
          <div className="panel af-step" data-af-el="step">
            <span className="af-ov af-edge" data-af-el="focus" />
            <span className="af-n">2</span>
            <h3 className="af-title">We show you where you’re going</h3>
            <div className="af-mini">
              <span className="af-mono" aria-hidden="true">
                {(role?.company.name ?? 'Company').slice(0, 2).toUpperCase()}
              </span>
              <div className="af-mini-body">
                <p className="t-meta">Direct link to</p>
                <p className="dom" data-af-el="dom">
                  {where}
                </p>
                <span className="af-bar" data-af-el="bar" />
              </div>
            </div>
            <p className="af-note">Direct verification before you leave.</p>
          </div>
          {conn}
          <div className="panel af-step" data-af-el="step">
            <span className="af-n">3</span>
            <h3 className="af-title">Apply on {name}</h3>
            <div className="af-mini af-mini-act">
              <div className="af-act">
                <span className="af-pill" data-af-el="pill" aria-hidden="true">
                  <span className="af-ov af-pedge" data-af-el="pedge" />
                  Apply on {name} <ArrowUpRight data-af-el="icon" />
                </span>
                <span className="af-chip" data-af-el="chip" aria-hidden="true">
                  <ExternalLink />
                  Opened {name} in a new tab
                </span>
              </div>
            </div>
            <p className="af-note">Their form, their inbox, their follow-up.</p>
          </div>
        </div>
        <span className="af-rp" data-af-el="rp" aria-hidden="true">
          <i />
        </span>
        <span className="af-rp" data-af-el="rp" aria-hidden="true">
          <i />
        </span>
        <FigmaCursor />
      </div>
      <div className="af-foot">
        <p className="af-copy">Vocation never sees or stores your application. The company does.</p>
        {!reduce && (
          <button
            type="button"
            className="af-replay"
            data-show={canReplay ? '' : undefined}
            aria-label="Replay the demo"
            onClick={() => replayRef.current()}
          >
            <RotateCcw aria-hidden="true" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
