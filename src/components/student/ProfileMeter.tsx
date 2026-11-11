import { SiteLink } from '../layout/shell';
import { Check, Plus } from 'lucide-react';
import type { StudentProfile } from '../../types/api';
import { cn } from '../../lib/utils';
import { Progress } from './forms';

/* methods.md §6: 40 for the four required fields, +15 each for bio, photo, resume, skills.
   The percentage shown always comes from the API (`completeness_pct`); these items only
   say what is still missing. */

export interface CompletenessItem {
  key: 'required' | 'bio' | 'skills' | 'photo' | 'resume';
  label: string;
  weight: number;
  done: boolean;
}

export function completenessItems(p: Partial<StudentProfile> & { avatar_url?: string | null }): CompletenessItem[] {
  return [
    {
      key: 'required',
      label: 'Name, school, course and year level',
      weight: 40,
      done: Boolean(p.full_name && p.school && p.course && p.year_level),
    },
    { key: 'bio', label: 'Add a short bio', weight: 15, done: Boolean(p.bio?.trim()) },
    { key: 'skills', label: 'Add your skills', weight: 15, done: Boolean(p.skills?.length) },
    { key: 'photo', label: 'Add a photo', weight: 15, done: Boolean(p.avatar_key || p.avatar_url) },
    { key: 'resume', label: 'Upload your resume (PDF)', weight: 15, done: Boolean(p.resume_key) },
  ];
}

/** Dashboard panel: linear bar plus the next missing items as tasks. */
export function ProfileMeter({ pct, items }: { pct: number; items?: CompletenessItem[] }) {
  const tasks = (items ?? []).filter((i) => !i.done).slice(0, 2);
  return (
    <section className="panel panel-pad" aria-labelledby="d-prof">
      <h2 className="t-h3 mb-3.5" id="d-prof">
        Profile <span className="num">{pct}%</span> done
      </h2>
      <Progress value={pct} label="Profile completeness" />
      {tasks.length > 0 ? (
        <div className="mt-4 grid gap-2.5">
          {tasks.map((t) => (
            <SiteLink
              key={t.key}
              to="/app/profile"
              className="flex min-h-12 items-center justify-between gap-3 rounded-[var(--r)] border border-line bg-field px-3.5 py-2 text-tx no-underline hover:bg-surface-2"
            >
              <span>{t.label}</span>
              <span className="num text-sm text-link">+{t.weight}%</span>
            </SiteLink>
          ))}
        </div>
      ) : pct >= 100 ? (
        <p className="t-small mt-4">Your profile is complete.</p>
      ) : null}
    </section>
  );
}

/** Profile-page aside: every item, done or not. */
export function CompletenessChecklist({ pct, items }: { pct: number; items: CompletenessItem[] }) {
  return (
    <section className="panel panel-pad" aria-labelledby="pf-ah">
      <h2 className="t-h3 mb-2.5" id="pf-ah">
        Completeness
      </h2>
      <p className="num mb-3 font-data text-[34px] leading-none font-semibold text-tx">{pct}%</p>
      <Progress value={pct} label="Profile completeness" />
      <ul className="mt-[18px] grid list-none gap-2.5 p-0">
        {items.map((i) => (
          <li key={i.key} className="flex items-start gap-2.5 text-[14.5px] text-tx-2">
            {i.done ? (
              <Check className={cn('mt-0.5 size-[18px] flex-none text-ok')} aria-hidden="true" />
            ) : (
              <Plus className="mt-0.5 size-[18px] flex-none text-tx-3" aria-hidden="true" />
            )}
            <span>
              {i.label}
              {i.done ? <span className="sr-only"> (done)</span> : null}
            </span>
            {i.done ? null : <span className="num ml-auto flex-none text-[13px] text-link">+{i.weight}%</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
