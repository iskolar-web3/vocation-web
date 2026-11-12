import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/* M4: popover menu. Portaled to <body> (glass must never sit inside glass), positioned
   from the trigger, scales .97 -> 1 + fades in 160ms from the trigger corner, exits in
   120ms (opacity). Arrow keys / Home / End move focus, Esc closes and restores focus,
   click outside closes. */

const GAP = 8;
const EDGE = 12;
const EXIT_MS = 130;

export interface MenuProps {
  /** A single button element. Menu injects onClick, aria-haspopup, aria-expanded, ref. */
  trigger: ReactElement;
  children: ReactNode;
  /** Which trigger edge the menu aligns to. Default "end". */
  align?: 'start' | 'end';
  /** Accessible name of the menu. */
  label?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Menu({ trigger, children, align = 'end', label, className, onOpenChange }: MenuProps) {
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const exitTimer = useRef<number>(0);
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; origin: string }>({
    top: -9999,
    left: -9999,
    origin: 'top right',
  });

  const setOpenState = useCallback(
    (next: boolean) => {
      window.clearTimeout(exitTimer.current);
      if (next) setPresent(true);
      else exitTimer.current = window.setTimeout(() => setPresent(false), EXIT_MS);
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const measure = useCallback(() => {
    const t = triggerRef.current;
    const m = menuRef.current;
    if (!t || !m) return;
    const r = t.getBoundingClientRect();
    const w = m.offsetWidth;
    const h = m.offsetHeight;
    const below = r.bottom + GAP + h <= window.innerHeight - EDGE || r.top - GAP - h < EDGE;
    const top = below ? r.bottom + GAP : r.top - GAP - h;
    const raw = align === 'end' ? r.right - w : r.left;
    const left = Math.max(EDGE, Math.min(raw, window.innerWidth - w - EDGE));
    setPos({ top, left, origin: `${align === 'end' ? 'right' : 'left'} ${below ? 'top' : 'bottom'}` });
  }, [align]);

  useLayoutEffect(() => {
    if (present) measure();
  }, [present, measure]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      const n = e.target as Node;
      if (menuRef.current?.contains(n) || triggerRef.current?.contains(n)) return;
      setOpenState(false);
    };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, measure, setOpenState]);

  useEffect(() => () => window.clearTimeout(exitTimer.current), []);

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);

  const onMenuKeyDown = (e: ReactKeyboardEvent) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = (i + 1) % list.length;
    else if (e.key === 'ArrowUp') next = (i - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpenState(false);
      triggerRef.current?.focus();
      return;
    } else if (e.key === 'Tab') {
      setOpenState(false);
      return;
    }
    if (next >= 0) {
      e.preventDefault();
      list[next]?.focus();
    }
  };

  const onMenuClick = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="menuitem"]')) {
      setOpenState(false);
      triggerRef.current?.focus({ preventScroll: true });
    }
  };

  const original = trigger.props as {
    onClick?: (e: ReactMouseEvent) => void;
    onKeyDown?: (e: ReactKeyboardEvent) => void;
    ref?: React.Ref<HTMLElement>;
  };
  const triggerEl = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const r = original.ref;
      if (typeof r === 'function') r(node);
      else if (r) (r as { current: HTMLElement | null }).current = node;
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
    onClick: (e: ReactMouseEvent) => {
      original.onClick?.(e);
      if (!e.defaultPrevented) setOpenState(!open);
    },
    onKeyDown: (e: ReactKeyboardEvent) => {
      original.onKeyDown?.(e);
      if (e.key === 'ArrowDown' && !open) {
        e.preventDefault();
        setOpenState(true);
      }
    },
  });

  return (
    <>
      {triggerEl}
      {present
        ? createPortal(
            <div
              ref={menuRef}
              id={id}
              role="menu"
              aria-label={label}
              data-state={open ? 'open' : 'closed'}
              className={cn('menu glass', className)}
              style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
              onKeyDown={onMenuKeyDown}
              onClick={onMenuClick}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export interface MenuItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Render as another element, e.g. render={<Link to="/app" />}. children/className are injected. */
  render?: ReactElement;
  className?: string;
}

export function MenuItem({ children, icon, onSelect, danger, disabled, render, className }: MenuItemProps) {
  const content = (
    <>
      {icon}
      {children}
    </>
  );
  const common = {
    role: 'menuitem',
    tabIndex: -1,
    'data-danger': danger ? '' : undefined,
  };
  if (render) {
    const p = render.props as { className?: string; onClick?: (e: ReactMouseEvent) => void };
    return cloneElement(render as ReactElement<Record<string, unknown>>, {
      ...common,
      className: cn('menu-item', p.className, className),
      onClick: (e: ReactMouseEvent) => {
        p.onClick?.(e);
        onSelect?.();
      },
      children: content,
    });
  }
  return (
    <button
      type="button"
      {...common}
      disabled={disabled}
      className={cn('menu-item', className)}
      onClick={() => onSelect?.()}
    >
      {content}
    </button>
  );
}

export const MenuSeparator = () => <hr className="menu-sep" />;
export const MenuHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('menu-head', className)}>{children}</div>
);
