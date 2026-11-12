import React, { useMemo, useState } from 'react';
import { List, Search } from 'lucide-react';
import type { AdminInternshipCard, ListingStatus } from '../../types/api';
import { useAdminInternships, useAdminWithdrawInternship } from '../../services/queries';
import { Dialog, DialogClose, Empty, Money, Segmented, Skeleton, Status, toast } from '../ui';
import './moderation.css';

type Filter = 'all' | ListingStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const setupLabel = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

function ListingStatusPill({ status }: { status: ListingStatus }) {
  if (status === 'pending') return <span className="status status-wait">Pending review</span>;
  if (status === 'rejected') return <span className="status status-bad">Needs revision</span>;
  return <Status status={status} />;
}

interface ModerationQueueTableProps {
  navigate?: (path: string) => void;
}

export const ModerationQueueTable: React.FC<ModerationQueueTableProps> = ({ navigate }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [withdrawItem, setWithdrawItem] = useState<AdminInternshipCard | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // One fetch of every status: counts, filter and search are all derived client-side.
  const { data: all = [], isLoading, isError, refetch } = useAdminInternships();
  const withdrawMutation = useAdminWithdrawInternship();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const i of all) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [all]);

  const q = query.trim().toLowerCase();
  const rows = all.filter(
    (i) =>
      (filter === 'all' || i.status === filter) &&
      (!q || `${i.title} ${i.company?.name ?? ''} ${i.field}`.toLowerCase().includes(q))
  );

  const confirmWithdraw = async () => {
    if (!withdrawItem) return;
    setWithdrawError(null);
    try {
      await withdrawMutation.mutateAsync(withdrawItem.id);
      toast.success(`Withdrawn. ${withdrawItem.title} is off the directory.`);
      setWithdrawItem(null);
    } catch (err: unknown) {
      setWithdrawError(err instanceof Error && err.message ? err.message : 'Could not withdraw this listing.');
    }
  };

  const clear = () => {
    setFilter('all');
    setQuery('');
  };

  return (
    <div className="cm">
      <div className="cm-bar">
        <div className="cm-seg">
          <Segmented
            label="Filter by status"
            value={filter}
            onValueChange={setFilter}
            options={FILTERS.map((f) => ({
              value: f.value,
              label: (
                <>
                  {f.label}
                  <span className="num">{counts[f.value] ?? 0}</span>
                </>
              ),
            }))}
          />
        </div>
        <div className="search">
          <label className="sr-only" htmlFor="adm-q">
            Search listings
          </label>
          <Search aria-hidden="true" />
          <input
            id="adm-q"
            className="input"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search role or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3" aria-busy="true" aria-label="Loading listings">
          <Skeleton variant="block" height={72} count={5} />
        </div>
      ) : isError ? (
        <div className="note is-bad flex-wrap items-center justify-between" role="alert">
          <p>We couldn't load the listings.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : all.length === 0 ? (
        <Empty icon={List} title="No listings yet" body="Listings appear here once they are added." />
      ) : rows.length === 0 ? (
        <Empty
          icon={Search}
          title="No listings match"
          body="Try another word, or show every status."
          action={
            <button type="button" className="btn btn-secondary" onClick={clear}>
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Listings, {rows.length} shown</caption>
              <thead>
                <tr>
                  <th scope="col">Role</th>
                  <th scope="col">Field</th>
                  <th scope="col">Setup, City</th>
                  <th scope="col">Pay</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="role" data-l="Role">
                      <b className="cm-t">{item.title}</b>
                      <span className="t-meta">{item.company?.name}</span>
                    </td>
                    <td data-l="Field">
                      {item.field}
                      {item.duration_weeks != null && <span className="t-meta">{item.duration_weeks} weeks</span>}
                    </td>
                    <td data-l="Setup, City">
                      {[setupLabel(item.work_setup), item.location].filter(Boolean).join(', ')}
                    </td>
                    <td data-l="Pay">
                      <Money paid={item.is_paid} unpaid={!item.is_paid} />
                    </td>
                    <td className="st" data-l="Status">
                      <ListingStatusPill status={item.status} />
                    </td>
                    <td className="act" data-l="Actions">
                      <div className="cm-act">
                        {item.status === 'open' && (
                          <a
                            href={`/internships/${item.slug}`}
                            className="btn btn-secondary btn-sm"
                            aria-label={`Preview ${item.title}`}
                            onClick={(e) => {
                              if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                              e.preventDefault();
                              navigate(`/internships/${item.slug}`);
                            }}
                          >
                            Preview
                          </a>
                        )}
                        {item.status === 'open' && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            aria-label={`Withdraw ${item.title}`}
                            onClick={() => {
                              setWithdrawError(null);
                              setWithdrawItem(item);
                            }}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* S-107 withdraw confirm (BR-006: removed from public view immediately) */}
      <Dialog
        open={!!withdrawItem}
        onOpenChange={(o) => !o && setWithdrawItem(null)}
        title={`Withdraw ${withdrawItem?.title ?? 'listing'}?`}
        description="It's removed from public view immediately."
        actions={
          <>
            <DialogClose className="btn btn-ghost">Keep it open</DialogClose>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? 'Withdrawing…' : 'Withdraw'}
            </button>
          </>
        }
      >
        {withdrawError && (
          <p className="note is-bad" role="alert">
            {withdrawError}
          </p>
        )}
      </Dialog>
    </div>
  );
};
