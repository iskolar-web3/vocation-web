import { AlertCircle, Search, SlidersHorizontal, UserSearch } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type CoachFilterState,
  type CoachSort,
  PriceSegmented,
  SortSelect,
  SpecialtyChips,
} from '../../components/coaching/CoachFilters';
import { CoachRow, Empty, Sheet, Skeleton } from '../../components/ui';
import { useCoaches } from '../../services/queries';
import type { CoachCard } from '../../types/api';
import '../../components/coaching/coaching.css';

interface CoachDirectoryPageProps {
  navigate: (path: string) => void;
  initialQuery?: string;
  initialExpertise?: string;
  initialPrice?: 'all' | 'free' | 'paid';
  onFiltersChange?: (newFilters: CoachFilterState) => void;
}

const MAX_CHIPS = 7;
// The route's search schema has no 'paid' value yet, so a pushed 'paid' reads back as 'all'.
const urlPrice = (p: CoachFilterState['price']) => p;

function sortCoaches(list: CoachCard[], sort: CoachSort): CoachCard[] {
  if (sort === 'rec') return list;
  const key = (c: CoachCard) => (sort === 'rating' ? (c.rating_avg ?? 0) : (c.rating_count ?? 0));
  return [...list].sort((a, b) => key(b) - key(a));
}

export function CoachDirectoryPage({
  initialQuery = '',
  initialExpertise = '',
  initialPrice = 'all',
  onFiltersChange,
}: CoachDirectoryPageProps) {
  const [filters, setFilters] = useState<CoachFilterState>({ q: initialQuery, expertise: initialExpertise, price: initialPrice });
  const [qInput, setQInput] = useState(initialQuery);
  const [sort, setSort] = useState<CoachSort>('rec');
  const [sheetOpen, setSheetOpen] = useState(false);
  const pushed = useRef<CoachFilterState>({ q: initialQuery, expertise: initialExpertise, price: urlPrice(initialPrice) });
  const firstLoad = useRef(true);

  // external navigation (a link to /coaches?price=free while already here)
  useEffect(() => {
    const p = pushed.current;
    if (p.q === initialQuery && p.expertise === initialExpertise && p.price === initialPrice) return;
    pushed.current = { q: initialQuery, expertise: initialExpertise, price: initialPrice };
    setFilters({ q: initialQuery, expertise: initialExpertise, price: initialPrice });
    setQInput(initialQuery);
  }, [initialQuery, initialExpertise, initialPrice]);

  const update = (patch: Partial<CoachFilterState>) => {
    firstLoad.current = false;
    const next = { ...filters, ...patch };
    setFilters(next);
    pushed.current = { q: next.q, expertise: next.expertise, price: urlPrice(next.price) };
    onFiltersChange?.(next);
  };

  // debounce typing so each keystroke is not a request
  useEffect(() => {
    if (qInput === filters.q) return;
    const t = window.setTimeout(() => update({ q: qInput }), 250);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const reset = () => {
    setQInput('');
    update({ q: '', expertise: '', price: 'all' });
    setSort('rec');
  };

  const all = useCoaches();
  const { data, error, refetch } = useCoaches({
    q: filters.q || undefined,
    expertise: filters.expertise || undefined,
    price: filters.price === 'all' ? undefined : filters.price,
  });
  // filter changes swap results in place: keep the last list on screen while the next one loads
  const last = useRef<CoachCard[] | null>(null);
  if (data) last.current = data.items;
  const coaches = sortCoaches(data?.items ?? last.current ?? [], sort);
  const loading = !data && !last.current && !error;

  const chips = useMemo(() => {
    const freq = new Map<string, number>();
    for (const c of all.data?.items ?? []) for (const e of c.expertise ?? []) freq.set(e, (freq.get(e) ?? 0) + 1);
    const top = [...freq].sort((a, b) => b[1] - a[1]).map(([e]) => e).slice(0, MAX_CHIPS);
    return filters.expertise && !top.includes(filters.expertise) ? [filters.expertise, ...top] : top;
  }, [all.data, filters.expertise]);

  const active = (filters.expertise ? 1 : 0) + (filters.price !== 'all' ? 1 : 0) + (sort !== 'rec' ? 1 : 0);
  const count = loading ? 'Loading coaches…' : `${coaches.length} ${coaches.length === 1 ? 'coach' : 'coaches'}`;

  return (
    <div className="cd">
      <header className="cd-head wrap">
        <h1 className="t-h1">1-on-1 Career Coaches</h1>
        <p className="t-lede" style={{ margin: '8px 0 16px', color: 'var(--tx-2)', fontSize: 16 }}>
          Book 1-on-1 mentorship, mock interviews, and resume reviews with industry professionals in the Philippines.
        </p>
        <p className="count t-body" aria-live="polite">
          {count}
        </p>
        <div className="cd-bar">
          <div className="search">
            <Search aria-hidden="true" />
            <input
              type="search"
              className="input"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search by name, title, or focus"
              aria-label="Search coaches"
              enterKeyHint="search"
              autoComplete="off"
            />
          </div>
          <button type="button" className="btn btn-secondary cd-fbtn" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal aria-hidden="true" />
            Filters
            {active ? <span className="cd-badge num">{active}</span> : null}
          </button>
        </div>
        <div className="cd-filters">
          {chips.length ? <SpecialtyChips value={filters.expertise} options={chips} onChange={(expertise) => update({ expertise })} /> : null}
          <PriceSegmented value={filters.price} onChange={(price) => update({ price })} />
          <SortSelect id="cd-sort" value={sort} onChange={setSort} />
        </div>
      </header>

      <div className="wrap" aria-busy={loading}>
        {loading ? (
          <div className="cd-list">
            <Skeleton variant="row" count={4} />
          </div>
        ) : error && !coaches.length ? (
          <Empty
            icon={AlertCircle}
            title="Couldn’t load coaches"
            body={error instanceof Error && error.message ? error.message : 'Check your connection and try again.'}
            action={
              <button type="button" className="btn btn-secondary" onClick={() => void refetch()}>
                Try again
              </button>
            }
          />
        ) : coaches.length === 0 ? (
          <div className="cd-list">
            <Empty
              icon={UserSearch}
              title="No coaches match"
              body="Try another specialty, or clear the filters."
              action={
                <button type="button" className="btn btn-secondary" onClick={reset}>
                  Clear filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="cd-list">
            {coaches.map((c, i) => (
              <div key={c.slug} className={firstLoad.current && i < 6 ? 'enter-rise' : undefined} style={{ ['--i' as string]: i }}>
                <CoachRow coach={c} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Filters"
        footer={
          <button type="button" className="btn btn-primary btn-block" onClick={() => setSheetOpen(false)}>
            Show {coaches.length} {coaches.length === 1 ? 'coach' : 'coaches'}
          </button>
        }
      >
        <div className="cd-sheet">
          {chips.length ? (
            <div>
              <h3>Specialty</h3>
              <SpecialtyChips value={filters.expertise} options={chips} onChange={(expertise) => update({ expertise })} />
            </div>
          ) : null}
          <div>
            <h3>Price</h3>
            <PriceSegmented value={filters.price} onChange={(price) => update({ price })} />
          </div>
          <SortSelect id="cd-sort-sheet" value={sort} onChange={setSort} />
          {active ? (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Clear filters
            </button>
          ) : null}
        </div>
      </Sheet>
    </div>
  );
}
