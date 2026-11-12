import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { type SpringHandle, rubberband, spring } from '../../lib/motion';
import { cn } from '../../lib/utils';

/* M2: bottom sheet on Radix Dialog (focus trap, Esc, aria-modal, scroll lock for free).
   Enter/exit are CSS keyframes on [data-state] with an implicit end value, so the inline
   transform set while dragging composes with them (exit continues from where you let go).
   The grabber + header are the only drag zone (touch-action: none); the body scrolls with
   overscroll-behavior: contain. Release: dismiss past 30% of the height or faster than
   0.11 px/ms, else a critically damped spring (response .35s) carries the release velocity. */

const DISMISS_FRACTION = 0.3;
const DISMISS_VELOCITY = 0.11; // px/ms
const VELOCITY_WINDOW = 100; // ms

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children?: ReactNode;
  /** Sticky action bar under the scrolling body (safe-area padded). */
  footer?: ReactNode;
  className?: string;
  overlayClassName?: string;
}

interface DragState {
  id: number;
  startY: number;
  startOffset: number;
  height: number;
  samples: Array<[number, number]>;
}

export function Sheet({ open, onOpenChange, title, children, footer, className, overlayClassName }: SheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const offset = useRef(0);
  const anim = useRef<SpringHandle | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    offset.current = 0;
    return () => anim.current?.stop();
  }, [open]);

  const apply = (value: number, height: number) => {
    offset.current = value;
    const el = contentRef.current;
    if (el) el.style.transform = value === 0 ? '' : `translateY(${value}px)`;
    const scrim = overlayRef.current;
    if (scrim) scrim.style.opacity = value <= 0 ? '' : String(Math.max(0, 1 - value / height));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) return; // ignore extra pointers
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    const el = contentRef.current;
    if (!el) return;
    anim.current?.stop(); // grabbing a returning sheet: continue from where it is
    for (const a of el.getAnimations()) a.finish();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      id: e.pointerId,
      startY: e.clientY,
      startOffset: offset.current,
      height: el.offsetHeight,
      samples: [[e.timeStamp, e.clientY]],
    };
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const raw = d.startOffset + (e.clientY - d.startY); // 1:1, keeps the grab offset
    apply(raw >= 0 ? raw : rubberband(raw, d.height), d.height);
    d.samples.push([e.timeStamp, e.clientY]);
    while (d.samples.length > 2 && e.timeStamp - d.samples[0][0] > VELOCITY_WINDOW) d.samples.shift();
  };

  const release = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    // velocity over the last 100ms before release; a pause before letting go means 0
    const recent = d.samples.filter(([t]) => e.timeStamp - t <= VELOCITY_WINDOW);
    const [t0, y0] = recent[0] ?? [0, 0];
    const [t1, y1] = recent[recent.length - 1] ?? [0, 0];
    const velocity = t1 > t0 ? (y1 - y0) / (t1 - t0) : 0; // px/ms, + = down
    const current = offset.current;
    const dismiss = !cancelled && (current > d.height * DISMISS_FRACTION || velocity > DISMISS_VELOCITY);
    if (dismiss) {
      onOpenChange(false);
      // controlled parent refused to close: come back instead of hanging off-screen
      window.setTimeout(() => {
        if (contentRef.current?.dataset.state === 'open') back(current, 0, d.height);
      }, 80);
      return;
    }
    back(current, velocity * 1000, d.height);
  };

  const back = (from: number, velocityPxPerSec: number, height: number) => {
    anim.current?.stop();
    anim.current = spring({
      from,
      to: 0,
      velocity: velocityPxPerSec,
      response: 0.35,
      damping: 1,
      onUpdate: (v) => apply(v, height),
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay ref={overlayRef} className={cn('sheet-scrim', overlayClassName)} />
        <DialogPrimitive.Content
          ref={contentRef}
          className={cn('sheet glass', footer && 'has-foot', className)}
          aria-describedby={undefined}
        >
          <div
            className={cn('sheet-drag', dragging && 'is-dragging')}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => release(e, false)}
            onPointerCancel={(e) => release(e, true)}
          >
            <div className="grabber" aria-hidden="true" />
            <div className="sheet-head">
              <DialogPrimitive.Title className="sheet-title">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Close className="icon-btn" aria-label="Close">
                <X aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
          </div>
          <div className="sheet-body">{children}</div>
          {footer ? <div className="sheet-foot">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
