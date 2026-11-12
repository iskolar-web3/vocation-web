import { SiteLink } from '../../components/layout/shell';
import { AlertCircle, Calendar } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { BookingItem } from '../../components/student/BookingItem';
import { type BookingX, CancelBookingDialog } from '../../components/student/CancelBookingDialog';
import { PageHead } from '../../components/student/forms';
import { Empty, Skeleton, TabPanel, Tabs, toast } from '../../components/ui';
import { RatingModal } from '../../components/common/RatingModal';
import { useAuth } from '../../context/AuthContext';
import { useFeatures, useResumeCheckout, useStudentBookings } from '../../services/queries';

interface StudentBookingsPageProps {
  navigate: (path: string) => void;
}

type When = 'upcoming' | 'past';

export const StudentBookingsPage: React.FC<StudentBookingsPageProps> = () => {
  const { role } = useAuth();
  const features = useFeatures();
  const [tab, setTab] = useState<When>('upcoming');
  const { data: all = [], isLoading, error, refetch } = useStudentBookings(undefined, { enabled: role === 'student' });
  const resumeCheckout = useResumeCheckout();

  const [reviewBooking, setReviewBooking] = useState<BookingX | null>(null);
  const [cancelling, setCancelling] = useState<BookingX | null>(null);
  const [rated, setRated] = useState<Set<string>>(new Set());
  const [payingId, setPayingId] = useState<string | null>(null);

  // Strict mutual exclusion: Upcoming & active vs Past (cancelled, completed or lapsed)
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: BookingX[] = [];
    const pa: BookingX[] = [];
    for (const b of all as BookingX[]) {
      const ended = new Date(b.slot_ends_at || b.slot_starts_at).getTime() < now;
      (b.status === 'cancelled' || b.status === 'completed' || ended ? pa : up).push(b);
    }
    up.sort((a, b) => a.slot_starts_at.localeCompare(b.slot_starts_at));
    pa.sort((a, b) => b.slot_starts_at.localeCompare(a.slot_starts_at));
    return { upcoming: up, past: pa };
  }, [all]);

  const handlePay = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const res = await resumeCheckout.mutateAsync(bookingId);
      if (res?.checkout_url) window.location.href = res.checkout_url;
      else toast.error('We couldn’t open checkout. Try again in a moment.');
    } catch (err: any) {
      toast.error(err.message || 'We couldn’t open checkout for this booking.');
    } finally {
      setPayingId(null);
    }
  };

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="wrap py-6 min-[721px]:py-10">
      <PageHead
        title="Bookings"
        action={
          <SiteLink to="/coaches" className="btn btn-secondary">
            Book a coach
          </SiteLink>
        }
      />

      {isLoading ? (
        <div className="grid gap-2.5" aria-busy="true">
          <Skeleton variant="row" count={3} />
        </div>
      ) : error ? (
        <div className="grid justify-items-start gap-3.5">
          <div className="note is-bad" role="alert">
            <AlertCircle aria-hidden="true" />
            <span>We couldn’t load your bookings. Check your connection and try again.</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : all.length === 0 ? (
        <Empty
          icon={Calendar}
          title="No sessions yet"
          body="Many coaches offer a free intro call. Book one to get started."
          action={
            <SiteLink to="/coaches" className="btn btn-brand">
              Browse coaches
            </SiteLink>
          }
        />
      ) : (
        <>
          <Tabs
            label="Bookings"
            idBase="bk"
            value={tab}
            onValueChange={setTab}
            className="mb-5"
            options={[
              { value: 'upcoming', label: 'Upcoming', count: upcoming.length },
              { value: 'past', label: 'Past', count: past.length },
            ]}
          />
          {(['upcoming', 'past'] as const).map((w) => (
            <TabPanel key={w} idBase="bk" value={w} active={tab === w}>
              <h2 className="sr-only">{w === 'upcoming' ? 'Upcoming sessions' : 'Past sessions'}</h2>
              {list.length ? (
                <div className="grid gap-2.5">
                  {list.map((b) => (
                    <BookingItem
                      key={b.booking_id}
                      booking={b}
                      rated={rated.has(b.booking_id)}
                      onPay={handlePay}
                      payPending={payingId === b.booking_id}
                      onCancel={setCancelling}
                      onReview={setReviewBooking}
                      payDisabled={!features.checkout}
                    />
                  ))}
                </div>
              ) : (
                <Empty
                  icon={Calendar}
                  title={w === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
                  body={w === 'upcoming' ? 'Book a coach and it will show up here.' : 'Finished and cancelled sessions land here.'}
                  action={
                    w === 'upcoming' ? (
                      <SiteLink to="/coaches" className="btn btn-brand">
                        Browse coaches
                      </SiteLink>
                    ) : undefined
                  }
                />
              )}
            </TabPanel>
          ))}
        </>
      )}

      <CancelBookingDialog booking={cancelling} onClose={() => setCancelling(null)} />
      <RatingModal
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        booking={reviewBooking}
        onRated={(id) => setRated((s) => new Set(s).add(id))}
      />
    </div>
  );
};
