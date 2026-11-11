import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useRoleSave } from '../../components/internships/hooks';
import { ApplyNotice, BackLink, CloseLine, RoleFacts, StateCard, copyLink, toList, withPay } from '../../components/internships/shared';
import { Disc, Mono, PostingRow, SaveButton, Skeleton, coachFromPrice, daysUntil } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { useCoach, useCompany, useInternship, useInternships } from '../../services/queries';
import type { InternshipDetail } from '../../types/api';
import './discovery.css';

interface Props {
  slug: string;
  navigate?: (path: string) => void;
}

const firstSentence = (t?: string | null) => (t ? t.split(/(?<=\.)\s/)[0] : '');
const domainOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export function InternshipDetailPage({ slug }: Props) {
  const q = useInternship(slug);
  const role = q.data;
  const { visible: canSave, isSaved, toggle } = useRoleSave();
  const [leaving, setLeaving] = useState(false);

  // Related data. Each is optional: the page renders without any of them.
  const company = useCompany(role?.company.slug ?? '');
  const coach = useCoach(role?.recommended_coach_slug ?? '');
  const sameField = useInternships({ field: role?.field, per_page: 12 });

  if (q.isLoading) return <RoleSkeleton />;

  if (q.isError && !(q.error instanceof ApiError && q.error.status === 404)) {
    return (
      <StateCard
        title="Couldn’t load this role"
        body="Check your connection, then try again."
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={() => q.refetch()}>
              Retry
            </button>
            <Link to="/internships" className="btn btn-ghost">
              See open roles
            </Link>
          </>
        }
      />
    );
  }

  const status = (role as { status?: string } | undefined)?.status;
  const closed = !role || (status && status !== 'open') || (role.deadline ? daysUntil(role.deadline) < 0 : false);
  if (!role || closed) {
    return (
      <StateCard
        title={role ? 'This role is closed' : 'We couldn’t find this role'}
        body={
          role
            ? 'It may have been filled or taken down by the company.'
            : 'The link may be wrong, or the role was taken down.'
        }
        actions={
          <Link to="/internships" className="btn btn-primary">
            See open roles
          </Link>
        }
      />
    );
  }

  const c = company.data;
  const more = (c?.open_internships ?? []).filter((x) => x.slug !== role.slug);
  const similar = (sameField.data?.items ?? []).filter((x) => x.slug !== role.slug && x.company.slug !== role.company.slug).slice(0, 3);
  const does = toList((role as InternshipDetail & { responsibilities?: unknown }).responsibilities);
  const wants = toList(role.requirements);
  const perks = toList(role.perks);
  const about = c?.about ?? (c as { description?: string } | undefined)?.description;
  const applyHost = role.external_apply_url ? domainOf(role.external_apply_url) : role.company.name;
  const createdAt = (role as { created_at?: string | null }).created_at;
  const coachData = coach.data;
  const first = coachData?.display_name.replace(/^(Engr|Dr|Mr|Ms|Mrs|Atty)\.?\s+/i, '').split(' ')[0];

  const save = (variant: 'labelled' | 'icon') =>
    canSave ? (
      <SaveButton label={role.title} variant={variant} saved={isSaved(role.id)} onToggle={() => toggle(role.id)} />
    ) : null;
  const share = (
    <button type="button" className="icon-btn" aria-label="Copy link to this role" onClick={() => copyLink()}>
      <Share2 aria-hidden="true" />
    </button>
  );
  const apply = (cls: string) => (
    <button type="button" className={`btn ${cls}`} onClick={() => setLeaving(true)}>
      Apply on {applyHost}
    </button>
  );

  return (
    <div className="pg-role">
      <div className="wrap">
        <div style={{ paddingTop: 20 }}>
          <BackLink to="/internships">
            <ArrowLeft aria-hidden="true" />
            All internships
          </BackLink>
        </div>
        <header className="pg-head lit lit-left" style={{ paddingTop: 20 }}>
          <div className="pg-rh">
            <Mono name={role.company.name} size="lg" />
            <div>
              <h1 className="t-h1">{role.title}</h1>
              <p className="pg-rco">
                <Link to="/companies/$slug" params={{ slug: role.company.slug }}>
                  {role.company.name}
                </Link>
                , {role.location}
              </p>
              <div className="meta pg-rmeta">
                {role.duration_weeks ? (
                  <span>
                    <span className="num">{role.duration_weeks}</span> weeks
                  </span>
                ) : null}
                {createdAt ? <span>Posted {postedAgo(createdAt)}</span> : null}
              </div>
            </div>
          </div>
          <div className="pg-acts">
            {apply('btn-primary btn-lg')}
            {save('labelled')}
            {share}
          </div>
        </header>

        <div className="pg-grid">
          <div className="pg-main-col">
            <div className="stack">
              <RoleFacts role={role} />
              <CloseLine date={role.deadline} />
            </div>
            {role.description ? (
              <section className="measure">
                <h2 className="pg-h2">About the role</h2>
                <p className="t-body">{role.description}</p>
              </section>
            ) : null}
            {does.length ? (
              <section>
                <h2 className="pg-h2">What you’ll do</h2>
                <ul className="pg-ticks">
                  {does.map((x) => (
                    <li key={x}>
                      <Check aria-hidden="true" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {wants.length ? (
              <section>
                <h2 className="pg-h2">Who they’re looking for</h2>
                <ul className="pg-dots">
                  {wants.map((x) => (
                    <li key={x}>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {perks.length ? (
              <section>
                <h2 className="pg-h2">Perks</h2>
                <ul className="pg-dots">
                  {perks.map((x) => (
                    <li key={x}>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {more.length ? (
              <section>
                <h2 className="pg-h2">More at {role.company.name}</h2>
                <div className="pg-list">
                  {more.map((x) => (
                    <PostingRow
                      key={x.id}
                      internship={withPay(x)}
                      compact
                      headingLevel={3}
                      save={canSave ? <SaveButton label={x.title} saved={isSaved(x.id)} onToggle={() => toggle(x.id)} /> : undefined}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {similar.length ? (
              <section>
                <h2 className="pg-h2">Similar roles</h2>
                <div className="pg-list">
                  {similar.map((x) => (
                    <PostingRow
                      key={x.id}
                      internship={withPay(x)}
                      compact
                      headingLevel={3}
                      save={canSave ? <SaveButton label={x.title} saved={isSaved(x.id)} onToggle={() => toggle(x.id)} /> : undefined}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="pg-aside" aria-label="Apply and coaching">
            <section className="panel" aria-labelledby="pg-apply-h">
              <h2 id="pg-apply-h">Before you apply</h2>
              <CloseLine date={role.deadline} />
              {apply('btn-primary btn-block')}
              <p className="t-meta" style={{ marginTop: 12 }}>
                You’ll apply on {applyHost}. Vocation never sees your application.
              </p>
            </section>

            {coachData ? (
              <section className="panel" aria-labelledby="pg-coach-h">
                <h2 id="pg-coach-h">Nervous about the interview?</h2>
                <div className="pg-coach">
                  <Disc name={coachData.display_name} size="sm" />
                  <div>
                    <b>{coachData.display_name}</b>
                    <p className="t-meta">{coachData.headline}</p>
                  </div>
                </div>
                <p className="t-small">Practice with {first} before you apply.</p>
                <p className="pg-price">{coachFromPrice(coachData)}</p>
                <Link to="/coaches/$slug" params={{ slug: coachData.slug }} className="pg-link">
                  See {first}’s sessions
                  <ArrowRight aria-hidden="true" />
                </Link>
              </section>
            ) : null}

            {c ? (
              <section className="panel" aria-labelledby="pg-about-h">
                <div className="pg-cmini">
                  <Mono name={c.name} size="sm" />
                  <h2 id="pg-about-h">About {c.name}</h2>
                </div>
                <p className="t-meta">{[c.industry, c.size, c.location].filter(Boolean).join(', ')}</p>
                {about ? (
                  <p className="t-small" style={{ marginTop: 10 }}>
                    {firstSentence(about)}
                  </p>
                ) : null}
                <Link to="/companies/$slug" params={{ slug: c.slug }} className="pg-link">
                  See company page
                  <ArrowRight aria-hidden="true" />
                </Link>
              </section>
            ) : null}
          </aside>
        </div>
      </div>

      <div className="pg-sbar">
        {apply('btn-primary')}
        {save('icon')}
        {share}
      </div>
      <ApplyNotice role={role} open={leaving} onOpenChange={setLeaving} surface="detail" />
    </div>
  );
}

function postingAgo(days: number) {
  return days <= 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
}
function postedAgo(iso: string) {
  return postingAgo(-daysUntil(iso));
}

function RoleSkeleton() {
  return (
    <div className="pg-role">
      <div className="wrap" aria-busy="true">
        <div className="pg-head" style={{ paddingTop: 64 }}>
          <div className="pg-rh">
            <Skeleton variant="block" width={64} height={64} />
            <div style={{ flex: 1, display: 'grid', gap: 12 }}>
              <Skeleton variant="line" height={36} width="60%" />
              <Skeleton variant="line" height={18} width="35%" />
            </div>
          </div>
        </div>
        <div className="pg-grid">
          <div style={{ display: 'grid', gap: 16 }}>
            <Skeleton variant="block" height={88} />
            <Skeleton variant="line" count={4} />
          </div>
          <Skeleton variant="block" height={180} />
        </div>
      </div>
    </div>
  );
}
