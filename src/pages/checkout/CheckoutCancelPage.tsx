import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useStudentBookings, useResumeCheckout } from '../../services/queries';
import { formatDateTime, formatPHP } from '../../lib/utils';

interface CheckoutCancelPageProps {
  navigate: (path: string) => void;
}

export const CheckoutCancelPage: React.FC<CheckoutCancelPageProps> = ({ navigate }) => {
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = searchParams.get('booking_id');

  const { data: bookings } = useStudentBookings('upcoming');
  const booking = bookings?.find((b) => b.booking_id === bookingId);

  const resumeCheckoutMutation = useResumeCheckout();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRetryCheckout = async () => {
    if (!bookingId) return;
    setErrorMsg(null);
    try {
      const res = await resumeCheckoutMutation.mutateAsync(bookingId);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setErrorMsg('Unable to retrieve checkout session. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resume payment session.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]/30 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-semibold">
            Checkout Incomplete
          </div>

          <h1 className="text-2xl font-bold text-[#021F53]">Payment Cancelled</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            You exited the checkout process before payment was completed. Your coaching session slot is temporarily reserved but not yet confirmed.
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {booking && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Coach:</span>
                <span className="font-semibold text-[#021F53]">{booking.coach_display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-semibold text-[#021F53]">{formatDateTime(booking.slot_starts_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-semibold text-[#3f58b2]">
                  {formatPHP(booking.amount_due_centavos ?? booking.price_centavos)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            {bookingId && (
              <button
                type="button"
                onClick={handleRetryCheckout}
                disabled={resumeCheckoutMutation.isPending}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#3f58b2] text-white hover:bg-[#021F53] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {resumeCheckoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/coaches')}
              className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Coaches</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
