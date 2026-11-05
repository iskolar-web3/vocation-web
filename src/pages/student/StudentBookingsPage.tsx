import React, { useState } from 'react';
import {
  Calendar,
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useStudentBookings, useResumeCheckout, useCancelBooking, useFeatures } from '../../services/queries';
import { useAuth } from '../../context/AuthContext';
import { BookingItem } from '../../components/student/BookingItem';
import { RatingModal } from '../../components/common/RatingModal';
import { Modal } from '../../components/common/Modal';
import { StudentBooking } from '../../types/api';
import { formatDateTime, formatPHP } from '../../lib/utils';

interface StudentBookingsPageProps {
  navigate: (path: string) => void;
}

export const StudentBookingsPage: React.FC<StudentBookingsPageProps> = ({ navigate }) => {
  const { role } = useAuth();
  const features = useFeatures();
  const [activeWhen, setActiveWhen] = useState<'upcoming' | 'past'>('upcoming');
  const { data: allBookings = [], isLoading, error } = useStudentBookings(undefined, { enabled: role === 'student' });

  const resumeCheckoutMutation = useResumeCheckout();
  const cancelBookingMutation = useCancelBooking();

  const [reviewBooking, setReviewBooking] = useState<StudentBooking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<StudentBooking | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Strict mutual exclusion: Upcoming & Active vs Past & Completed (Cancelled or Lapsed)
  const { upcomingBookings, pastBookings } = React.useMemo(() => {
    const now = Date.now();
    const upcoming: StudentBooking[] = [];
    const past: StudentBooking[] = [];

    for (const b of allBookings) {
      const isCancelledOrCompleted = b.status === 'cancelled' || b.status === 'completed';
      const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
      if (isCancelledOrCompleted || sessionEndTime < now) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    }
    return { upcomingBookings: upcoming, pastBookings: past };
  }, [allBookings]);

  const filteredBookings = activeWhen === 'upcoming' ? upcomingBookings : pastBookings;
  const upcomingCount = upcomingBookings.length;
  const pastCount = pastBookings.length;

  const handlePay = async (bookingId: string) => {
    setActionError(null);
    try {
      const res = await resumeCheckoutMutation.mutateAsync(bookingId);
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setActionError('Unable to open checkout session.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Unable to open checkout for this booking.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setActionError(null);
    try {
      const res = await cancelBookingMutation.mutateAsync(cancellingBooking.booking_id);
      const isRefunded = res.payment_status === 'refunded';
      const outcomeText = cancellingBooking.price_centavos === 0
        ? 'Session successfully cancelled and time slot released.'
        : isRefunded
        ? `Booking cancelled. A full refund of ${formatPHP(cancellingBooking.price_centavos)} has been initiated.`
        : 'Booking cancelled. As per policy (within 24 hours of call time), no refund was issued.';

      setCancelSuccessMsg(outcomeText);
      setCancellingBooking(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel booking.');
    }
  };

  // Pre-cancellation refund eligibility calculation (Issue #17 & vocation-server#26)
  const getRefundOutcomePreview = (booking: StudentBooking) => {
    if (booking.price_centavos === 0) {
      return {
        isEligible: true,
        description: 'Free session: the slot will be released back to the coach’s calendar.',
      };
    }

    const sessionTime = new Date(booking.slot_starts_at).getTime();
    const now = Date.now();
    const hoursDiff = (sessionTime - now) / (1000 * 60 * 60);

    if (hoursDiff >= 24) {
      return {
        isEligible: true,
        description: `Full 100% refund eligible (${formatPHP(booking.price_centavos)}). Session is more than 24 hours away.`,
      };
    } else {
      return {
        isEligible: false,
        description: `Non-refundable. Session is scheduled in less than 24 hours (at ${formatDateTime(booking.slot_starts_at)}).`,
      };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/app')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-headline">
            My Mentorship Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your scheduled mock interviews, resume audits, and review past sessions in Asia/Manila time.
          </p>
        </div>

        <button
          onClick={() => navigate('/coaches')}
          className="px-5 py-2.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book a Coach</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {cancelSuccessMsg && (
        <div className="p-3.5 bg-[#f0f7ff] border border-[#607ef2]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#021F53]">
          <CheckCircle2 className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{cancelSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setCancelSuccessMsg(null)}
            className="text-[#2563eb] hover:text-[#021F53] font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter Tabs: Upcoming vs Past (Issue #17 when=past) */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'upcoming', label: `Upcoming & Active (${upcomingCount})` },
          { id: 'past', label: `Past & Completed (${pastCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveWhen(tab.id as any);
              setCancelSuccessMsg(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeWhen === tab.id
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <p className="text-xs text-rose-700 font-bold">Failed to load student bookings.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#3f58b2]/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#021F53]">No sessions in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeWhen === 'upcoming'
                ? 'You do not have any upcoming mentorship calls scheduled.'
                : 'You do not have any completed or cancelled sessions.'}
            </p>
            {activeWhen === 'upcoming' && (
              <button
                onClick={() => navigate('/coaches')}
                className="mt-2 px-5 py-2.5 tactile-btn-primary text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Browse Coaches
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <BookingItem
              key={booking.booking_id}
              booking={booking}
              onPay={handlePay}
              onCancel={(b) => setCancellingBooking(b)}
              onReview={(b) => setReviewBooking(b)}
              payDisabled={!features.checkout}
            />
          ))
        )}
      </div>

      {/* Cancel Confirmation Modal with Pre-Cancellation Refund Outcome (Issue #17 & #19) */}
      {cancellingBooking && (
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          title={
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Cancel Mentorship Session</span>
            </div>
          }
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your session with{' '}
              <strong>{cancellingBooking.coach_display_name}</strong> on{' '}
              <strong>{formatDateTime(cancellingBooking.slot_starts_at)}</strong>?
            </p>

            {/* Refund Outcome Preview */}
            {(() => {
              const preview = getRefundOutcomePreview(cancellingBooking);
              return (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    preview.isEligible
                      ? 'bg-[#f0f7ff] border-[#607ef2]/40 text-[#021F53]'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {preview.isEligible ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2563eb]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                    )}
                    <span>Refund Assessment</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{preview.description}</p>
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-500">
              Per platform cancellation rules, sessions cancelled more than 24 hours in advance receive a full refund. Cancellations made inside 24 hours of call time are strictly non-refundable.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelBookingMutation.isPending}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {cancelBookingMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rating Modal */}
      {reviewBooking && (
        <RatingModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking as any}
        />
      )}
    </div>
  );
};
