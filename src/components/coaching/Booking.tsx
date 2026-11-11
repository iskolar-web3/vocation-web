import { Link } from '@tanstack/react-router';
import { Check, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analytics } from '../../lib/analytics';
import { useSlidingIndicator } from '../../lib/motion';
import { formatPHP } from '../../lib/utils';
import { useCoachAvailability, useCreateBooking, useFeatures } from '../../services/queries';
import type { CoachDetail, CreateBookingResponse, PublicAvailabilitySlot, SessionType } from '../../types/api';
import { Dialog } from '../ui';
import './coaching.css';

/* Booking panel (>=1024) and booking sheet (<1024) share one state hook and one body.
   Money is display only: the total is the API's price_centavos for the chosen session type;
   the fee split is never computed or shown here (BR-008). A paid booking leaves for
   checkout_url; only the verified webhook confirms it (BR-007), never this page. */

const TZ = 'Asia/Manila';
const WEEKS = 4;
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const timeKeyFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const longFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const dowFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' });
const monDayFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });

const dayKeyOf = (iso: string) => dayKeyFmt.format(new Date(iso));
const timeLabel = (iso: string) => timeFmt.format(new Date(iso)).toUpperCase();
const dayDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const shiftDay = (key: string, by: number) => {
  const d = dayDate(key);
  d.setUTCDate(d.getUTCDate() + by);
  return d.toISOString().slice(0, 10);
};
/** "Thu 12 Nov, 10:30 AM", Manila time. */
export function whenLabel(iso: string): string {
  const d = dayDate(dayKeyOf(iso));
  const [mon, day] = monDayFmt.format(d).split(' ');
  return `${dowFmt.format(d)} ${day} ${mon}, ${timeLabel(iso)}`;
}

export interface Done {
  booking: CreateBookingResponse;
  session: string;
  when: string;
  minutes: number;
  price: number;
}

export function useBooking(coach: CoachDetail) {
  const { isAuthenticated, role } = useAuth();
  const checkoutEnabled = useFeatures().checkout;
  const mutation = useCreateBooking();
  const { data: slots = [], isLoading: loadingSlots, refetch } = useCoachAvailability(coach.slug);

  const sessions: SessionType[] = coach.session_types ?? [];
  const [pickedSession, setPickedSession] = useState<string | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [week, setWeek] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [needAccount, setNeedAccount] = useState(false);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const sessionId = pickedSession ?? (sessions.length === 1 ? sessions[0].id : null);
  const session = sessions.find((s) => s.id === sessionId) ?? null;

  useEffect(() => {
    if (session) analytics.startBooking(coach.slug, session.id);
  }, [coach.slug, session]);

  const byDay = useMemo(() => {
    const map = new Map<string, PublicAvailabilitySlot[]>();
    for (const s of [...slots].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
      const k = dayKeyOf(s.starts_at);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [slots]);

  const today = dayKeyOf(new Date().toISOString());
  const days = useMemo(() => Array.from({ length: WEEKS * 7 }, (_, i) => shiftDay(today, i)), [today]);
  const firstOpen = days.findIndex((k) => byDay.has(k));
  const weekIdx = week ?? Math.max(0, Math.floor(firstOpen / 7));
  const slot = slots.find((s) => s.id === slotId) ?? null;

  const isFree = session ? session.price_centavos === 0 : true;
  const comingSoon = Boolean(session && !isFree && !checkoutEnabled);
  const ready = Boolean(session && slot);

  const submit = async () => {
    if (!session || !slot) return;
    setError(null);
    if (comingSoon) {
      setError('Paid sessions are coming soon.');
      return;
    }
    if (!isAuthenticated) {
      setNeedAccount(true);
      return;
    }
    if (role === 'coach') {
      setError('Coach accounts cannot book sessions. Sign in with a student account.');
      return;
    }
    try {
      analytics.checkoutStart(coach.slug, isFree, session.price_centavos / 100);
      const result = await mutation.mutateAsync({
        coach_slug: coach.slug,
        session_type_id: session.id,
        slot_starts_at: slot.starts_at,
        notes: notes.trim() || undefined,
      });
      if (isFree) {
        analytics.bookingConfirmed(true, 'none');
        setDone({ booking: result, session: session.name, when: whenLabel(slot.starts_at), minutes: session.duration_minutes, price: 0 });
      } else if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setError('Your booking was created, but checkout did not open. Finish paying from My bookings.');
      }
    } catch (err) {
      setSlotId(null);
      void refetch();
      setError(err instanceof Error && err.message ? err.message : 'That time may have just been taken. Pick another time and try again.');
    }
  };

  return {
    coach,
    role,
    sessions,
    session,
    sessionId,
    setSession: (id: string) => {
      setPickedSession(id);
      setError(null);
    },
    days,
    byDay,
    weekIdx,
    setWeek,
    dayKey,
    setDay: (k: string) => {
      setDayKey(k);
      setSlotId(null);
      setError(null);
    },
    slotId,
    slot,
    setSlot: (id: string) => {
      setSlotId(id);
      setError(null);
    },
    notes,
    setNotes,
    error,
    done,
    loadingSlots,
    anyOpen: byDay.size > 0,
    isFree,
    comingSoon,
    ready,
    pending: mutation.isPending,
    checkoutEnabled,
    needAccount,
    setNeedAccount,
    submit,
  };
}

export type BookingState = ReturnType<typeof useBooking>;

export const useIsDesktop = () => {
  const query = '(min-width: 1024px)';
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return match;
};

function Fade({ children }: { children: ReactNode }) {
  return (
    <span key={String(children)} className="bk-fade">
      {children}
    </span>
  );
}

function Summary({ b }: { b: BookingState | Done }) {
  const done = 'booking' in b;
  const session = done ? b.session : b.session?.name;
  const when = done ? b.when : b.slot ? whenLabel(b.slot.starts_at) : null;
  const minutes = done ? b.minutes : b.session?.duration_minutes;
  const price = done ? b.price : b.session?.price_centavos;
  return (
    <dl className="bk-sum">
      <div>
        <dt>Session</dt>
        <dd>
          <Fade>{session ?? 'Not chosen yet'}</Fade>
        </dd>
      </div>
      <div>
        <dt>When</dt>
        <dd>
          <Fade>{when ?? 'Not chosen yet'}</Fade>
        </dd>
      </div>
      <div>
        <dt>Duration</dt>
        <dd>
          <Fade>{minutes != null ? `${minutes} min` : '-'}</Fade>
        </dd>
      </div>
      <div className="tot">
        <dt>Total</dt>
        <dd className="num">
          <Fade>{price != null ? formatPHP(price) : '-'}</Fade>
        </dd>
      </div>
    </dl>
  );
}

function DayPicker({ b, pfx }: { b: BookingState; pfx: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ind = useSlidingIndicator(ref, b.dayKey, { box: true });
  const visible = b.days.slice(b.weekIdx * 7, b.weekIdx * 7 + 7);
  const first = visible[0];
  const last = visible[6];
  const range = `${monDayFmt.format(dayDate(first))} to ${monDayFmt.format(dayDate(last))}`;
  return (
    <fieldset>
      <legend>
        <span className="sn" aria-hidden="true">
          2
        </span>
        Day
        <span className="bk-weeknav">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous week"
            disabled={b.weekIdx === 0}
            onClick={() => b.setWeek(b.weekIdx - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <span className="num" aria-live="polite">
            {range}
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next week"
            disabled={b.weekIdx >= WEEKS - 1}
            onClick={() => b.setWeek(b.weekIdx + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </span>
      </legend>
      <div ref={ref} className="bk-days" id={`${pfx}-days`}>
        <span ref={ind} className="slide-ind slide-ind-pick bk-ind" aria-hidden="true" />
        {visible.map((k) => {
          const open = b.byDay.has(k);
          const d = dayDate(k);
          return (
            <button
              key={k}
              type="button"
              data-key={k}
              aria-pressed={b.dayKey === k}
              aria-label={`${longFmt.format(d)}${open ? '' : ', unavailable'}`}
              disabled={!open}
              onClick={() => b.setDay(k)}
            >
              <span>{dowFmt.format(d)}</span>
              <span className="num">{d.getUTCDate()}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TimePicker({ b }: { b: BookingState }) {
  const ref = useRef<HTMLDivElement>(null);
  const ind = useSlidingIndicator(ref, b.slotId, { box: true });
  // The API lists bookable slots only. A time this coach offers on other days but not on this
  // one is treated as taken and shown as unavailable.
  const cells = useMemo(() => {
    if (!b.dayKey) return [];
    const open = b.byDay.get(b.dayKey) ?? [];
    const have = new Set(open.map((s) => timeKeyFmt.format(new Date(s.starts_at))));
    const gone = new Map<string, string>();
    for (const list of b.byDay.values()) {
      for (const s of list) {
        const k = timeKeyFmt.format(new Date(s.starts_at));
        if (!have.has(k) && !gone.has(k)) gone.set(k, timeLabel(s.starts_at));
      }
    }
    return [
      ...open.map((s) => ({ key: timeKeyFmt.format(new Date(s.starts_at)), id: s.id, label: timeLabel(s.starts_at), taken: false })),
      ...[...gone].map(([key, label]) => ({ key, id: `x-${key}`, label, taken: true })),
    ].sort((x, y) => x.key.localeCompare(y.key));
  }, [b.byDay, b.dayKey]);

  return (
    <fieldset>
      <legend>
        <span className="sn" aria-hidden="true">
          3
        </span>
        Time <span className="hint">Manila time</span>
      </legend>
      {b.dayKey ? (
        <div ref={ref} className="bk-times">
          <span ref={ind} className="slide-ind slide-ind-pick bk-ind" aria-hidden="true" />
          {cells.map((c) => (
            <button
              key={c.id}
              type="button"
              data-key={c.id}
              aria-pressed={!c.taken && b.slotId === c.id}
              aria-label={c.taken ? `${c.label}, unavailable` : c.label}
              disabled={c.taken}
              onClick={() => b.setSlot(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="hint">Pick a day to see times.</p>
      )}
    </fieldset>
  );
}

function SignInPrompt({ b }: { b: BookingState }) {
  return (
    <Dialog
      open={b.needAccount}
      onOpenChange={b.setNeedAccount}
      title="Sign in to book"
      description="Create a free student account or sign in to book this session. Your choices are kept while you do."
      size="sm"
      actions={
        <>
          <Link to="/signup" className="btn btn-secondary">
            Create account
          </Link>
          <Link to="/signin" className="btn btn-primary">
            Sign in
          </Link>
        </>
      }
    />
  );
}

export function BookingBody({ b, pfx, heading }: { b: BookingState; pfx: string; heading?: boolean }) {
  if (b.role === 'coach') {
    return (
      <div className="bk">
        {heading ? <h2>Book a session</h2> : null}
        <div className="note">
          <Info aria-hidden="true" />
          <span>Coaches cannot book sessions. Sign in with a student account to book.</span>
        </div>
      </div>
    );
  }
  if (b.done) {
    return (
      <div className="bk-done" aria-live="polite">
        <span className="bk-done-check">
          <Check aria-hidden="true" />
        </span>
        <h2 className="t-h3">You&rsquo;re booked.</h2>
        <Summary b={b.done} />
        <p className="t-small">
          Your session is on the calendar in Manila time. The video link shows up in My bookings.
        </p>
        <Link to="/app/bookings" className="btn btn-primary">
          See my bookings
        </Link>
      </div>
    );
  }
  return (
    <div className="bk">
      {heading ? <h2>Book a session</h2> : null}
      {b.error ? (
        <div className="note is-bad" role="alert">
          <Info aria-hidden="true" />
          <span>{b.error}</span>
        </div>
      ) : null}
      <fieldset>
        <legend>
          <span className="sn" aria-hidden="true">
            1
          </span>
          Session
        </legend>
        {b.sessions.length === 0 ? <p className="hint">This coach has not published any sessions yet.</p> : null}
        {b.sessions.map((s) => {
          const off = s.price_centavos > 0 && !b.checkoutEnabled;
          return (
            <label key={s.id} className={`bk-opt${off ? ' is-off' : ''}`}>
              <input
                type="radio"
                name={`${pfx}-session`}
                value={s.id}
                checked={b.sessionId === s.id}
                disabled={off}
                onChange={() => b.setSession(s.id)}
              />
              <span className="dot" aria-hidden="true" />
              <span className="nm">{s.name}</span>
              <span className="pr">{formatPHP(s.price_centavos)}</span>
              <span className="sub">
                <span className="num">{s.duration_minutes}</span> min{off ? ' · Paid sessions are coming soon' : ''}
              </span>
            </label>
          );
        })}
      </fieldset>

      {b.loadingSlots ? (
        <p className="hint" role="status">
          Loading open times…
        </p>
      ) : b.anyOpen ? (
        <>
          <DayPicker b={b} pfx={pfx} />
          <TimePicker b={b} />
        </>
      ) : (
        <div className="note">
          <Info aria-hidden="true" />
          <span>No open times right now. Check back soon, or try another coach.</span>
        </div>
      )}

      <div className="field">
        <label htmlFor={`${pfx}-note`}>
          <span className="sn" aria-hidden="true" style={{ marginRight: 8 }}>
            4
          </span>
          Note <span className="muted">(optional)</span>
        </label>
        <textarea
          id={`${pfx}-note`}
          className="textarea"
          value={b.notes}
          onChange={(e) => b.setNotes(e.target.value)}
          enterKeyHint="done"
          autoComplete="off"
          maxLength={1000}
          placeholder="Which role is this for? Anything you want to practice?"
        />
      </div>
      <Summary b={b} />
    </div>
  );
}

export function BookingFoot({ b, pfx }: { b: BookingState; pfx: string }) {
  if (b.role === 'coach' || b.done) return null;
  const s = b.session;
  const missing = [!s && 'a session', !b.dayKey && 'a day', b.dayKey && !b.slot && 'a time'].filter(Boolean) as string[];
  const label = b.pending
    ? 'Booking…'
    : b.comingSoon
      ? 'Paid sessions are coming soon'
      : !s
        ? 'Book a session'
        : s.price_centavos === 0
          ? s.is_intro_call
            ? 'Book free intro call'
            : 'Book free session'
          : `Pay ${formatPHP(s.price_centavos)}`;
  const paid = Boolean(s && s.price_centavos > 0);
  return (
    <div className="bk-cta">
      <button
        type="button"
        className="btn btn-primary btn-lg"
        disabled={!b.ready || b.pending || b.comingSoon}
        aria-describedby={b.ready ? undefined : `${pfx}-help`}
        onClick={() => void b.submit()}
      >
        {b.pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {label}
      </button>
      {paid && b.checkoutEnabled ? <p className="t-meta">GCash, Maya, or card on the secure checkout page</p> : null}
      {!b.ready && !b.comingSoon ? (
        <p className="t-meta" id={`${pfx}-help`}>
          {b.anyOpen || b.loadingSlots ? `Choose ${missing.join(', ').replace(/, ([^,]*)$/, ' and $1')} to continue.` : 'No open times to book yet.'}
        </p>
      ) : null}
      <p className="t-meta">
        Free cancellation until 24 hours before. After that it&rsquo;s non-refundable.{' '}
        <Link to="/refunds">Refund policy</Link>
      </p>
      <SignInPrompt b={b} />
    </div>
  );
}
