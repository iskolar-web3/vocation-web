import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight, Briefcase, Check } from 'lucide-react';
import { useRoleSave } from '../../components/internships/hooks';
import { BackLink, StateCard, withPay } from '../../components/internships/shared';
import { Empty, Mono, PostingRow, SaveButton, Skeleton } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { useCompany } from '../../services/queries';
import './discovery.css';

interface Props {
  slug: string;
  navigate?: (path: string) => void;
}

const domainOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export function CompanyDetailPage({ slug }: Props) {
  const q = useCompany(slug);
  const { visible: canSave, isSaved, toggle } = useRoleSave();
  const c = q.data;

  if (q.isLoading) {
    return (
      <div className="pg-co">
        <div className="wrap" aria-busy="true">
          <div className="pg-head" style={{ paddingTop: 64 }}>
            <div className="pg-ch">
              <Skeleton variant="block" width={64} height={64} />
              <div style={{ flex: 1, display: 'grid', gap: 12 }}>
                <Skeleton variant="line" height={36} width="50%" />
                <Skeleton variant="line" height={18} width="40%" />
              </div>
            </div>
          </div>
          <div className="pg-cgrid">
            <Skeleton variant="block" height={220} />
            <div className="pg-list">
              <Skeleton variant="row" count={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (q.isError && !(q.error instanceof ApiError && q.error.status === 404)) {
    return (
      <div className="pg-co">
        <StateCard
          title="Couldn’t load this company"
          body="Check your connection, then try again."
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => q.refetch()}>
                Retry
              </button>
              <Link to="/companies" className="btn btn-ghost">
                Browse companies
              </Link>
            </>
          }
        />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="pg-co">
        <StateCard
          title="Company not found"
          body="That company page doesn’t exist, or it was taken down."
          actions={
            <Link to="/companies" className="btn btn-primary">
              Browse companies
            </Link>
          }
        />
      </div>
    );
  }

  const roles = c.open_internships ?? [];
  const about = c.about ?? (c as { description?: string }).description;
  const perks = c.perks ?? [];

  return (
    <div className="pg-co">
      <div className="wrap">
        <div style={{ paddingTop: 20 }}>
          <BackLink to="/companies">
            <ArrowLeft aria-hidden="true" />
            All companies
          </BackLink>
        </div>
        <header className="pg-head lit lit-left" style={{ paddingTop: 20 }}>
          <div className="pg-ch">
            <Mono name={c.name} size="lg" />
            <div>
              <h1 className="t-h1">{c.name}</h1>
              <div className="meta">
                {c.industry ? <span>{c.industry}</span> : null}
                {c.location ? <span>{c.location}</span> : null}
                {c.size ? <span>{c.size}</span> : null}
              </div>
              {c.website ? (
                <a className="pg-ext" href={c.website} target="_blank" rel="noopener noreferrer">
                  {domainOf(c.website)}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <div className="pg-cgrid">
          {about || perks.length ? (
            <section className="panel pg-about" aria-label={`About ${c.name}`}>
              {about ? (
                <>
                  <h2 className="pg-h2">About</h2>
                  <p className="t-body">{about}</p>
                </>
              ) : null}
              {perks.length ? (
                <>
                  <h2 className="pg-h2">Perks</h2>
                  <ul>
                    {perks.map((x) => (
                      <li key={x}>
                        <Check aria-hidden="true" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          ) : (
            <div />
          )}
          <section aria-label="Open roles">
            <div className="pg-rolehead">
              <h2 className="pg-h2">Open roles</h2>
              <span className="num">{roles.length}</span>
            </div>
            {roles.length ? (
              <div className="pg-list">
                {roles.map((r) => (
                  <PostingRow
                    key={r.id}
                    internship={withPay(r)}
                    save={canSave ? <SaveButton label={r.title} saved={isSaved(r.id)} onToggle={() => toggle(r.id)} /> : undefined}
                  />
                ))}
              </div>
            ) : (
              <Empty
                icon={Briefcase}
                title="No open roles right now"
                body="Check back soon. Roles here usually open before each semester."
                action={
                  <Link to="/internships" className="btn btn-secondary">
                    See all open roles
                  </Link>
                }
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
