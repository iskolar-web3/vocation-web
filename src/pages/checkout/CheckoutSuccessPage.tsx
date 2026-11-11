import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Disc, Skeleton, Status } from '../../components/ui';
import { whenLabel } from '../../components/coaching/Booking';
import { analytics } from '../../lib/analytics';
import { formatPHP } from '../../lib/utils';
import { useFeatures, useResumeCheckout, useStudentBookings } from '../../services/queries';
import type { BookingItem } from '../../types/api';
import '../../components/coaching/coaching.css';

/* BR-007: "confirmed" only when the API says confirmed. The browser returning from checkout
   proves nothing; everything else reads as confirming until the webhook lands. */

interface CheckoutSuccessPageProps {
  navigate: (path: string) => void;
}

const FAST_MS = 4000;
const SLOW_AFTER_MS = 90_000;
const SLOW_MS = 10_000;
const GIVE_UP_MS = 300_000;

type View = 'confirming' | 'slow' | 'confirmed' | 'failed' | 'expired';

const viewOf = (b: BookingItem, slow: boolean): View => {
  if (b.status === 'confirmed' || b.status === 'completed') return 'confirmed';
  if (b.payment_status === 'expired') return 'expired';
  if (b.payment_status === 'failed') return 'failed';
  return slow ? 'slow' : 'confirming';
};

const minutesOf = (b: BookingItem) =>
  b.slot_ends_at ? Math.round((new Date(b.slot_ends_at).getTime() - new Date(b.slot_starts_at).getTime()) / 60000) : null;

function Summary({ b, totalLabel, amount, rise }: { b: BookingItem | null; totalLabel: string; amount?: number; rise?: boolean }) {
  if (!b) return null;
  const mins = minutesOf(b);
  return (
    <div className={`panel pd-sum${rise ? ' pd-rise' : ''}`} style={rise ? { ['--i' as string]: 1 } : undefined}>
      <div className="who">
        <Disc name={b.coach_display_name} size="sm" />
        <h2 className="t-title">{b.coach_display_name}</h2>
      </div>
      <dl>
        <div>
          <dt>When, Manila time</dt>
          <dd className="num">{whenLabel(b.slot_starts_at)}</dd>
        </div>
        {mins ? (
          <div>
            <dt>Duration</dt>
            <dd className="num">{mins} min</dd>
          </div>
        ) : null}
        <div className="tot">
          <dt>{totalLabel}</dt>
          <dd className="num">{formatPHP(amount ?? b.price_centavos)}</dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd className="num">{b.booking_id}</dd>
        </div>
      </dl>
    </div>
  );
}

export function CheckoutSuccessPage(_props: CheckoutSuccessPageProps) {
  const bookingId = new URLSearchParams(window.location.search).get('booking_id');
  const upcoming = useStudentBookings('upcoming');
  const foundUpcoming = upcoming.data?.find((x) => x.booking_id === bookingId);
  // a failed or expired booking leaves the upcoming list, so look in past before giving up
  const past = useStudentBookings('past', { enabled: Boolean(bookingId) && !upcoming.isLoading && !foundUpcoming });
  const booking = foundUpcoming ?? past.data?.find((x) => x.booking_id === bookingId) ?? null;
  const loading = upcoming.isLoading || (!booking && past.isLoading);

  const features = useFeatures();
  const resume = useResumeCheckout();
  const [error, setError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const started = useRef(Date.now());

  const view = booking ? viewOf(booking, slow) : null;
  const waiting = !loading && (view === null || view === 'confirming' || view === 'slow');
  const { refetch: refetchUp } = upcoming;
  const { refetch: refetchPast } = past;
  const recheck = () => {
    void refetchUp();
    if (!booking) void refetchPast();
  };

  // "This page updates by itself": poll while waiting, slower once it drags on, stop after a while.
  useEffect(() => {
    if (!waiting) return;
    let t = 0;
    const tick = () => {
      const age = Date.now() - started.current;
      if (age > SLOW_AFTER_MS) setSlow(true);
      if (age > GIVE_UP_MS) return;
      recheck();
      t = window.setTimeout(tick, age > SLOW_AFTER_MS ? SLOW_MS : FAST_MS);
    };
    t = window.setTimeout(tick, FAST_MS);
    return () => window.clearTimeout(t);
  }, [waiting]);

  useEffect(() => {
    if (view === 'confirmed' && booking) analytics.bookingConfirmed(booking.price_centavos === 0, booking.payment_status);
  }, [view, booking]);

  const retry = async () => {
    if (!bookingId) return;
    setError(null);
    try {
      const res = await resume.mutateAsync(bookingId);
      if (res.checkout_url) window.location.href = res.checkout_url;
      else setError('Checkout did not open. Please try again in a moment.');
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Could not restart payment.');
    }
  };

  const bookingsLink = (
    <Link to="/app/bookings" className="btn btn-primary">
      Go to my bookings
    </Link>
  );
  const again = (
    <button type="button" className="btn btn-secondary" onClick={recheck} disabled={upcoming.isFetching}>
      Check again
    </button>
  );

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div aria-busy="true" style={{ display: 'grid', gap: 16, justifyItems: 'center', width: '100%' }}>
        <Skeleton width={160} height={28} />
        <Skeleton width={220} height={36} />
        <Skeleton variant="block" height={150} />
      </div>
    );
  } else if (!booking) {
    body = (
      <>
        <Status status="confirming" />
        <h1 className="t-h1">Payment received</h1>
        <p className="t-body">
          We’re matching it to your booking. Your session is confirmed once the payment provider confirms it. This page updates by itself,
          and the booking will show in My bookings. Please don’t pay again.
        </p>
        <div className="bar-shimmer pd-bar" role="progressbar" aria-label="Looking for your booking" />
        {bookingId ? <p className="t-meta num">Reference {bookingId}</p> : null}
        <div className="pd-acts">
          {bookingsLink}
          {again}
        </div>
      </>
    );
  } else if (view === 'confirmed') {
    body = (
      <>
        <span className="pd-check" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="t-h1 pd-rise" style={{ ['--i' as string]: 0 }}>
          You’re booked.
        </h1>
        <p className="t-body pd-rise" style={{ ['--i' as string]: 0 }}>
          Your session with {booking.coach_display_name} is confirmed for {whenLabel(booking.slot_starts_at)}, Manila time.
          {booking.join_url ? '' : ' The meeting link shows up in My bookings.'}
        </p>
        <Summary b={booking} totalLabel={booking.price_centavos ? 'Total paid' : 'Total'} rise />
        <div className="pd-acts pd-rise" style={{ ['--i' as string]: 2 }}>
          {booking.join_url ? (
            <a className="btn btn-secondary" href={booking.join_url} target="_blank" rel="noopener noreferrer">
              Open meeting link
            </a>
          ) : null}
          {bookingsLink}
        </div>
      </>
    );
  } else if (view === 'failed' || view === 'expired') {
    body = (
      <>
        <Status status={view} />
        <h1 className="t-h1">{view === 'expired' ? 'Payment window closed' : 'Payment didn’t go through'}</h1>
        <p className="t-body">You weren’t charged for this attempt. You can try again, or pick another time.</p>
        {error ? (
          <div className="note is-bad" role="alert">
            <span>{error}</span>
          </div>
        ) : null}
        <Summary b={booking} totalLabel="Amount due" amount={booking.amount_due_centavos ?? booking.price_centavos} />
        <div className="pd-acts">
          <button type="button" className="btn btn-primary" onClick={() => void retry()} disabled={resume.isPending || !features.checkout}>
            {resume.isPending ? 'Opening checkout…' : 'Try again'}
          </button>
          <Link to="/coaches/$slug" params={{ slug: booking.coach_slug }} className="btn btn-secondary">
            Choose another time
          </Link>
        </div>
      </>
    );
  } else if (view === 'slow') {
    body = (
      <>
        <span className="status status-wait">Still confirming</span>
        <h1 className="t-h1">Still confirming</h1>
        <p className="t-body">
          This is taking longer than usual. Your payment is with the provider and we keep checking. Please don’t pay again. The booking
          will show as confirmed in My bookings once it goes through.
        </p>
        <Summary b={booking} totalLabel="Amount" amount={booking.amount_due_centavos ?? booking.price_centavos} />
        <div className="pd-acts">
          {bookingsLink}
          {again}
        </div>
      </>
    );
  } else {
    body = (
      <>
        <Status status="confirming" />
        <h1 className="t-h1">Almost there</h1>
        <p className="t-body">
          We’re waiting for the payment provider to confirm. This page updates by itself, so you can leave it open. Please don’t pay
          again.
        </p>
        <div className="bar-shimmer pd-bar" role="progressbar" aria-label="Confirming payment" />
        <Summary b={booking} totalLabel="Amount" amount={booking.amount_due_centavos ?? booking.price_centavos} />
      </>
    );
  }

  return (
    <div className="pd">
      <div className="pd-col" key={loading ? 'loading' : (view ?? 'none')}>
        {body}
      </div>
    </div>
  );
}
