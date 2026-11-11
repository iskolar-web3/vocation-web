import { useNavigate, useSearch } from '@tanstack/react-router';
import { AlertCircle, Calculator, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActiveChips, FilterBody, type Filters, NO_FILTERS, activeCount } from '../../components/internships/Filters';
import { withPay } from '../../components/internships/shared';
import { RolePreview } from '../../components/internships/RolePreview';
import { useMedia, useRoleSave } from '../../components/internships/hooks';
import { Dialog, Empty, OjtCalculator, PostingRow, SaveButton, Sheet, Skeleton } from '../../components/ui';
import { useInternships } from '../../services/queries';
import type { InternshipCard } from '../../types/api';
import './discovery.css';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'deadline_soon', label: 'Closing soon' },
  { value: 'relevance', label: 'Most relevant' },
];

/** Filters live in the URL (field, setup, pay, sort, q). Min OJT hours has no URL param yet. */
interface DirectoryProps {
  navigate?: (path: string) => void;
  initialQuery?: string;
  initialField?: string;
  initialSetup?: string;
  onFiltersChange?: (f: { q: string; field: string; setup: string; pay: string; sort: string }) => void;
}

export function InternshipDirectoryPage(_props: DirectoryProps) {
  const search = useSearch({ from: '/internships/' });
  const nav = useNavigate();
  const wide = useMedia('(min-width: 768px)');
  const preview = useMedia('(min-width: 1280px)');
  const { visible: canSave, isSaved, toggle } = useRoleSave();

  const [ojt, setOjt] = useState(0);
  const [qText, setQText] = useState(search.q);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const filters: Filters = { field: search.field, setup: search.setup, pay: search.pay, ojt };

  const push = (patch: Partial<{ q: string; field: string; setup: string; pay: string; sort: string }>, replace = false) =>
    nav({ to: '/internships', search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) as never, replace });

  const onFilter = (patch: Partial<Filters>) => {
    const { ojt: nextOjt, ...rest } = patch;
    if (nextOjt !== undefined) setOjt(nextOjt);
    if (Object.keys(rest).length) push(rest);
  };

  // Search box: debounce into the URL (replace, so Back isn't one entry per keystroke).
  const lastPushed = useRef(search.q);
  useEffect(() => {
    if (search.q !== lastPushed.current) {
      lastPushed.current = search.q;
      setQText(search.q);
    }
  }, [search.q]);
  useEffect(() => {
    const q = qText.trim();
    if (q === lastPushed.current) return;
    const t = setTimeout(() => {
      lastPushed.current = q;
      push({ q }, true);
    }, 180);
    return () => clearTimeout(t);
  }, [qText]);

  // Remember the list for the role page's back link.
  useEffect(() => {
    try {
      sessionStorage.setItem('dir-search', JSON.stringify(search));
    } catch {
      /* private mode */
    }
  }, [search]);

  const clearAll = () => {
    lastPushed.current = '';
    setQText('');
    setOjt(0);
    push({ q: '', field: '', setup: 'all', pay: 'all' });
  };

  // Data. Field options come from the unfiltered list so they don't shrink as you filter.
  const query = useInternships({
    q: search.q || undefined,
    field: search.field || undefined,
    setup: search.setup !== 'all' ? search.setup : undefined,
    pay: search.pay !== 'all' ? search.pay : undefined,
    sort: search.sort !== 'newest' ? search.sort : undefined,
    per_page: 100,
  });
  const universe = useInternships({ per_page: 100 });
  const fields = useMemo(() => [...new Set((universe.data?.items ?? []).map((i) => i.field))].sort(), [universe.data]);

  // Filter changes swap instantly: keep showing the last results while the next ones load.
  const last = useRef<InternshipCard[] | null>(null);
  if (query.data) last.current = query.data.items;
  const items = useMemo(() => {
    const all = query.data?.items ?? last.current;
    return all && ojt ? all.filter((i) => (i.ojt_hours ?? 0) >= ojt) : all;
  }, [query.data, ojt]);

  // M9 is for the first load only.
  const [settled, setSettled] = useState(false);
  const firstLoad = !settled;
  useEffect(() => {
    if (!query.data) return;
    const t = setTimeout(() => setSettled(true), 600);
    return () => clearTimeout(t);
  }, [query.data]);

  const loading = !items && query.isLoading;
  const failed = !items && query.isError;
  const count = items?.length ?? 0;
  const selected = items?.find((i) => i.slug === picked) ?? items?.[0] ?? null;
  const n = activeCount(filters);

  const body = (idBase: string, heading: boolean) => (
    <FilterBody
      filters={filters}
      fields={fields}
      onChange={onFilter}
      onReset={() => {
        setOjt(0);
        push({ field: '', setup: 'all', pay: 'all' });
      }}
      idBase={idBase}
      heading={heading}
    />
  );

  return (
    <div className="pg-dir">
      <div className="wrap">
        <header className="pg-head lit lit-left">
          <div className="pg-top">
            <div>
              <h1 className="t-h1">Internships</h1>
              <p className="pg-count t-body" aria-live="polite">
                {loading ? (
                  'Loading roles…'
                ) : failed ? (
                  'Couldn’t load roles'
                ) : (
                  <>
                    <span className="num">{count}</span> open {count === 1 ? 'role' : 'roles'}
                  </>
                )}
              </p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => setCalcOpen(true)}>
              <Calculator aria-hidden="true" />
              OJT hours calculator
            </button>
          </div>
          <form
            className="pg-bar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              (document.activeElement as HTMLElement | null)?.blur();
            }}
          >
            <div className="search pg-search">
              <Search aria-hidden="true" />
              <input
                className="input"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Search title, company, city, field"
                aria-label="Search roles"
              />
            </div>
            <select
              className="select pg-sort"
              value={search.sort}
              onChange={(e) => push({ sort: e.target.value })}
              aria-label="Sort roles by"
            >
              {SORTS.filter((s) => s.value !== 'relevance' || search.q || search.sort === 'relevance').map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary pg-fbtn" onClick={() => setSheetOpen(true)}>
              <SlidersHorizontal aria-hidden="true" />
              Filters
              {n ? <span className="count-dot">{n}</span> : null}
            </button>
          </form>
        </header>

        <div className="pg-main">
          <aside className="pg-rail panel" aria-label="Filters">
            {wide ? body('rail', true) : null}
          </aside>

          <section aria-label="Roles" aria-busy={loading || query.isFetching}>
            <div className="pg-chips">
              <ActiveChips filters={filters} onChange={onFilter} onClear={clearAll} />
            </div>
            {loading ? (
              <div className="pg-list">
                <Skeleton variant="row" count={6} />
              </div>
            ) : failed ? (
              <Empty
                icon={AlertCircle}
                title="Couldn’t load roles"
                body="Check your connection, then try again."
                action={
                  <button type="button" className="btn btn-secondary" onClick={() => query.refetch()}>
                    Retry
                  </button>
                }
              />
            ) : count === 0 ? (
              <Empty
                title="No roles match these filters"
                body="Try removing a filter or searching a broader word, like “design” or “Cebu”."
                action={
                  <button type="button" className="btn btn-secondary" onClick={clearAll}>
                    Reset filters
                  </button>
                }
              />
            ) : (
              <>
                <h2 className="sr-only">Results</h2>
                <div className="pg-list">
                  {items?.map((role, i) => (
                                        <div
                      key={role.id}
                      onClickCapture={(e) => {
                        if (!preview || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        if ((e.target as HTMLElement).closest('button')) return;
                        e.preventDefault();
                        setPicked(role.slug);
                      }}
                    >
                      <PostingRow
                        internship={withPay(role)}
                        current={preview && selected?.slug === role.slug}
                        enter={firstLoad ? i : undefined}
                        save={
                          canSave ? (
                            <SaveButton label={role.title} saved={isSaved(role.id)} onToggle={() => toggle(role.id)} />
                          ) : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="pg-prev panel" aria-label="Role preview">
            {preview && !failed ? (
              loading ? (
                <div className="pg-ph" aria-hidden="true">
                  <Skeleton variant="block" width={48} height={48} />
                  <Skeleton variant="line" height={24} width="70%" />
                  <Skeleton variant="line" width="45%" />
                  <Skeleton variant="block" height={96} />
                  <Skeleton variant="line" count={2} />
                </div>
              ) : (
                <RolePreview
                  role={selected}
                  saved={selected ? isSaved(selected.id) : false}
                  canSave={canSave}
                  onToggleSave={() => selected && toggle(selected.id)}
                />
              )
            ) : null}
          </aside>
        </div>
      </div>

      {wide ? null : (
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Filters"
          footer={
            <button type="button" className="btn btn-primary btn-block" onClick={() => setSheetOpen(false)}>
              {count ? `Show ${count} ${count === 1 ? 'role' : 'roles'}` : 'No roles match'}
            </button>
          }
        >
          {body('sheet', false)}
        </Sheet>
      )}

      <Dialog open={calcOpen} onOpenChange={setCalcOpen} title="OJT hours calculator" size="lg" showClose>
        <OjtCalculator
          stacked
          onFindMatchingRoles={(hours) => {
            setOjt(hours);
            setCalcOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
