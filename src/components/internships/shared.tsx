import { Link } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRecordApplyClick } from '../../services/queries';
import type { InternshipCard, InternshipDetail } from '../../types/api';
import { cn, formatPesos } from '../../lib/utils';
import { LeavingSiteNotice, Money, type MoneyProps, daysUntil, formatDay, moneyFrom, toast } from '../ui';

type Role = InternshipCard | InternshipDetail;

const SETUP = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' } as const;
export const setupLabel = (s: string) => SETUP[s as keyof typeof SETUP] ?? s;

/** Lists arrive as arrays (dev API) or as a newline/bullet string (openapi). */
export function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === 'string') {
    return v
      .split(/\r?\n|•/)
      .map((s) => s.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}

/** Money props from what the API sent. Never computes: it only reads a stated amount or label. */
export function payFrom(i: Role): MoneyProps {
  const x = i as { stipend_amount?: number | null; stipend_period?: string | null };
  if (!i.compensation_details && x.stipend_amount && x.stipend_period === 'month') return { allowance: x.stipend_amount };
  return moneyFrom(i);
}

/** Lets a stated stipend reach the kit row (which reads compensation_details). Formatting only, no maths. */
export function withPay<T extends Role>(i: T): T {
  const { allowance } = payFrom(i);
  return allowance ? { ...i, compensation_details: `${formatPesos(allowance)}/mo` } : i;
}

/** "Closes Tue 24 Nov · in 14 days". Honey when it closes within 7 days. */
export function CloseLine({ date, className }: { date?: string | null; className?: string }) {
  if (!date) return null;
  const d = daysUntil(date);
  if (d < 0) return null;
  const rel = d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
  return (
    <span className={cn('deadline', d <= 7 && 'is-soon', className)}>
      <Clock aria-hidden="true" />
      {d === 0 ? 'Closes today' : `Closes ${formatDay(date)} · ${rel}`}
    </span>
  );
}

export function RoleFacts({ role }: { role: Role }) {
  return (
    <dl className="facts">
      <div>
        <dt>Setup</dt>
        <dd>{setupLabel(role.work_setup)}</dd>
      </div>
      <div>
        <dt>Location</dt>
        <dd>{role.location}</dd>
      </div>
      <div>
        <dt>Pay</dt>
        <dd>
          <Money {...payFrom(role)} />
        </dd>
      </div>
      <div>
        <dt>OJT hours</dt>
        <dd>{role.ojt_hours ? <><span className="num">{role.ojt_hours}</span> h</> : 'Not stated'}</dd>
      </div>
    </dl>
  );
}

/** Not-found / closed / error card (one shape for every dead end). */
export function StateCard({ title, body, actions }: { title: string; body: string; actions: ReactNode }) {
  return (
    <div className="wrap">
      <div className="pg-head">
        <div className="panel pg-state">
          <h1 className="t-h2">{title}</h1>
          <p className="t-body">{body}</p>
          <div className="pg-state-actions">{actions}</div>
        </div>
      </div>
    </div>
  );
}

export async function copyLink(url = window.location.href) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied');
  } catch {
    toast.error('Couldn’t copy the link');
  }
}

/** BR-001: apply is an outbound redirect. The notice opens the company URL; we only record the click. */
export function ApplyNotice({
  role,
  loading,
  open,
  onOpenChange,
  surface,
}: {
  role?: InternshipDetail | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surface: 'directory' | 'detail' | 'cross_sell';
}) {
  const record = useRecordApplyClick();
  return (
    <LeavingSiteNotice
      open={open}
      onOpenChange={onOpenChange}
      postingTitle={role?.title ?? ''}
      companyName={role?.company.name ?? ''}
      url={role?.external_apply_url}
      loading={loading}
      onContinue={() => role && record.mutate({ internshipId: role.id, referrerSurface: surface })}
    />
  );
}

/** Back link that returns to the directory with the filters the student left. */
export function BackLink({ to, children }: { to: '/internships' | '/companies'; children: ReactNode }) {
  let search: Record<string, string> | undefined;
  if (to === '/internships') {
    try {
      search = JSON.parse(sessionStorage.getItem('dir-search') ?? 'null') ?? undefined;
    } catch {
      search = undefined;
    }
  }
  return (
    <Link to={to} search={search as never} className="pg-back">
      {children}
    </Link>
  );
}
