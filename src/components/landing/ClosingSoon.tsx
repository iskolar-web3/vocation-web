import { Link } from '@tanstack/react-router';
import { ArrowRight, Briefcase } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { InternshipCard } from '../../types/api';
import { Empty, PostingRow, Segmented, Skeleton } from '../ui';

interface Props {
  /** Open roles, already sorted by deadline. */
  items: InternshipCard[];
  total?: number;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

const MAX_FIELDS = 5;

export function ClosingSoon({ items, total, loading, error, onRetry }: Props) {
  const [field, setField] = useState('all');

  // Filter options come from the roles themselves, most common first.
  const fields = useMemo(() => {
    const n = new Map<string, number>();
    for (const i of items) if (i.field) n.set(i.field, (n.get(i.field) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_FIELDS).map(([f]) => f);
  }, [items]);

  const active = fields.includes(field) ? field : 'all';
  const rows = (active === 'all' ? items : items.filter((i) => i.field === active)).slice(0, 5);

  return (
    <>
      <div className="sh">
        <h2 className="t-h2" id="cl-h">
          Closing soon
        </h2>
        <p className="t-body">Open roles, soonest deadline first.</p>
        {fields.length > 1 ? (
          <Segmented
            label="Filter by field"
            value={active}
            onValueChange={setField}
            options={[{ value: 'all', label: 'All' }, ...fields.map((f) => ({ value: f, label: f }))]}
          />
        ) : null}
      </div>
      <div aria-busy={loading}>
        {loading ? (
          <Skeleton variant="row" count={5} />
        ) : error ? (
          <Empty
            icon={Briefcase}
            title="Couldn’t load roles"
            body="Check your connection and try again."
            action={
              <button type="button" className="btn btn-secondary" onClick={onRetry}>
                Try again
              </button>
            }
          />
        ) : rows.length === 0 ? (
          <Empty icon={Briefcase} title="No open roles right now" body="New ones are added often. Check back soon." />
        ) : (
          <div className="cl-list">
            {rows.map((i) => (
              <PostingRow key={i.id} internship={i} />
            ))}
          </div>
        )}
        <Link to="/internships" className="cl-all link-btn">
          {total ? `See all ${total} open roles` : 'See all open roles'}
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
