import React, { useMemo, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { Calendar, Clock, ExternalLink, Plus, Video, Wallet, X } from 'lucide-react';
import {
  useCoachSessions,
  useCoachEarnings,
  useCoachAvailabilityMe,
  usePublishAvailability,
} from '../../services/queries';
import { formatPHP, formatTimeOnly, manilaWallClockToUtcIso } from '../../lib/utils';
import {
  Dialog,
  DialogClose,
  Disc,
  Empty,
  Segmented,
  Skeleton,
  Status,
  formatDay,
  toast,
} from '../../components/ui';
import type { CoachBooking, MyAvailabilitySlot } from '../../types/api';
import './coach.css';

interface CoachDashboardPageProps {
  navigate: (path: string) => void;
}

type Tab = 'sessions' | 'availability' | 'earnings';
const TITLES: Record<Tab, string> = { sessions: 'Sessions', availability: 'Availability', earnings: 'Earnings' };
type WeekKey = 'w0' | 'w1' | 'later';

/* ── Manila calendar helpers (display only; no money math here) ─────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
const manilaYmd = (d: Date | string) => ymdFmt.format(typeof d === 'string' ? new Date(d) : d);
const addDays = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const rangeLabel = (a: string, b: string) => {
  const [, am, ad] = a.split('-').map(Number);
  const [, bm, bd] = b.split('-').map(Number);
  return am === bm ? `${ad} – ${bd} ${MONTHS[bm - 1]}` : `${ad} ${MONTHS[am - 1]} – ${bd} ${MONTHS[bm - 1]}`;
};
const when = (iso: string) => `${formatDay(iso)}, ${formatTimeOnly(iso)}`;
const minutes = (s: MyAvailabilitySlot) => Math.round((Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 60000);

/** Balance and ledger values come straight from the API (BR-008). Only formatting, never arithmetic. */
const php = (centavos: number) => (centavos === 0 ? '₱0' : formatPHP(centavos));

/** Your payout for a session, exactly as the API sends it; nothing when it isn't on the payload. */
const payoutOf = (b: CoachBooking) =>
  b.price_centavos === 0 ? 'Free' : typeof b.coach_payout_centavos === 'number' ? formatPHP(b.coach_payout_centavos) : null;

const PAYMENT: Record<string, [string, string]> = {
  paid: ['status-ok', 'Paid'],
  pending: ['status-wait', 'Waiting for payment'],
  none: ['status-muted', 'Free session'],
  refunded: ['status-muted', 'Refunded'],
  failed: ['status-bad', 'Payment failed'],
  expired: ['status-bad', 'Payment expired'],
};

function ErrorNote({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="note is-bad flex-wrap items-center justify-between" role="alert">
      <p>{msg}</p>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

function SessionRow({ b }: { b: CoachBooking }) {
  const name = b.student_name || 'Student';
  return (
    <li className="pcp-row">
      <Disc name={name} size="sm" />
      <div style={{ minWidth: 0 }}>
        <p className="nm">{name}</p>
        <p className="t-small">1-on-1 session</p>
      </div>
      <div className="when-w">
        <p className="when">{when(b.slot_starts_at)}</p>
      </div>
      <div className="end">
        {payoutOf(b) && <span className="price">{payoutOf(b)}</span>}
        <Status status={b.status} />
      </div>
    </li>
  );
}

export const CoachDashboardPage: React.FC<CoachDashboardPageProps> = () => {
  const sessionsQ = useCoachSessions();
  const earningsQ = useCoachEarnings();
  const slotsQ = useCoachAvailabilityMe();
  const publish = usePublishAvailability();
  const sessions = sessionsQ.data ?? [];
  const mySlots = slotsQ.data ?? [];

  // The shell sidebar links to /coach?tab=…, so the tab lives in the URL.
  const q = new URLSearchParams(useRouterState({ select: (st) => st.location.searchStr })).get('tab');
  const tab: Tab = q === 'availability' || q === 'earnings' ? q : 'sessions';
  const [week, setWeek] = useState<WeekKey>('w0');
  const [open, setOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStart, setSlotStart] = useState('14:00');
  const [slotEnd, setSlotEnd] = useState('14:45');
  const [errs, setErrs] = useState<{ date?: string; start?: string; end?: string }>({});
  const [publishError, setPublishError] = useState<string | null>(null);

  // BR-008: render server values from meta.balance. Never compute money in the client.
  const balance = earningsQ.data?.meta?.balance;
  const earningsItems = earningsQ.data?.items ?? [];

  const today = manilaYmd(new Date());
  const days0 = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);
  const days1 = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, 7 + i)), [today]);
  const slotsByDay = useMemo(() => {
    const m = new Map<string, MyAvailabilitySlot[]>();
    for (const s of [...mySlots].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
      const k = manilaYmd(s.starts_at);
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return m;
  }, [mySlots]);
  const laterDays = [...slotsByDay.keys()].filter((k) => k >= addDays(today, 14)).sort();
  const weekOptions = [
    { value: 'w0' as WeekKey, label: rangeLabel(days0[0], days0[6]) },
    { value: 'w1' as WeekKey, label: rangeLabel(days1[0], days1[6]) },
    ...(laterDays.length ? [{ value: 'later' as WeekKey, label: 'Later' }] : []),
  ];
  const shownDays = week === 'w0' ? days0 : week === 'w1' ? days1 : laterDays;
  const openCount = mySlots.filter((s) => !s.is_booked).length;
  const bookedCount = mySlots.length - openCount;

  const now = Date.now();
  const byStart = [...sessions].sort((a, b) => a.slot_starts_at.localeCompare(b.slot_starts_at));
  const isUpcoming = (b: CoachBooking) =>
    (b.status === 'confirmed' || b.status === 'pending') && Date.parse(b.slot_ends_at) >= now;
  const upcomingAll = byStart.filter(isUpcoming);
  const next = upcomingAll[0];
  const upcoming = upcomingAll.slice(1);
  const past = byStart.filter((b) => !isUpcoming(b)).reverse();

  const openAdd = () => {
    const tomorrow = addDays(today, 1);
    setSlotDate((d) => (d && d >= today ? d : tomorrow));
    setErrs({});
    setPublishError(null);
    setOpen(true);
  };

  const handlePublishSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    const bad: typeof errs = {};
    if (!slotDate) bad.date = 'Choose a date.';
    if (!slotStart) bad.start = 'Choose a start time.';
    if (!slotEnd) bad.end = 'Choose an end time.';
    if (Object.keys(bad).length) return setErrs(bad);

    const startsAtUtc = manilaWallClockToUtcIso(slotDate, slotStart);
    const endsAtUtc = manilaWallClockToUtcIso(slotDate, slotEnd);
    const s = Date.parse(startsAtUtc);
    const en = Date.parse(endsAtUtc);
    if (en <= s) bad.end = 'End time must be after start time.';
    else if (s <= Date.now()) bad.start = 'Pick a start time in the future.';
    else if (mySlots.some((x) => s < Date.parse(x.ends_at) && Date.parse(x.starts_at) < en))
      bad.start = 'That overlaps a time you already have. Pick another start.';
    if (Object.keys(bad).length) return setErrs(bad);
    setErrs({});

    try {
      // The PUT replaces unbooked slots only; booked ones stay server-side.
      const existing = mySlots
        .filter((x) => !x.is_booked)
        .map((x) => ({ starts_at: x.starts_at, ends_at: x.ends_at }));
      await publish.mutateAsync([...existing, { starts_at: startsAtUtc, ends_at: endsAtUtc }]);
      setOpen(false);
      const day = manilaYmd(startsAtUtc);
      setWeek(day < addDays(today, 7) ? 'w0' : day < addDays(today, 14) ? 'w1' : 'later');
      toast.success(`Added ${formatDay(startsAtUtc)}, ${formatTimeOnly(startsAtUtc)} – ${formatTimeOnly(endsAtUtc)}.`);
    } catch (err: unknown) {
      setPublishError(err instanceof Error && err.message ? err.message : 'Failed to publish availability slot.');
    }
  };

  const handleRemoveSlot = async (slot: MyAvailabilitySlot) => {
    try {
      const remaining = mySlots
        .filter((s) => s.id !== slot.id && !s.is_booked)
        .map((s) => ({ starts_at: s.starts_at, ends_at: s.ends_at }));
      await publish.mutateAsync(remaining);
      toast(`Removed ${formatDay(slot.starts_at)}, ${formatTimeOnly(slot.starts_at)}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error && err.message ? err.message : 'Failed to remove slot.');
    }
  };

  const fieldErr = (id: string, msg?: string) =>
    msg ? (
      <p className="error" id={`${id}-e`} role="alert">
        {msg}
      </p>
    ) : null;
  const inv = (id: string, msg?: string) => ({
    'aria-invalid': msg ? (true as const) : undefined,
    'aria-describedby': msg ? `${id}-e` : undefined,
  });

  const addButton = (cls = 'btn btn-brand') => (
    <button type="button" className={cls} onClick={openAdd}>
      <Plus aria-hidden="true" />
      Add open time
    </button>
  );

  return (
    <div className="pcp lit lit-left">
      <header className="pcp-head">
        <div>
          <h1 className="t-h1">{TITLES[tab]}</h1>
          {tab === 'earnings' ? null : (
            <p className="t-meta" style={{ marginTop: 6 }}>
              Times are in Manila time (UTC+8).
            </p>
          )}
        </div>
        {tab === 'earnings' ? null : addButton()}
      </header>

      {/* S-044 sessions: API-063 GET /me/sessions */}
      {tab === 'sessions' && (
        <section aria-label="Sessions">
          {sessionsQ.isLoading ? (
            <div className="grid gap-3" aria-busy="true" aria-label="Loading sessions">
              <Skeleton variant="block" height={72} count={3} />
            </div>
          ) : sessionsQ.isError ? (
            <ErrorNote msg="We couldn't load your sessions." onRetry={() => sessionsQ.refetch()} />
          ) : sessions.length === 0 ? (
            <Empty
              icon={Calendar}
              title="No sessions booked yet"
              body="Publish a few open times so students can book you."
              action={addButton()}
            />
          ) : (
            <div className="pcp-stack">
              {next && (
                <section className="panel pcp-next" aria-labelledby="cs-next">
                  <h2 className="t-h3" id="cs-next">
                    Next up
                  </h2>
                  <Disc name={next.student_name || 'Student'} />
                  <div style={{ minWidth: 0 }}>
                    <p className="pcp-name">{next.student_name || 'Student'}</p>
                    <p className="t-small" style={{ marginTop: 4 }}>
                      1-on-1 session
                    </p>
                    <div className="pcp-facts">
                      <span className="num">{when(next.slot_starts_at)}</span>
                      {payoutOf(next) && <span className="num">{payoutOf(next)}</span>}
                      <Status status={next.status} />
                    </div>
                  </div>
                  {next.status === 'confirmed' && next.join_url ? (
                    <div className="pcp-join">
                      <a href={next.join_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        <Video aria-hidden="true" />
                        Join call
                        <ExternalLink aria-hidden="true" />
                      </a>
                    </div>
                  ) : null}
                </section>
              )}
              {upcoming.length > 0 && (
                <section aria-labelledby="cs-up">
                  <h2 className="t-h3" id="cs-up">
                    Upcoming
                  </h2>
                  <ul className="panel pcp-list">
                    {upcoming.map((b) => (
                      <SessionRow key={b.booking_id} b={b} />
                    ))}
                  </ul>
                </section>
              )}
              {past.length > 0 && (
                <section aria-labelledby="cs-past">
                  <h2 className="t-h3" id="cs-past">
                    Past
                  </h2>
                  <ul className="panel pcp-list">
                    {past.map((b) => (
                      <SessionRow key={b.booking_id} b={b} />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </section>
  )}

        {/* S-043 availability: API-064 GET /me/availability, API-065 PUT */}
        {tab === 'availability' && (
        <section aria-label="Availability">
          {slotsQ.isLoading ? (
            <div aria-busy="true" aria-label="Loading availability">
              <Skeleton variant="block" height={220} />
            </div>
          ) : slotsQ.isError ? (
            <ErrorNote msg="We couldn't load your availability." onRetry={() => slotsQ.refetch()} />
          ) : mySlots.length === 0 ? (
            <Empty
              icon={Clock}
              title="No open times yet"
              body="Add a few times and students can book you right away."
              action={addButton()}
            />
          ) : (
            <>
              <p className="t-body" style={{ marginBottom: 16 }}>
                Only open times can be removed.
              </p>
              <div className="pcp-av-bar">
                <div className="pcp-av-scroll">
                  <Segmented label="Week" value={week} onValueChange={setWeek} options={weekOptions} />
                </div>
                <p className="t-meta">
                  <span className="num">{openCount}</span> open · <span className="num">{bookedCount}</span> booked
                </p>
              </div>
              <div className="pcp-av-grid">
                {shownDays.map((day) => {
                  const list = slotsByDay.get(day) ?? [];
                  const label = formatDay(day);
                  return (
                    <section key={day} className="pcp-av-day" aria-labelledby={`av-${day}`}>
                      <h3 id={`av-${day}`}>{label}</h3>
                      {list.length ? (
                        <ul className="pcp-av-slots">
                          {list.map((s) =>
                            s.is_booked ? (
                              <li key={s.id} className="pcp-slot is-booked">
                                <p className="tm">{formatTimeOnly(s.starts_at)}</p>
                                <span className="status status-ok">Booked</span>
                                <span className="sr-only">
                                  {formatTimeOnly(s.starts_at)} on {label} is booked and can't be removed.
                                </span>
                              </li>
                            ) : (
                              <li key={s.id} className="pcp-slot">
                                <p className="tm">{formatTimeOnly(s.starts_at)}</p>
                                <button
                                  type="button"
                                  className="icon-btn"
                                  aria-label={`Remove ${formatTimeOnly(s.starts_at)} on ${label}`}
                                  disabled={publish.isPending}
                                  onClick={() => handleRemoveSlot(s)}
                                >
                                  <X aria-hidden="true" />
                                </button>
                                <p className="mt">{minutes(s)} min</p>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="pcp-av-none">No open times</p>
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          )}
        </section>
  )}

        {/* S-046 earnings: API-067 GET /me/earnings. BR-008: values exactly as returned. */}
        {tab === 'earnings' && (
        <section aria-label="Earnings">
          {earningsQ.isLoading ? (
            <div aria-busy="true" aria-label="Loading earnings">
              <Skeleton variant="block" height={110} />
            </div>
          ) : earningsQ.isError ? (
            <ErrorNote msg="We couldn't load your earnings." onRetry={() => earningsQ.refetch()} />
          ) : (
            <div className="pcp-stack">
              <dl className="panel pcp-sum" aria-label="Earnings summary">
                {[
                  ['Available', balance?.available_centavos, 'Ready to pay out.'],
                  ['Pending', balance?.pending_centavos, 'Clears 24 hours after a session ends.'],
                  ['In transit', balance?.in_transit_centavos, 'On its way to your payout method.'],
                  ['Paid out', balance?.paid_out_centavos, 'Already in your account.'],
                ].map(([label, v, sub]) => (
                  <div key={label as string}>
                    <dt>{label}</dt>
                    <dd>{php((v as number | undefined) ?? 0)}</dd>
                    <dd>{sub}</dd>
                  </div>
                ))}
              </dl>

              <p className="note">
                <Wallet aria-hidden="true" />
                <span>
                  <b>You keep 90% of each paid session; iSkolar's fee is 10%.</b> Earnings clear 24 hours after a session
                  ends, then are paid out to your bank account or e-wallet.
                </span>
              </p>

              {earningsItems.length === 0 ? (
                <Empty
                  icon={Wallet}
                  title="No earnings yet"
                  body="Paid sessions show up here once they're booked."
                />
              ) : (
                <section className="panel pcp-led" aria-labelledby="ea-led">
                  <h2 className="t-h3" id="ea-led">
                    Ledger
                  </h2>
                  <div className="table-wrap">
                    <table className="table">
                      <caption className="sr-only">Earnings per session, {earningsItems.length} shown</caption>
                      <thead>
                        <tr>
                          <th scope="col">Session</th>
                          <th scope="col" className="r">
                            Session price
                          </th>
                          <th scope="col" className="r">
                            Fee
                          </th>
                          <th scope="col" className="r">
                            You get
                          </th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earningsItems.map((item) => {
                          const [cls, text] = PAYMENT[item.payment_status] ?? ['status-muted', item.payment_status];
                          return (
                            <tr key={item.id}>
                              <td className="when dim" data-l="Session">
                                {when(item.slot_starts_at)}
                              </td>
                              <td className="r dim" data-l="Session price">
                                {php(item.price_centavos)}
                              </td>
                              <td className="r dim" data-l="Fee">
                                {php(item.platform_fee_centavos)}
                              </td>
                              <td className="r" data-l="You get">
                                {php(item.coach_payout_centavos)}
                              </td>
                              <td className="st" data-l="Status">
                                <span className={`status ${cls}`}>{text}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
  )}

        {/* Add open time (API-065 PUT /me/availability) */}
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Add open time"
          description="Times are in Manila time (UTC+8)."
          actions={
            <>
              <DialogClose className="btn btn-ghost">Cancel</DialogClose>
              <button type="submit" form="slot-form" className="btn btn-brand" disabled={publish.isPending}>
                {publish.isPending ? 'Adding…' : 'Add open time'}
              </button>
            </>
          }
        >
          <form id="slot-form" className="pcp-dlg" noValidate onSubmit={handlePublishSlot}>
            <div className="field">
              <label htmlFor="slot-date">Date</label>
              <input
                id="slot-date"
                className="input num"
                type="date"
                min={today}
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                {...inv('slot-date', errs.date)}
              />
              {fieldErr('slot-date', errs.date)}
            </div>
            <div className="two">
              <div className="field">
                <label htmlFor="slot-start">Start time</label>
                <input
                  id="slot-start"
                  className="input num"
                  type="time"
                  value={slotStart}
                  onChange={(e) => setSlotStart(e.target.value)}
                  {...inv('slot-start', errs.start)}
                />
                {fieldErr('slot-start', errs.start)}
              </div>
              <div className="field">
                <label htmlFor="slot-end">End time</label>
                <input
                  id="slot-end"
                  className="input num"
                  type="time"
                  value={slotEnd}
                  onChange={(e) => setSlotEnd(e.target.value)}
                  {...inv('slot-end', errs.end)}
                />
                {fieldErr('slot-end', errs.end)}
              </div>
            </div>
            {publishError && (
              <p className="note is-bad" role="alert">
                {publishError}
              </p>
            )}
          </form>
        </Dialog>
      </div>
    );
  };
