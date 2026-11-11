import { Clock, type LucideIcon, Search } from 'lucide-react';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { cn, formatPesos } from '../../lib/utils';

/* ── Mono: company monogram tile, 5 brand tints picked by a stable hash ───────────── */

export const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '').slice(0, 2);
  return letters.toUpperCase();
};

export const tintOf = (name: string): number => {
  let h = 5381;
  for (const ch of name.trim().toLowerCase()) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return h % 5;
};

export function Mono({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span className={cn('mono', `mono-${tintOf(name)}`, size === 'sm' && 'sm', size === 'lg' && 'lg', className)} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}

/* ── Disc: halftone portrait (initials by default; `src` adds a photo under the halftone) ── */

export function Disc({
  name,
  size = 'md',
  src,
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={cn('disc', size !== 'md' && size, className)} aria-hidden="true">
      <span>{initialsOf(name)}</span>
      {src && !broken ? <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} /> : null}
    </span>
  );
}

/* ── Status ───────────────────────────────────────────────────────────────────────── */

const STATUS = {
  confirmed: ['status-ok', 'Confirmed'],
  pending: ['status-wait', 'Waiting for payment'],
  confirming: ['status-wait', 'Confirming payment…'],
  completed: ['status-muted', 'Completed'],
  cancelled: ['status-muted', 'Cancelled'],
  refunded: ['status-muted', 'Cancelled, refunded'],
  failed: ['status-bad', 'Payment failed'],
  expired: ['status-bad', 'Payment expired'],
  open: ['status-ok', 'Open'],
  withdrawn: ['status-muted', 'Withdrawn'],
  closed: ['status-muted', 'Closed'],
} as const;

export type StatusKey = keyof typeof STATUS;

/** BR-007: paid bookings read "confirming" until the API says confirmed. Never infer it. */
export function Status({ status, className }: { status: StatusKey | (string & {}); className?: string }) {
  const s = STATUS[status as StatusKey];
  if (!s) return null;
  return <span className={cn('status', s[0], className)}>{s[1]}</span>;
}

/* ── Deadline ─────────────────────────────────────────────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const manila = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });

/** Manila calendar day of a YYYY-MM-DD or ISO instant, as a UTC-midnight timestamp. */
const manilaDay = (d: string | Date): number => {
  const s = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : manila.format(typeof d === 'string' ? new Date(d) : d);
  const [y, m, day] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, day);
};

export const daysUntil = (date: string): number => Math.round((manilaDay(date) - manilaDay(new Date())) / 86_400_000);

export function formatDay(date: string): string {
  const t = new Date(manilaDay(date));
  return `${DAYS[t.getUTCDay()]} ${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}`;
}

/** "Closes in 3 days" (honey, <= 7 days) or "Closes Sat 21 Nov". No ticking, no countdown digits. */
export function Deadline({ days, date, className }: { days?: number; date?: string | null; className?: string }) {
  if (days == null && !date) return null;
  const d = days ?? daysUntil(date as string);
  const soon = d <= 7;
  const text =
    d < 0
      ? 'Closed'
      : d === 0
        ? 'Closes today'
        : d === 1
          ? 'Closes tomorrow'
          : soon
            ? `Closes in ${d} days`
            : date
              ? `Closes ${formatDay(date)}`
              : `Closes in ${d} days`;
  return (
    <span className={cn('deadline', soon && d >= 0 && 'is-soon', className)}>
      <Clock aria-hidden="true" />
      {text}
    </span>
  );
}

/* ── Money ────────────────────────────────────────────────────────────────────────── */

export interface MoneyProps {
  /** Monthly allowance in pesos. > 0 renders "₱15,000/mo". */
  allowance?: number | null;
  /** Free-text pay from the API (compensation_details), shown as written. */
  label?: string | null;
  /** Listed as unpaid (credit only). */
  unpaid?: boolean;
  /** Listed as paid but the amount is not on this payload. */
  paid?: boolean;
  className?: string;
}

/** Display only. Never computes fees, totals or payouts. */
export function Money({ allowance, label, unpaid, paid, className }: MoneyProps) {
  if (allowance && allowance > 0) {
    return (
      <span className={cn('money', className)}>
        {formatPesos(allowance)}
        <small>/mo</small>
      </span>
    );
  }
  const text = label?.trim();
  if (text) {
    const m = /^(.*?)\s*(\/\s*mo(?:nth)?\.?)$/i.exec(text);
    return (
      <span className={cn('money', className)}>
        {m ? m[1] : text}
        {m ? <small>/mo</small> : null}
      </span>
    );
  }
  if (unpaid) return <span className={cn('money is-unstated', className)}>Unpaid, for credit</span>;
  if (paid) return <span className={cn('money', className)}>Paid</span>;
  return <span className={cn('money is-unstated', className)}>Pay not stated</span>;
}

/** Map the real Internship card/detail shape onto Money props (BR-compliant copy). */
export function moneyFrom(i: {
  is_paid?: boolean;
  pay_not_stated?: boolean;
  compensation_details?: string | null;
  stipend_amount?: number | null;
  stipend_period?: string | null;
}): MoneyProps {
  if (i.compensation_details) return { label: i.compensation_details };
  // A stated monthly stipend is shown as given (BR-008 spirit: read, never compute).
  if (i.stipend_amount && i.stipend_period === 'month') return { allowance: i.stipend_amount };
  if (i.pay_not_stated) return {};
  return i.is_paid ? { paid: true } : { unpaid: true };
}

/* ── Empty ────────────────────────────────────────────────────────────────────────── */

export function Empty({
  icon: Icon = Search,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('empty', className)}>
      <div className="empty-icon">
        <Icon aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}

/* ── Skeleton (M9 shimmer is pure CSS) ────────────────────────────────────────────── */

export function Skeleton({
  variant = 'line',
  count = 1,
  width,
  height,
  className,
}: {
  variant?: 'row' | 'line' | 'block' | 'circle';
  count?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  if (variant === 'row') {
    return (
      <>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={cn('sk-row', className)} aria-hidden="true">
            <span className="sk" style={{ width: 48, height: 48, borderRadius: 12 }} />
            <span style={{ display: 'grid', gap: 10 }}>
              <span className="sk" style={{ height: 16, width: '55%' }} />
              <span className="sk" style={{ height: 12, width: '35%' }} />
            </span>
            <span style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
              <span className="sk" style={{ height: 14, width: 90, maxWidth: '100%' }} />
              <span className="sk" style={{ height: 12, width: 70, maxWidth: '100%' }} />
            </span>
          </div>
        ))}
      </>
    );
  }
  const style: CSSProperties = {
    width: width ?? (variant === 'line' ? '100%' : variant === 'circle' ? 48 : '100%'),
    height: height ?? (variant === 'line' ? 14 : variant === 'circle' ? 48 : 96),
    ...(variant === 'circle' ? { borderRadius: '50%' } : null),
  };
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cn('sk', 'block', className)} style={style} aria-hidden="true" />
      ))}
    </>
  );
}
