import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { whenLabel } from '../../components/coaching/Booking';
import { Disc, Skeleton } from '../../components/ui';
import { formatPHP } from '../../lib/utils';
import { useFeatures, useResumeCheckout, useStudentBookings } from '../../services/queries';
import '../../components/coaching/coaching.css';

interface CheckoutCancelPageProps {
  navigate: (path: string) => void;
}

export function CheckoutCancelPage(_props: CheckoutCancelPageProps) {
  const bookingId = new URLSearchParams(window.location.search).get('booking_id');
  const { data: bookings, isLoading } = useStudentBookings('upcoming');
  const booking = bookings?.find((b) => b.booking_id === bookingId) ?? null;

  const resume = useResumeCheckout();
  const features = useFeatures();
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
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

  const due = booking ? (booking.amount_due_centavos ?? booking.price_centavos) : 0;

  return (
    <div className="pd">
      <div className="pd-col" aria-busy={isLoading}>
        <h1 className="t-h1">Payment not finished</h1>
        {isLoading ? (
          <Skeleton variant="block" height={150} />
        ) : (
          <>
            <p className="t-body">
              {booking
                ? `Your ${whenLabel(booking.slot_starts_at)} session isn’t booked until the payment goes through.`
                : 'Your session isn’t booked until the payment goes through.'}
            </p>
            {booking ? (
              <div className="panel pd-sum">
                <div className="who">
                  <Disc name={booking.coach_display_name} size="sm" />
                  <h2 className="t-title">{booking.coach_display_name}</h2>
                </div>
                <dl>
                  <div>
                    <dt>When, Manila time</dt>
                    <dd className="num">{whenLabel(booking.slot_starts_at)}</dd>
                  </div>
                  <div className="tot">
                    <dt>Amount due</dt>
                    <dd className="num">{formatPHP(due)}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
            {error ? (
              <div className="note is-bad" role="alert">
                <span>{error}</span>
              </div>
            ) : null}
            <div className="pd-acts">
              {bookingId ? (
                <button type="button" className="btn btn-primary" onClick={() => void finish()} disabled={resume.isPending || !features.checkout}>
                  {resume.isPending ? 'Opening checkout…' : features.checkout ? `Finish paying${booking ? ` ${formatPHP(due)}` : ''}` : 'Paid sessions are coming soon'}
                </button>
              ) : null}
              {booking ? (
                <Link to="/coaches/$slug" params={{ slug: booking.coach_slug }} className="btn btn-secondary">
                  Choose another time
                </Link>
              ) : (
                <Link to="/coaches" className="btn btn-secondary">
                  Back to coaches
                </Link>
              )}
            </div>
            <p className="t-meta">If you already paid, don’t pay again. Check My bookings in a minute.</p>
          </>
        )}
      </div>
    </div>
  );
}
