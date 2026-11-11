import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import { useSlidingIndicator } from '../../lib/motion';
import { cn } from '../../lib/utils';

/* M7: pill / underline indicator that slides (transform + width, 200ms ease-out) and never
   animates on first paint. Segmented = single-select radio group; Tabs = ARIA tablist. */

export interface Option<T extends string | number> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  /** Tabs only: small count badge. */
  count?: number;
}

function onArrows<T extends string | number>(
  e: KeyboardEvent,
  options: Option<T>[],
  value: T,
  pick: (v: T) => void,
  vertical = false
) {
  const enabled = options.filter((o) => !o.disabled);
  const i = enabled.findIndex((o) => o.value === value);
  const fwd = vertical ? 'ArrowDown' : 'ArrowRight';
  const back = vertical ? 'ArrowUp' : 'ArrowLeft';
  let next = -1;
  if (e.key === fwd || e.key === 'ArrowDown') next = (i + 1) % enabled.length;
  else if (e.key === back || e.key === 'ArrowUp') next = (i - 1 + enabled.length) % enabled.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = enabled.length - 1;
  if (next < 0) return;
  e.preventDefault();
  const target = enabled[next].value;
  pick(target);
  const group = e.currentTarget as HTMLElement;
  requestAnimationFrame(() => group.querySelector<HTMLElement>(`[data-key="${String(target)}"]`)?.focus());
}

export interface SegmentedProps<T extends string | number> {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  /** Accessible name of the group. */
  label: string;
  className?: string;
}

export function Segmented<T extends string | number>({ value, onValueChange, options, label, className }: SegmentedProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const ind = useSlidingIndicator(ref, value);
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      data-slide=""
      className={cn('seg', className)}
      onKeyDown={(e) => onArrows(e, options, value, onValueChange)}
    >
      <span ref={ind} className="slide-ind" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          data-key={String(o.value)}
          tabIndex={o.value === value ? 0 : -1}
          disabled={o.disabled}
          onClick={() => onValueChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export interface TabsProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  /** Base id so tabs and TabPanel can reference each other. */
  idBase?: string;
  className?: string;
}

export function Tabs<T extends string>({ value, onValueChange, options, label, idBase, className }: TabsProps<T>) {
  const auto = useId();
  const base = idBase ?? auto;
  const ref = useRef<HTMLDivElement>(null);
  const ind = useSlidingIndicator(ref, value);
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      className={cn('tabs', className)}
      onKeyDown={(e) => onArrows(e, options, value, onValueChange)}
    >
      <span ref={ind} className="slide-ind" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          id={`${base}-tab-${o.value}`}
          aria-controls={`${base}-panel-${o.value}`}
          aria-selected={o.value === value}
          data-key={o.value}
          tabIndex={o.value === value ? 0 : -1}
          disabled={o.disabled}
          onClick={() => onValueChange(o.value)}
        >
          {o.label}
          {o.count != null ? <span className="tab-count num">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({
  idBase,
  value,
  active,
  children,
  className,
}: {
  idBase: string;
  value: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      hidden={!active}
      className={className}
    >
      {active ? children : null}
    </div>
  );
}
