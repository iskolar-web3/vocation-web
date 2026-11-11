import { Link } from '@tanstack/react-router';
import { ArrowRight, Calendar } from 'lucide-react';
import { useCoach, useCoachAvailability, useCoachReviews } from '../../services/queries';
import { formatPHP } from '../../lib/utils';
import type { CoachCard } from '../../types/api';
import { CoachRow, Disc, Skeleton, Stars } from '../ui';

const when = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const fmtSlot = (iso: string) => {
  const p = Object.fromEntries(when.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute} ${String(p.dayPeriod).toUpperCase()}`;
};

export function CoachingSection({ coaches, loading }: { coaches: CoachCard[]; loading: boolean }) {
  // Headliner: best rated, first listed on ties. Real data only.
  const sorted = [...coaches].sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
  const lead = sorted[0];
  const others = sorted.slice(1, 4);

  const detail = useCoach(lead?.slug ?? '').data;
  const reviews = useCoachReviews(lead?.slug ?? '').data;
  const slots = useCoachAvailability(lead?.slug ?? '').data;
  const quote = reviews?.find((r) => r.body);
  const next = slots?.[0]?.starts_at;
  const sessions = [...(detail?.session_types ?? [])].sort((a, b) => a.price_centavos - b.price_centavos);

  return (
    <>
      <div className="co-top">
        <h2 className="t-h2" id="co-h">
          Rehearse the interview with a coach
        </h2>
        <Link to="/coaches" className="link-btn">
          Browse all coaches <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="co-grid" aria-busy="true">
          <Skeleton variant="block" height={260} />
        </div>
      ) : !lead ? (
        <p className="t-body" style={{ marginTop: 24 }}>
          Coaches are being added. <Link to="/coaches">See who’s available</Link>.
        </p>
      ) : (
        <>
          <div className="co-grid" data-two={others.length ? '' : undefined}>
            <article className="panel co-hl">
              <div className="co-disc">
                <Disc name={lead.display_name} size="xl" src={lead.avatar_url} />
              </div>
              <div>
                <h3 className="t-h2">{lead.display_name}</h3>
                <p className="t-small" style={{ marginTop: 4 }}>
                  {lead.headline}
                </p>
                <div className="co-meta">
                  <Stars coach={lead} />
                </div>
                {lead.expertise.length ? (
                  <div className="co-tags">
                    {lead.expertise.slice(0, 3).map((e) => (
                      <span className="tag" key={e}>
                        {e}
                      </span>
                    ))}
                  </div>
                ) : null}
                {quote ? (
                  <blockquote className="co-q">
                    “{quote.body}”
                    <footer>{quote.reviewer_first_name}, after a session</footer>
                  </blockquote>
                ) : null}
                <div className="co-next">
                  <Link to="/coaches/$slug" params={{ slug: lead.slug }} className="btn btn-primary">
                    See open times
                  </Link>
                  {next ? (
                    <span className="t-small">
                      <Calendar aria-hidden="true" />
                      Next open <span className="num">{fmtSlot(next)}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
            {others.length ? (
              <div className="panel co-list">
                {others.map((c) => (
                  <CoachRow key={c.slug} coach={c} mode="compact" headingLevel={3} />
                ))}
              </div>
            ) : null}
          </div>

          {sessions.length ? (
            <div className="pl">
              <h3 className="t-h3">Sessions with {lead.display_name}</h3>
              <div className="pl-grid">
                {sessions.map((s) => (
                  <div className="pl-item" key={s.id}>
                    <div className="pl-line">
                      <span className="pl-name">{s.name}</span>
                      <span className="pl-dots" aria-hidden="true" />
                      <span className="pl-price">
                        {formatPHP(s.price_centavos)} <small>{s.duration_minutes} min</small>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
