import React, { useState } from 'react';
import {
  Clock,
  Video,
  CreditCard,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  XCircle,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { StudentBooking } from '../../types/api';
import { formatDateTime, formatPHP, formatTimeOnly } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { ComingSoonBadge } from '../common/ComingSoonBadge';

interface BookingItemProps {
  booking: StudentBooking;
  onPay: (bookingId: string) => void;
  onCancel: (booking: StudentBooking) => void;
  onReview?: (booking: StudentBooking) => void;
  payDisabled?: boolean;
}

export const BookingItem: React.FC<BookingItemProps> = ({
  booking,
  onPay,
  onCancel,
  onReview,
  payDisabled = false,
}) => {
  const getStatusBadge = () => {
    if (booking.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <XCircle className="w-3 h-3 text-slate-500" />
          <span>Cancelled {booking.payment_status === 'refunded' ? '(Refunded)' : ''}</span>
        </span>
      );
    }

    if (booking.payment_status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          <span>Payment Failed</span>
        </span>
      );
    }

    if (booking.payment_status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#f0f7ff] text-slate-700 border border-slate-200">
          <AlertCircle className="w-3 h-3 text-slate-500" />
          <span>Payment Expired</span>
        </span>
      );
    }

    switch (booking.status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#f0f7ff] text-[#1d4ed8] border border-[#607ef2]/30">
            <CheckCircle2 className="w-3 h-3 text-[#2563eb]" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#f0f7ff] text-[#021F53] border border-[#607ef2]/20">
            <AlertCircle className="w-3 h-3 text-[#2563eb]" />
            <span>Pending Payment</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
            <CheckCircle2 className="w-3 h-3 text-[#3f58b2]" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            <span>{booking.status}</span>
          </span>
        );
    }
  };

  const coachName = booking.coach_display_name || 'Coach';
  const priceCentavos = booking.amount_due_centavos ?? booking.price_centavos;
  const isCancellable =
    booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#3f58b2]/30 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#021F53] text-white font-bold flex items-center justify-center text-base flex-shrink-0">
            {coachName.charAt(0)}
          </div>
          <div>
            <h4 className="text-base font-bold text-[#021F53]">
              1-on-1 Mentorship with {coachName}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Coach: <strong>{coachName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1.5">
          {getStatusBadge()}
          <span className="text-xs font-bold text-[#021F53]">
            {formatPHP(booking.price_centavos)}
          </span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#021F53] font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#3f58b2]" />
          <span>{formatDateTime(booking.slot_starts_at)}</span>
        </div>

        <div className="text-slate-500 text-[11px]">
          Ref: <span className="font-mono">{booking.booking_id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Action Row */}
      <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
        {booking.status === 'confirmed' && booking.join_url && (
          <a
            href={booking.join_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join Video Call</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        )}

        {(booking.status === 'pending' ||
          booking.payment_status === 'failed' ||
          booking.payment_status === 'expired') && (
          <>
            <button
              type="button"
              onClick={() => onPay(booking.booking_id)}
              disabled={payDisabled}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{booking.payment_status === 'failed' || booking.payment_status === 'expired' ? 'Retry Payment' : 'Complete Payment'}</span>
            </button>
            {payDisabled && <ComingSoonBadge />}
          </>
        )}

        {isCancellable && (
          <button
            type="button"
            onClick={() => onCancel(booking)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Session</span>
          </button>
        )}

        {booking.status === 'completed' && onReview && (
          <button
            type="button"
            onClick={() => onReview(booking)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#021F53] bg-[#f0f7ff] hover:bg-[#e0efff] border border-[#607ef2]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-[#2563eb] text-[#2563eb]" />
            <span>Rate This Session</span>
          </button>
        )}
      </div>
    </div>
  );
};
