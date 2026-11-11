import { Link } from '@tanstack/react-router';
import { AlertCircle, Building2, ChevronRight, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Mono, Skeleton } from '../../components/ui';
import { useCompanies } from '../../services/queries';
import type { CompanyCard } from '../../types/api';
import './discovery.css';

interface Props {
  navigate?: (path: string) => void;
}

export function CompaniesPage(_props: Props) {
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim()), 180);
    return () => clearTimeout(t);
  }, [text]);

  const query = useCompanies({ q: q || undefined, per_page: 100 });
  const universe = useCompanies({ per_page: 100 });
  const industries = useMemo(
    () => [...new Set((universe.data?.items ?? []).map((c) => c.industry).filter(Boolean))].sort(),
    [universe.data]
  );

  // Keep the last list on screen while the next one loads.
  const last = useRef<CompanyCard[] | null>(null);
  if (query.data) last.current = query.data.items;
  const all = query.data?.items ?? last.current;
  // The API searches too; filtering here keeps the swap instant and the result exact.
  const needle = text.trim().toLowerCase();
  const items = all?.filter(
    (c) =>
      (!industry || c.industry === industry) &&
      (!needle || [c.name, c.industry, c.location].join(' ').toLowerCase().includes(needle))
  );

  const loading = !items && query.isLoading;
  const failed = !items && query.isError;
  const count = items?.length ?? 0;
  const reset = () => {
    setText('');
    setQ('');
    setIndustry('');
  };

  return (
    <div className="pg-cos">
      <div className="wrap">
        <header className="pg-head lit lit-left">
          <h1 className="t-h1">Companies</h1>
          <p className="t-lede" style={{ marginTop: 12, maxWidth: '52ch' }}>
            Companies hiring interns and OJT students on Vocation.
          </p>
          <form className="pg-bar" role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="search pg-search">
              <Search aria-hidden="true" />
              <input
                className="input"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search name, industry, city"
                aria-label="Search companies"
              />
            </div>
          </form>
          {industries.length > 1 ? (
            <div className="pg-inds" role="group" aria-label="Industry">
              {['', ...industries].map((i) => (
                <button key={i || 'all'} type="button" className="chip" aria-pressed={industry === i} onClick={() => setIndustry(i)}>
                  {i || 'All'}
                </button>
              ))}
            </div>
          ) : null}
        </header>

        <p className="pg-count" aria-live="polite">
          {loading ? (
            'Loading companies…'
          ) : failed ? (
            'Couldn’t load companies'
          ) : (
            <>
              <span className="num">{count}</span> {count === 1 ? 'company' : 'companies'}
            </>
          )}
        </p>

        <div aria-busy={loading || query.isFetching}>
          {loading ? (
            <div className="pg-list">
              <Skeleton variant="row" count={6} />
            </div>
          ) : failed ? (
            <Empty
              icon={AlertCircle}
              title="Couldn’t load companies"
              body="Check your connection, then try again."
              action={
                <button type="button" className="btn btn-secondary" onClick={() => query.refetch()}>
                  Retry
                </button>
              }
            />
          ) : count === 0 ? (
            <Empty
              icon={Building2}
              title={q ? `No companies match “${q}”` : 'No companies in this industry yet'}
              body="Try a broader word, or clear the industry filter."
              action={
                <button type="button" className="btn btn-secondary" onClick={reset}>
                  Clear search
                </button>
              }
            />
          ) : (
            <div className="panel pg-rows">
              {items?.map((c) => {
                const perks = (c.perks ?? []).slice(0, 2);
                const sub = [c.industry, c.location, (c as { size?: string | null }).size].filter(Boolean).join(', ');
                return (
                  <Link key={c.slug} to="/companies/$slug" params={{ slug: c.slug }} className="pg-corow">
                    <Mono name={c.name} />
                    <div>
                      <h2>{c.name}</h2>
                      <p>{sub}</p>
                    </div>
                    <div className="pg-perks">
                      {perks.map((p) => (
                        <span className="tag" key={p}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className="pg-open">
                      <span className="num">{c.open_role_count ?? 0}</span> open {c.open_role_count === 1 ? 'role' : 'roles'}
                    </span>
                    <ChevronRight aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
