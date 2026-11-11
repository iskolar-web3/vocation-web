import { Link } from '@tanstack/react-router';
import { Calendar, Clock, FileText } from 'lucide-react';
import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion, rubberband, project, spring, type SpringHandle } from '../../lib/motion';
import type { CoachCard, InternshipCard } from '../../types/api';
import { Deadline, Disc, Money, Mono, Segmented, Status, moneyFrom } from '../ui';
import { FigmaCursor, type Pt, TAG_OFFSET, cursorKit, dist, travelFor } from './figmaCursor';

/* M12: the hero stack. An illustrative "week on Vocation": three cards, the front one is live.
   Static sample copy, captioned as an example; its links go to real routes. */

type Key = 'interview' | 'role' | 'resume';
const KEYS: Key[] = ['interview', 'role', 'resume'];
const LABEL: Record<Key, string> = { interview: 'Interview', role: 'Role', resume: 'Resume' };
const NOTES = [
  'Lead with your org’s attendance app, not the objective line.',
  'Turn “helped with the website” into what you built and for whom.',
  'One page. Cut the seminar list.',
];

interface Geo {
  desk: boolean;
  dx: number;
  cw: number;
  anchor: number;
}
const SCALE_DESK = [1, 0.96, 0.92];
const SCALE_MOB = [1, 0.95, 0.9];
const DIM = [0, 0.18, 0.34];
const lerpAt = (arr: number[], d: number) => {
  const c = Math.max(0, Math.min(arr.length - 1, d));
  const i = Math.min(Math.floor(c), arr.length - 2);
  return arr[i] + (arr[i + 1] - arr[i]) * (c - i);
};

/** A sample slot two days out at 7 PM Manila, so the example never goes stale. */
function sampleSlot(): string {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date(Date.now() + 2 * 86_400_000));
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
      .formatToParts(new Date(`${ymd}T19:00:00+08:00`))
      .map((x) => [x.type, x.value])
  );
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute} ${String(p.dayPeriod).toUpperCase()}`;
}

/** The cursor demo plays at most once per browser session. */

interface Props {
  coach?: CoachCard;
  role?: InternshipCard;
}

export function WeekStack({ coach, role }: Props) {
  const [order, setOrder] = useState<Key[]>(KEYS);
  const [notesOpen, setNotesOpen] = useState(false);
  const [live, setLive] = useState('');
  const slot = useMemo(sampleSlot, []);

  const wkRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const demoOn = useRef(false);
  const freezeTilt = useRef<() => void>(() => {});
  const groupRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Partial<Record<Key, HTMLElement | null>>>({});
  const orderRef = useRef<Key[]>(KEYS);
  const geo = useRef<Geo>({ desk: false, dx: 0, cw: 400, anchor: 36 });
  const depth = useRef<Record<Key, number>>({ interview: 0, role: 1, resume: 2 });
  const dragX = useRef<Record<Key, number>>({ interview: 0, role: 0, resume: 0 });
  const springs = useRef<Partial<Record<string, SpringHandle>>>({});
  const refocus = useRef(false);
  const swallow = useRef(false);

  const firstName = coach ? coach.display_name.replace(/^(Engr|Dr|Atty|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(' ')[0] : '';

  /* ── rendering: transform from continuous depth, z from depth, dim from depth ── */
  const paint = (k: Key) => {
    const el = cardRefs.current[k];
    if (!el) return;
    const g = geo.current;
    const d = depth.current[k];
    const s = lerpAt(g.desk ? SCALE_DESK : SCALE_MOB, d);
    const x = (g.desk ? g.dx * d : 0) + dragX.current[k];
    const y = g.desk ? -120 * d : -18 * d;
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    el.style.zIndex = String(Math.round(300 - d * 100));
    el.style.setProperty('--dim', String(lerpAt(DIM, d)));
  };
  const paintAll = () => KEYS.forEach(paint);

  const fit = () => {
    const stage = stageRef.current;
    const front = cardRefs.current[orderRef.current[0]];
    if (stage && front) stage.style.height = `${geo.current.anchor + front.offsetHeight}px`;
  };

  const measure = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const W = stage.clientWidth;
    const desk = window.matchMedia('(min-width: 1024px)').matches;
    const dx = desk ? 56 : 0;
    const cw = desk ? Math.min(400, W - 2 * dx) : Math.min(420, W);
    geo.current = { desk, dx, cw, anchor: desk ? 240 : 36 };
    stage.style.setProperty('--cw', `${cw}px`);
    stage.style.setProperty('--cl', `${desk ? 0 : (W - cw) / 2}px`);
    stage.style.setProperty('--anchor', `${geo.current.anchor}px`);
  };

  const run = (id: string, from: number, to: number, apply: (v: number) => void, velocity = 0, restDelta = 0.001) => {
    springs.current[id]?.stop();
    if (from === to) return;
    springs.current[id] = spring({ from, to, velocity, response: 0.4, restDelta, onUpdate: apply });
  };

  const show = (next: Key[], vx = 0, dragged?: Key) => {
    const cur = orderRef.current;
    if (next.join() === cur.join()) return;
    const stage = stageRef.current;
    refocus.current = !!stage && stage.contains(document.activeElement) && document.activeElement !== stage;
    orderRef.current = next;
    setOrder(next);
    if (next[0] !== 'resume') setNotesOpen(false);
    next.forEach((k, i) => {
      run(`d-${k}`, depth.current[k], i, (v) => {
        depth.current[k] = v;
        paint(k);
      });
    });
    if (dragged) {
      run(
        `x-${dragged}`,
        dragX.current[dragged],
        0,
        (v) => {
          dragX.current[dragged] = v;
          paint(dragged);
        },
        vx,
        0.1
      );
    }
    if (prefersReducedMotion()) groupRef.current?.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 150 });
    const title = next[0] === 'interview' ? 'Mock interview' : next[0] === 'role' ? 'The role' : 'Resume review';
    setLive(`Showing card ${KEYS.indexOf(next[0]) + 1} of 3: ${title}`);
  };
  const bringFront = (k: Key) => {
    const o = orderRef.current;
    const i = o.indexOf(k);
    show([...o.slice(i), ...o.slice(0, i)]);
  };
  const cycle = (dir: 1 | -1, vx = 0, dragged?: Key) => {
    const o = orderRef.current;
    show(dir > 0 ? [...o.slice(1), o[0]] : [o[2], ...o.slice(0, 2)], vx, dragged);
  };

  /* initial geometry before first paint */
  useLayoutEffect(() => {
    measure();
    paintAll();
    fit();
  });
  useLayoutEffect(() => {
    fit();
    if (refocus.current) {
      refocus.current = false;
      stageRef.current?.focus();
    }
  }, [order, notesOpen]);

  useEffect(() => {
    const stage = stageRef.current;
    const group = groupRef.current;
    if (!stage || !group) return;
    const hero = stage.closest<HTMLElement>('.hero') ?? document.body;

    const ro = new ResizeObserver(() => {
      measure();
      paintAll();
      fit();
      paintGroup();
    });
    ro.observe(stage);
    for (const k of KEYS) {
      const el = cardRefs.current[k];
      if (el) ro.observe(el);
    }
    void document.fonts?.ready.then(fit);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        cycle(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        cycle(-1);
      }
    };
    stage.addEventListener('keydown', onKey);

    /* capture: swallow the click that ends a drag; a tap on a back card brings it forward */
    const onClick = (e: MouseEvent) => {
      if (swallow.current) {
        swallow.current = false;
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      const c = (e.target as HTMLElement).closest<HTMLElement>('[data-k]');
      if (c && c.dataset.front === undefined) {
        e.stopPropagation();
        e.preventDefault();
        bringFront(c.dataset.k as Key);
      }
    };
    stage.addEventListener('click', onClick, true);

    /* drag the front card (pointer capture, 1:1, rubberband past 120px, projection on release) */
    interface Drag {
      id: number;
      k: Key;
      card: HTMLElement;
      x0: number;
      y0: number;
      dx: number;
      moved: boolean;
      s: [number, number][];
    }
    let drag: Drag | null = null;
    const end = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      drag = null;
    };
    const onDown = (e: PointerEvent) => {
      if (drag || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const c = (e.target as HTMLElement).closest<HTMLElement>('[data-k]');
      if (!c || c.dataset.front === undefined || (e.target as HTMLElement).closest('a, button')) return;
      const k = c.dataset.k as Key;
      springs.current[`x-${k}`]?.stop();
      drag = { id: e.pointerId, k, card: c, x0: e.clientX - dragX.current[k], y0: e.clientY, dx: dragX.current[k], moved: false, s: [[e.timeStamp, e.clientX]] };
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
    function onMove(e: PointerEvent) {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (!drag.moved) {
        if (Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) return end();
        if (Math.abs(dx) < 6) return;
        drag.moved = true;
        drag.card.classList.add('is-drag');
        try {
          drag.card.setPointerCapture(drag.id);
        } catch {
          /* pointer already gone */
        }
      }
      e.preventDefault();
      const lim = 120;
      const a = Math.abs(dx);
      drag.dx = dx;
      dragX.current[drag.k] = a <= lim ? dx : Math.sign(dx) * (lim + rubberband(a - lim, geo.current.cw, 0.55));
      paint(drag.k);
      drag.s.push([e.timeStamp, e.clientX]);
      if (drag.s.length > 6) drag.s.shift();
    }
    function onUp(e: PointerEvent) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      if (d.moved) {
        swallow.current = true;
        setTimeout(() => {
          swallow.current = false;
        }, 0);
        d.card.classList.remove('is-drag');
        const [t0, x0] = d.s[0];
        const [t1, x1] = d.s[d.s.length - 1];
        const vx = t1 > t0 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0; // px/s, signed
        const projected = d.dx + project(vx);
        if (Math.abs(projected) > geo.current.cw * 0.4) cycle(1, vx, d.k);
        else run(`x-${d.k}`, dragX.current[d.k], 0, (v) => { dragX.current[d.k] = v; paint(d.k); }, vx, 0.1);
      }
      end();
    }
    stage.addEventListener('pointerdown', onDown);

    /* pointer tilt: desktop, fine pointer, motion allowed */
    const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const cur = { x: 0, y: 0 };
    let tgt = { x: 0, y: 0 };
    let raf = 0;
    const tiltOn = () => geo.current.desk && mqFine.matches && !prefersReducedMotion();
    function paintGroup() {
      group!.style.transform = geo.current.desk
        ? `perspective(1200px) rotateY(${-12 + cur.y}deg) rotateX(${6 + cur.x}deg)`
        : 'none';
    }
    const tick = () => {
      cur.x += (tgt.x - cur.x) * 0.08;
      cur.y += (tgt.y - cur.y) * 0.08;
      paintGroup();
      raf = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    freezeTilt.current = () => {
      tgt = { x: cur.x, y: cur.y };
    };
    const onHeroMove = (e: PointerEvent) => {
      if (demoOn.current || !tiltOn() || e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 200)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 200)));
      tgt = { x: -ny * 6, y: nx * 6 };
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onHeroLeave = () => {
      tgt = { x: 0, y: 0 };
      if (!raf && tiltOn()) raf = requestAnimationFrame(tick);
    };
    hero.addEventListener('pointermove', onHeroMove);
    hero.addEventListener('pointerleave', onHeroLeave);
    paintGroup();

    const sp = springs.current;
    return () => {
      ro.disconnect();
      stage.removeEventListener('keydown', onKey);
      stage.removeEventListener('click', onClick, true);
      stage.removeEventListener('pointerdown', onDown);
      hero.removeEventListener('pointermove', onHeroMove);
      hero.removeEventListener('pointerleave', onHeroLeave);
      cancelAnimationFrame(raf);
      end();
      for (const h of Object.values(sp)) h?.stop();
    };
    // handlers read refs only, so one subscription is enough
  }, []);

  /* Cursor demo (hero): once per page load, after the entrance, when the stack is >=60% visible.
     Clicks through the cards via the same bringFront() a real tap uses. The user always wins:
     any real pointer/touch/wheel/key/focus cancels it (cursor fades in 150ms, stack stays put). */
  useEffect(() => {
    const wk = wkRef.current;
    const stage = stageRef.current;
    if (!wk || !stage || prefersReducedMotion() || typeof IntersectionObserver !== 'function' || typeof wk.animate !== 'function') return;
    let dead = false;
    let interacted = false;
    let started = false;
    let timer = 0;
    let raf = 0;
    let stopDemo: () => void = () => {};

    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        timer = window.setTimeout(() => (dead ? rej(new Error('stop')) : res()), Math.max(0, ms));
      });
    const settled = () =>
      new Promise<void>((res, rej) => {
        const t0 = performance.now();
        const tick = () => {
          if (dead) return rej(new Error('stop'));
          const ok = orderRef.current.every((k, i) => Math.abs(depth.current[k] - i) < 0.003);
          if (ok || performance.now() - t0 > 1200) raf = requestAnimationFrame(() => res());
          else raf = requestAnimationFrame(tick);
        };
        tick();
      });

    /** Tip on the right end of the front card's action button, in .wk coords. */
    const restTip = (): Pt | null => {
      const act = cardRefs.current[orderRef.current[0]]?.querySelector<HTMLElement>('a, button');
      if (!act) return null;
      const r = act.getBoundingClientRect();
      const wr = wk.getBoundingClientRect();
      return { x: r.right - 11 - wr.left, y: r.top + r.height * 0.5 - wr.top };
    };
    /** The cursor never vanishes: whenever the demo can't keep its pose, it rests on the front card's button. */
    const rest = () => {
      const t = restTip();
      if (t) cursorKit(wk).place(t);
    };

    const onUser = () => {
      interacted = true;
      stopDemo();
    };
    const ev: [EventTarget, string][] = [
      [wk, 'pointerdown'],
      [wk, 'wheel'],
      [wk, 'touchstart'],
      [wk, 'focusin'],
      [document, 'keydown'],
    ];
    for (const [t, n] of ev) t.addEventListener(n, onUser, { capture: true, passive: true });

    const start = () => {
      const kit = cursorKit(wk);
      const cur = kit.q('cur');
      const tg = kit.q('tg');
      const rp = kit.q('rp');
      const ringSeg = wk.querySelector<HTMLElement>('.wk-seg-ring');
      if (!cur || !tg || !rp || !ringSeg) return;
      let segBtn: HTMLElement | null = null;
      const tagW = tg.offsetWidth;
      const tagH = tg.offsetHeight;
      const VM = 8;
      demoOn.current = true;
      freezeTilt.current();
      wk.dataset.af = 'play';

      const cleanup = () => {
        demoOn.current = false;
        delete wk.dataset.af;
        segBtn?.removeAttribute('data-demo');
      };
      stopDemo = () => {
        if (dead) return;
        dead = true;
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        demoOn.current = false; // tilt resumes on the very next move
        if (!kit.park()) rest(); // the cursor stays where it is; the user simply takes over
        cleanup();
      };

      const footOk = (x: number, y: number) =>
        x - 2 >= VM &&
        y - 2 >= VM &&
        x + TAG_OFFSET.x + tagW + 2 <= window.innerWidth - VM &&
        y + TAG_OFFSET.y + tagH + 2 <= window.innerHeight - VM;
      const clampFoot = (p: Pt): Pt => ({
        x: Math.min(Math.max(p.x, VM + 2), window.innerWidth - VM - TAG_OFFSET.x - tagW - 2),
        y: Math.min(Math.max(p.y, VM + 2), window.innerHeight - VM - TAG_OFFSET.y - tagH - 2),
      });

      /** Text, icons and controls of every card, in viewport coords: the cursor + tag must stay off them. */
      const busy = () => {
        const out: DOMRect[] = [];
        const rg = document.createRange();
        const w = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (!n.nodeValue?.trim()) continue;
          rg.selectNodeContents(n);
          for (const r of Array.from(rg.getClientRects())) if (r.width > 0) out.push(r);
        }
        for (const el of Array.from(stage.querySelectorAll('svg, .btn, .status, .wk-head > :first-child'))) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) out.push(r);
        }
        return out;
      };
      const gap = (x: number, y: number, r: DOMRect) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));

      interface Tgt {
        tip: Pt; // viewport
        ring: HTMLElement;
        press: HTMLElement | null;
      }
      /** A tip on a visible, empty part of a back card: on the card, no text/icon under the tip or the tag. */
      const onCard = (k: Key): Tgt | null => {
        const card = cardRefs.current[k];
        if (!card || card.dataset.front !== undefined) return null;
        const r = card.getBoundingClientRect();
        const ink = busy();
        const pref = { x: r.left + r.width * 0.72, y: r.top + 24 };
        const hit = (x: number, y: number) => document.elementFromPoint(x, y)?.closest('[data-k]') === card;
        const cand: (Pt & { sc: number })[] = [];
        for (let y = Math.max(r.top, VM); y < Math.min(r.bottom, window.innerHeight); y += 5) {
          for (let x = r.left; x < r.right; x += 6) {
            if (!footOk(x, y)) continue;
            const L = x - 2 - 3;
            const T = y - 2 - 3;
            const R = x + TAG_OFFSET.x + tagW + 3;
            const B = y + TAG_OFFSET.y + tagH + 3;
            if (ink.some((i) => i.left < R && i.right > L && i.top < B && i.bottom > T)) continue;
            const clear = Math.min(20, ...ink.map((i) => gap(x, y, i)));
            cand.push({ x, y, sc: clear * 2 - dist({ x, y }, pref) * 0.06 });
          }
        }
        // hit-test (the expensive part) best-first: the first candidate wholly on this card wins
        cand.sort((a, b) => b.sc - a.sc);
        const best = cand.find(({ x, y }) => hit(x, y) && hit(x - 22, y) && hit(x + 22, y) && hit(x, y - 6) && hit(x, y + 6)) ?? null;
        const ring = card.querySelector<HTMLElement>('.wk-ring');
        return best && ring ? { tip: { x: best.x, y: best.y }, ring, press: card } : null;
      };
      /** A tip on a segmented-control button; the ring is a floating pill because the control never moves under it. */
      const onSeg = (k: Key): Tgt | null => {
        const b = wk.querySelector<HTMLElement>(`.seg [data-key="${k}"]`);
        if (!b) return null;
        const r = b.getBoundingClientRect();
        const wr = wk.getBoundingClientRect();
        let best: Pt | null = null;
        let bs = -Infinity;
        const pref = { x: r.left + r.width * 0.55, y: r.bottom - 7 }; // below the label: the tag then hangs under the control
        for (let y = r.top + 4; y < r.bottom - 2; y += 3) {
          for (let x = r.left + 4; x < r.right - 4; x += 4) {
            if (!footOk(x, y)) continue;
            const sc = -dist({ x, y }, pref);
            if (sc > bs) {
              bs = sc;
              best = { x, y };
            }
          }
        }
        if (!best) return null;
        segBtn?.removeAttribute('data-demo');
        segBtn = b;
        b.setAttribute('data-demo', '');
        Object.assign(ringSeg.style, {
          left: `${r.left - wr.left}px`,
          top: `${r.top - wr.top}px`,
          width: `${r.width}px`,
          height: `${r.height}px`,
        });
        return { tip: best, ring: ringSeg, press: null };
      };

      const plan: { k: Key; seg: boolean }[] = [
        { k: 'role', seg: false },
        { k: 'resume', seg: false },
        { k: 'interview', seg: true },
      ];
      let pos: Pt | null = null; // cursor position, relative to .wk
      let endAt = 0;
      const run = async () => {
        for (const [i, s] of plan.entries()) {
          const last = i === plan.length - 1;
          const t = (!s.seg && onCard(s.k)) || onSeg(s.k);
          if (!t) return stopDemo();
          const wr = wk.getBoundingClientRect();
          const rel = (p: Pt): Pt => ({ x: p.x - wr.left, y: p.y - wr.top });
          const tip = rel(t.tip);
          const first = pos === null;
          const from = pos ?? rel(clampFoot({ x: t.tip.x + 110, y: t.tip.y + 130 }));
          rp.style.transform = `translate(${tip.x}px,${tip.y}px)`;
          const t0 = performance.now();
          if (first) kit.fade(cur, 0, 150, 0, 1);
          const A = kit.glide(from, tip, 0, travelFor(dist(from, tip)), 0.8, first);
          const K = kit.arrive(A, t.ring, t.press, rp, 0.97, 'scale');
          kit.fade(t.ring, K + (s.seg ? 140 : 320), s.seg ? 160 : 200, 1, 0, 'forwards');
          // last: the cursor rests (and stays) clear of every label. Right of the segmented control when it
          // fits; otherwise (phones) just under the caption, right-aligned with the control.
          const drift = rel(clampFoot({ x: t.tip.x + 26, y: t.tip.y - 22 }));
          const D = kit.glide(tip, drift, K + 110, last ? 420 : 440, 1, false);
          await wait(t0 + K + 80 - performance.now()); // the result lands ~80ms after the click
          if (dead) return;
          bringFront(s.k); // the same path a real tap / segmented click takes
          if (last) {
            endAt = t0 + D + 60;
            pos = drift;
            break;
          }
          await settled(); // measure the next target only after the stack has stopped moving
          await wait(t0 + D + 60 - performance.now()); // never start a glide over the previous drift
          pos = drift;
        }
        // rest: glide onto the end of the front card's action button and stay there for good
        await settled();
        await wait(endAt - performance.now());
        const act = cardRefs.current[orderRef.current[0]]?.querySelector<HTMLElement>('a, button');
        if (act && pos) {
          const r = act.getBoundingClientRect();
          const wr = wk.getBoundingClientRect();
          const v = clampFoot({ x: r.right - 11, y: r.top + r.height * 0.5 }); // tip on the button's end
          const rest = { x: v.x - wr.left, y: v.y - wr.top };
          kit.glide(pos, rest, 0, travelFor(dist(pos, rest)), 0.8, false);
        }
        await Promise.all(kit.anims.map((a) => a.finished));
        if (dead) return;
        dead = true;
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        if (!kit.park()) rest();
        cleanup();
      };
      run().catch(() => stopDemo());
    };

    /** Stack >=60% in view and the segmented control (a click target) on screen too. */
    const inView = () => {
      const s = stage.getBoundingClientRect();
      const c = wk.querySelector('.seg')?.getBoundingClientRect();
      const vis = Math.min(s.bottom, window.innerHeight) - Math.max(s.top, 0);
      return vis >= s.height * 0.6 && !!c && c.top >= 0 && c.bottom <= window.innerHeight - 8;
    };
    const tryStart = () => {
      if (dead || started || !ready) return;
      if (interacted) {
        started = true; // the user took over before the demo began: just show the cursor at rest
        return rest();
      }
      if (document.visibilityState !== 'visible' || !inView()) return;
      started = true;
      start();
    };
    let ready = false;
    const onVis = () => {
      if (started && document.visibilityState !== 'visible') stopDemo();
      else tryStart();
    };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(
      (es) => {
        if (started && es[es.length - 1].intersectionRatio < 0.3) stopDemo();
        else tryStart();
      },
      { threshold: [0, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );
    io.observe(wk);
    // layout moved: re-seat the resting cursor on the button (stops a running demo first)
    const onResize = () => {
      if (!started) return;
      stopDemo();
      rest();
    };
    window.addEventListener('resize', onResize);

    // after the hero entrance (the cards' own CSS animations) and fonts
    const cards = KEYS.map((k) => cardRefs.current[k]).filter((c): c is HTMLElement => !!c);
    void Promise.all([
      document.fonts?.ready,
      ...cards.flatMap((c) => c.getAnimations().map((a) => a.finished.catch(() => {}))),
    ])
      .then(() => new Promise((r) => setTimeout(r, 350)))
      .then(() => {
        ready = true;
        tryStart();
      });

    return () => {
      dead = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      for (const [t, n] of ev) t.removeEventListener(n, onUser, { capture: true });
      if (started) {
        demoOn.current = false;
        delete wk.dataset.af;
      }
    };
    // reads refs and stable setters only
  }, []);

  const regs = useMemo(
    () =>
      Object.fromEntries(
        KEYS.map((k) => [
          k,
          (el: HTMLElement | null) => {
            cardRefs.current[k] = el;
          },
        ])
      ) as Record<Key, (el: HTMLElement | null) => void>,
    []
  );
  const cardProps = (k: Key, title: string) => {
    const i = order.indexOf(k);
    return {
      ref: regs[k],
      className: 'wk-card glass',
      'data-k': k,
      'data-front': i === 0 ? '' : undefined,
      'aria-hidden': i === 0 ? undefined : true,
      'aria-roledescription': 'slide',
      'aria-label': title,
      style: { '--ci': KEYS.indexOf(k) } as CSSProperties,
    };
  };

  return (
    <div className="wk" ref={wkRef}>
      <div
        ref={stageRef}
        className="wk-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Example week on Vocation"
      >
        <div ref={groupRef} className="wk-group">
          <article {...cardProps('interview', 'Mock interview')}>
            <div className="wk-head">
              <Disc name={coach?.display_name ?? 'Your coach'} size="sm" src={coach?.avatar_url} />
              <div>
                <p className="wk-title">Mock interview</p>
                <p className="wk-sub">with {coach?.display_name ?? 'a coach'}</p>
              </div>
            </div>
            <div className="wk-foot">
              <span className="wk-when">
                <Calendar aria-hidden="true" />
                <span className="num">{slot}</span>
                <span className="wk-in">in 2 days</span>
              </span>
              <Status status="confirmed" />
            </div>
            <span className="af-ov wk-ring" aria-hidden="true" />
            <div className="wk-act">
              {coach ? (
                <Link to="/coaches/$slug" params={{ slug: coach.slug }} className="btn btn-secondary btn-sm">
                  See {firstName}’s open times
                </Link>
              ) : (
                <Link to="/coaches" className="btn btn-secondary btn-sm">
                  Browse coaches
                </Link>
              )}
            </div>
          </article>

          <article {...cardProps('role', role?.title ?? 'An internship role')}>
            <div className="wk-head">
              <Mono name={role?.company.name ?? 'Your next role'} />
              <div>
                <p className="wk-title">{role?.title ?? 'Your next internship'}</p>
                <p className="wk-sub">{role ? `${role.company.name}, ${role.location}` : 'Open roles, soonest deadline first'}</p>
              </div>
            </div>
            {role ? (
              <div className="wk-foot">
                <Money {...moneyFrom(role)} />
                <Deadline date={role.deadline} />
              </div>
            ) : null}
            <span className="af-ov wk-ring" aria-hidden="true" />
            <div className="wk-act">
              {role ? (
                <Link to="/internships/$slug" params={{ slug: role.slug }} className="btn btn-secondary btn-sm">
                  Open the role
                </Link>
              ) : (
                <Link to="/internships" className="btn btn-secondary btn-sm">
                  Browse internships
                </Link>
              )}
            </div>
          </article>

          <article {...cardProps('resume', 'Resume review')}>
            <div className="wk-head">
              <span className="wk-tile" aria-hidden="true">
                <FileText />
              </span>
              <div>
                <p className="wk-title">Resume review</p>
                <p className="wk-sub">3 notes from your coach</p>
              </div>
            </div>
            <div className="wk-foot">
              <span className="wk-when">
                <Clock aria-hidden="true" />
                <span className="num">30 min</span>
              </span>
              <span className="status status-ok">Ready</span>
            </div>
            <ol className="wk-notes" id="wk-notes" hidden={!notesOpen}>
              {NOTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ol>
            <span className="af-ov wk-ring" aria-hidden="true" />
            <div className="wk-act">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                aria-expanded={notesOpen}
                aria-controls="wk-notes"
                onClick={() => setNotesOpen((o) => !o)}
              >
                {notesOpen ? 'Hide notes' : 'Read the 3 notes'}
              </button>
            </div>
          </article>
        </div>
      </div>
      <div className="wk-ctl">
        <Segmented
          label="Choose a card"
          value={order[0]}
          onValueChange={(v) => bringFront(v as Key)}
          options={KEYS.map((k) => ({ value: k, label: LABEL[k] }))}
        />
        <p className="t-meta">An example week. Tap a card.</p>
      </div>
      <span className="af-ov wk-seg-ring" aria-hidden="true" />
      <span className="af-rp" data-af-el="rp" aria-hidden="true">
        <i />
      </span>
      <FigmaCursor />
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </div>
  );
}
