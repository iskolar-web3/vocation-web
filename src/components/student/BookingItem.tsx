import { Check, Star, Video } from 'lucide-react';
import { ComingSoonBadge } from '../common/ComingSoonBadge';
import { Disc, Status } from '../ui';
import { formatDateTime, formatPHP } from '../../lib/utils';
import type { BookingX } from './CancelBookingDialog';

/** BR-007: a paid booking is only "confirmed" when the API says so. Pending stays "waiting for payment". */
export function statusOf(b: BookingX): string {
  if (b.status === 'cancelled') return b.payment_status === 'refunded' ? 'refunded' : 'cancelled';
  if (b.payment_status === 'failed') return 'failed';
  if (b.payment_status === 'expired') return 'expired';
  return b.status;
}

interface BookingItemProps {
  booking: BookingX;
  onPay: (bookingId: string) => void;
  onCancel: (booking: BookingX) => void;
  onReview?: (booking: BookingX) => void;
  payDisabled?: boolean;
  payPending?: boolean;
  /** Rated during this visit (the API may not echo it back yet). */
  rated?: boolean;
}

export function BookingItem({ booking: b, onPay, onCancel, onReview, payDisabled, payPending, rated }: BookingItemProps) {
  const coach = b.coach_display_name || 'Coach';
  const session = b.session_type_name || 'Coaching session';
  const full = `${session} with ${coach}`;
  const needsPay = b.status === 'pending' || b.payment_status === 'failed' || b.payment_status === 'expired';
  const retry = b.payment_status === 'failed' || b.payment_status === 'expired';
  const cancellable = b.status === 'confirmed' || b.status === 'pending';
  const refunded = b.status === 'cancelled' && b.payment_status === 'refunded';
  const price = b.amount_due_centavos ?? b.price_centavos;
  const hasActions = (b.status === 'confirmed' && b.join_url) || needsPay || cancellable || b.status === 'completed';

  return (
    <article className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-4 gap-y-1.5 rounded-[var(--r-lg)] border border-line bg-surface p-4 min-[721px]:grid-cols-[56px_minmax(0,1fr)_auto]">
      <Disc name={coach} src={b.coach_avatar_url} className="max-[720px]:!size-10 max-[720px]:!text-[15px]" />
      <div className="min-w-0">
        <h3 className="font-display text-lg leading-snug font-normal text-tx">{coach}</h3>
        <p className="text-sm text-tx-2">{session}</p>
        <p className="mt-0.5 text-sm text-tx-2">
          <span className="num">{formatDateTime(b.slot_starts_at)}</span>, Manila time
        </p>
        <p className="text-[13px] text-tx-3">
          Ref <span className="num">{b.booking_id.slice(0, 8)}</span>
        </p>
      </div>
      <div className="col-span-full mt-1.5 flex items-center justify-between min-[721px]:col-span-1 min-[721px]:mt-0 min-[721px]:grid min-[721px]:justify-items-end min-[721px]:gap-2">
        <span className="num t-title">{formatPHP(price)}</span>
        <Status status={statusOf(b)} />
      </div>

      {hasActions || refunded ? (
        <div className="col-span-full mt-2.5 flex flex-wrap items-center gap-2 min-[721px]:col-start-2 min-[721px]:col-end-[-1]">
          {b.status === 'confirmed' && b.join_url ? (
            <a
              className="btn btn-brand btn-sm max-[720px]:!h-11 max-[720px]:flex-1"
              href={b.join_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Join video call for ${full}`}
            >
              <Video aria-hidden="true" />
              Join video call
            </a>
          ) : null}

          {needsPay ? (
            <>
              <button
                type="button"
                className="btn btn-brand btn-sm max-[720px]:!h-11 max-[720px]:flex-1"
                onClick={() => onPay(b.booking_id)}
                disabled={payDisabled || payPending}
                aria-label={`${retry ? 'Retry payment' : 'Finish paying'} for ${full}`}
              >
                {payPending ? 'Opening checkout…' : retry ? 'Retry payment' : 'Finish paying'}
              </button>
              {payDisabled ? <ComingSoonBadge /> : null}
            </>
          ) : null}

          {cancellable ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm max-[720px]:!h-11"
              onClick={() => onCancel(b)}
              aria-label={`Cancel ${full}`}
            >
              Cancel
            </button>
          ) : null}

          {b.status === 'completed' ? (
            b.has_reviewed || rated ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-tx-2">
                <Star className="size-[15px] fill-honey text-honey" aria-hidden="true" />
                You rated this session
              </span>
            ) : onReview ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm max-[720px]:!h-11"
                onClick={() => onReview(b)}
                aria-label={`Rate ${full}`}
              >
                Rate session
              </button>
            ) : null
          ) : null}

          {refunded ? (
            <div className="note is-ok basis-full">
              <Check aria-hidden="true" />
              <span>
                <span className="num">{formatPHP(b.price_centavos)}</span> refunded.
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
