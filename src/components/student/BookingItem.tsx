import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  CreditCard,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Booking } from '../../types';
import { formatDateTime, formatPHP } from '../../lib/utils';

interface BookingItemProps {
  booking: Booking;
  onPay: (booking: Booking) => void;
  onReview: (booking: Booking) => void;
}

export const BookingItem: React.FC<BookingItemProps> = ({ booking, onPay, onReview }) => {
  const getStatusBadge = () => {
    switch (booking.status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Pending Payment</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-[#3f58b2]/30 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <img
            src={booking.coachAvatar}
            alt={booking.coachName}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div>
            <div className="text-[10px] font-bold text-[#3f58b2] uppercase tracking-wider">
              {booking.coachRole}
            </div>
            <h4 className="text-base font-bold text-[#021F53] font-headline mt-0.5">
              {booking.sessionTypeName}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Coach: <strong>{booking.coachName}</strong> ({booking.sessionDuration} mins)
            </p>
          </div>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1.5">
          {getStatusBadge()}
          <span className="text-xs font-bold text-[#021F53]">
            {formatPHP(booking.priceCentavos)}
          </span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#021F53] font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#3f58b2]" />
          <span>{formatDateTime(booking.slotStartsAt)}</span>
        </div>

        {booking.notes && (
          <div className="text-slate-500 italic max-w-sm truncate text-[11px]">
            Goal: "{booking.notes}"
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
        {booking.status === 'confirmed' && booking.joinUrl && (
          <a
            href={booking.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join Video Call</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        )}

        {booking.status === 'pending' && (
          <button
            type="button"
            onClick={() => onPay(booking)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay with PayMongo</span>
          </button>
        )}

        {booking.status === 'completed' && !booking.hasReviewed && (
          <button
            type="button"
            onClick={() => onReview(booking)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#021F53] bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-[#ff9b00] text-[#ff9b00]" />
            <span>Rate This Session (BR-010)</span>
          </button>
        )}

        {booking.status === 'completed' && booking.hasReviewed && (
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Review Submitted</span>
          </span>
        )}
      </div>
    </div>
  );
};

