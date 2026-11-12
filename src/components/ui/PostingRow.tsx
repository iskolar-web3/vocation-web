import { Link } from '@tanstack/react-router';
import { GraduationCap } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { InternshipCard, InternshipDetail } from '../../types/api';
import { cn } from '../../lib/utils';
import { Deadline, Money, Mono, moneyFrom } from './atoms';

const SETUP = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' } as const;
/** M9 stagger covers the first rows only; later rows render without entrance motion. */
const STAGGER_ROWS = 6;

export interface PostingRowProps {
  internship: InternshipCard | InternshipDetail;
  /** Marks the row open in a split view (aria-current + selected surface). */
  current?: boolean;
  /** Hide the tag line (setup, OJT hours). */
  compact?: boolean;
  /** Save slot, e.g. <SaveButton .../>. Omit and the row drops the column. */
  save?: ReactNode;
  /** Opt in to the first-load entrance: pass the row index (only the first 6 animate, 30ms apart). */
  enter?: number;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function PostingRow({ internship: i, current, compact, save, enter, headingLevel = 3, className }: PostingRowProps) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const animate = enter != null && enter < STAGGER_ROWS;
  return (
    <article
      className={cn('prow', animate && 'enter-rise', className)}
      data-current={current ? '' : undefined}
      data-nosave={save ? undefined : ''}
      style={animate ? ({ '--i': enter } as CSSProperties) : undefined}
    >
      <Mono name={i.company.name} />
      <div className="p-main">
        <H className="p-title">
          <Link to="/internships/$slug" params={{ slug: i.slug }} aria-current={current ? 'true' : undefined}>
            {i.title}
          </Link>
        </H>
        <p className="p-sub">
          {i.company.name}, {i.location}
        </p>
        {compact ? null : (
          <div className="p-tags">
            <span className="tag">{SETUP[i.work_setup] ?? i.work_setup}</span>
            {i.ojt_hours ? (
              <span className="tag tag-ojt">
                <GraduationCap aria-hidden="true" />
                OJT <span className="num">{i.ojt_hours}</span> h
              </span>
            ) : null}
          </div>
        )}
      </div>
      <div className="p-side">
        <Money {...moneyFrom(i)} />
        <Deadline date={i.deadline} />
      </div>
      {save}
    </article>
  );
}
