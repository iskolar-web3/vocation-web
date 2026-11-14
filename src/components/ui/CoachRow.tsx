import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import type { CoachCard, CoachDetail } from '../../types/api';
import { cn, formatPHP } from '../../lib/utils';
import { Disc } from './atoms';

type Coach = CoachCard | CoachDetail;

/** Price copy from what the payload carries. Display only; the API owns every amount. */
export function coachFromPrice(coach: Coach): string {
  if (coach.price_type === 'free') return 'Free';
  const types = 'session_types' in coach ? coach.session_types : [];
  const paid = types.filter((t) => t.price_centavos > 0).map((t) => t.price_centavos);
  const hasFree = types.some((t) => t.price_centavos === 0);
  if (!paid.length) return hasFree ? 'Free' : 'Paid sessions';
  const from = formatPHP(Math.min(...paid));
  return hasFree ? `Free intro, from ${from}` : `From ${from}`;
}

export function Stars({ coach }: { coach: Coach }) {
  if (!coach.rating_avg) return <span className="tag">New coach</span>;
  return (
    <span className="stars">
      <Star aria-hidden="true" />
      <span className="num">{coach.rating_avg.toFixed(1)}</span>
      <span className="muted" style={{ fontWeight: 500 }}>
        ({coach.rating_count})
      </span>
    </span>
  );
}

export interface CoachRowProps {
  coach: Coach;
  /** full: tags + View profile. compact: name, headline, price only (landing / cross-sell). */
  mode?: 'full' | 'compact';
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function CoachRow({ coach, mode = 'full', headingLevel = 3, className }: CoachRowProps) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const full = mode === 'full';
  return (
    <article className={cn('crow', !full && 'crow-compact', className)}>
      <Disc name={coach.display_name} size={full ? 'md' : 'sm'} src={coach.avatar_url} />
      <div style={{ minWidth: 0 }}>
        <H className="nm">
          <Link to="/coaches/$slug" params={{ slug: coach.slug }}>
            {coach.display_name}
          </Link>
          {coach.price_type === 'free' ? <span className="tag-free">Free 1-on-1</span> : null}
        </H>
        <p className="sub">
          {coach.headline} <Stars coach={coach} />
        </p>
        {full && coach.expertise.length ? (
          <div className="tags">
            {coach.expertise.slice(0, 3).map((e) => (
              <span className="tag" key={e}>
                {e}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="side">
        <span className="money">{coachFromPrice(coach)}</span>
        {full ? (
          <Link
            to="/coaches/$slug"
            params={{ slug: coach.slug }}
            className="btn btn-secondary btn-sm"
            tabIndex={-1}
            aria-hidden="true"
          >
            View profile
          </Link>
        ) : null}
      </div>
    </article>
  );
}
