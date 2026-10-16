import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquareHeart,
  RefreshCw,
  Video,
} from 'lucide-react';
import { useStudentBookings } from '../../services/queries';
import { formatDateTime, formatPHP } from '../../lib/utils';
import { analytics } from '../../lib/analytics';
import { FeedbackModal } from '../../components/common/FeedbackModal';

interface CheckoutSuccessPageProps {
  navigate: (path: string) => void;
}

export const CheckoutSuccessPage: React.FC<CheckoutSuccessPageProps> = ({ navigate }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = searchParams.get('booking_id');

  const { data: bookings, isLoading, refetch, isRefetching } = useStudentBookings('upcoming');
  const booking = bookings?.find((b) => b.booking_id === bookingId);

  useEffect(() => {
    if (booking) {
      analytics.bookingConfirmed(booking.price_centavos === 0, booking.payment_status);
    }
  }, [booking]);

  const isPending = booking?.status === 'pending' || booking?.payment_status === 'pending';

  return (
    <div className="min-h-screen bg-[#f0f7ff]/30 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#3f58b2] animate-spin" />
              <p className="text-sm text-slate-600 font-medium">Verifying booking status...</p>
            </div>
          ) : !booking ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-[#021F53]">Payment Received</h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you! We received your return from the payment gateway. Your session confirmation is processing.
              </p>
              {bookingId && (
                <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 inline-block">
                  Reference: {bookingId}
                </div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/app/bookings')}
                  className="px-6 py-2.5 bg-[#3f58b2] text-white hover:bg-[#021F53] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Go to My Bookings
                </button>
              </div>
            </div>
          ) : isPending ? (
            // BR-007: Show pending, NEVER confirmed until webhook verifies
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-semibold">
                Status: Payment Pending Verification
              </div>
              <h1 className="text-2xl font-bold text-[#021F53]">Payment Processing</h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your payment is currently being verified with the payment gateway. Per platform security (BR-007), bookings are finalized upon server webhook confirmation.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coach:</span>
                  <span className="font-semibold text-[#021F53]">{booking.coach_display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-semibold text-[#021F53]">{formatDateTime(booking.slot_starts_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-semibold text-[#3f58b2]">{formatPHP(booking.price_centavos)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                  <span>Check Confirmation Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/app/bookings')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#3f58b2] text-white hover:bg-[#021F53] text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  Go to My Bookings
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-semibold">
                Status: Confirmed
              </div>
              <h1 className="text-2xl font-bold text-[#021F53]">Session Confirmed!</h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your 1-on-1 mentorship session with <strong>{booking.coach_display_name}</strong> is locked in.
              </p>

              <div className="p-4 bg-[#f0f7ff] rounded-xl border border-[#3f58b2]/20 text-left space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Coach:</span>
                  <span className="font-bold text-[#021F53]">{booking.coach_display_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-semibold text-[#021F53]">{formatDateTime(booking.slot_starts_at)} (PHT)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Session Fee:</span>
                  <span className="font-bold text-[#3f58b2]">{formatPHP(booking.price_centavos)}</span>
                </div>
                {booking.join_url && (
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-[#3f58b2]" />
                      Meeting Link:
                    </span>
                    <a
                      href={booking.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3f58b2] hover:underline font-semibold flex items-center gap-1"
                    >
                      Join Meeting <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/app/bookings')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#3f58b2] text-white hover:bg-[#021F53] text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  View in My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/coaches')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  Browse More Coaches
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9b00]/10 text-[#ff9b00] flex items-center justify-center flex-shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#021F53]">Help us improve iSkolar</h4>
              <p className="text-[11px] text-slate-500">Tell us about your booking experience in a 1-minute survey.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#021F53] text-xs font-bold rounded-xl flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer"
          >
            <span>Send Feedback</span>
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};
