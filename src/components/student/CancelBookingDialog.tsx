import { AlertCircle, Check } from 'lucide-react';
import { useRef, useState } from 'react';
import { useCancelBooking } from '../../services/queries';
import type { StudentBooking } from '../../types/api';
import { formatDateTime, formatPHP } from '../../lib/utils';
import { Dialog, DialogClose, Disc, toast } from '../ui';

export type BookingX = StudentBooking & { session_type_name?: string; has_reviewed?: boolean; coach_avatar_url?: string | null };

type Kind = 'free' | 'unpaid' | 'full' | 'none';

/** Policy preview only (BR refund rules: >24h full refund, inside 24h none). Amounts are the API's price, formatted, never computed. */
function kindOf(b: StudentBooking): Kind {
  if (b.price_centavos === 0) return 'free';
  if (b.payment_status !== 'paid') return 'unpaid';
  return new Date(b.slot_starts_at).getTime() - Date.now() >= 24 * 36e5 ? 'full' : 'none';
}

export function CancelBookingDialog({ booking, onClose }: { booking: BookingX | null; onClose: () => void }) {
  const cancel = useCancelBooking();
  const [error, setError] = useState<string | null>(null);
  const shown = useRef<BookingX | null>(booking);
  if (booking) shown.current = booking;
  const b = shown.current;

  const confirm = async () => {
    if (!b) return;
    setError(null);
    try {
      const res = await cancel.mutateAsync(b.booking_id);
      const k = kindOf(b);
      toast.success(
        k === 'free'
          ? 'Session cancelled. The time slot is open again.'
          : k === 'unpaid'
            ? 'Session cancelled. You weren’t charged.'
            : res.payment_status === 'refunded'
              ? `Session cancelled. Your ${formatPHP(b.price_centavos)} refund has started.`
              : 'Session cancelled. No refund was issued because it was within 24 hours.'
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'We couldn’t cancel this session. Try again.');
    }
  };

  const kind = b ? kindOf(b) : 'free';
  const note = {
    free: ['is-ok', 'This session is free, so there is nothing to refund. The time slot goes back to the coach.'],
    unpaid: ['is-ok', 'You haven’t paid for this session yet, so nothing is charged. The time slot is released.'],
    full: ['is-ok', `You’ll get a full refund of ${b ? formatPHP(b.price_centavos) : ''}.`],
    none: ['is-warn', 'This session is less than 24 hours away, so it isn’t refundable.'],
  }[kind];

  return (
    <Dialog
      open={!!booking}
      onOpenChange={(o) => {
        if (!o) {
          setError(null);
          onClose();
        }
      }}
      title="Cancel this session?"
      actions={
        <>
          <DialogClose className="btn btn-ghost">Keep session</DialogClose>
          <button type="button" className="btn btn-danger" onClick={confirm} disabled={cancel.isPending}>
            {cancel.isPending ? 'Cancelling…' : 'Cancel session'}
          </button>
        </>
      }
    >
      {b ? (
        <div className="grid gap-4">
          <div className="flex items-center gap-3.5">
            <Disc name={b.coach_display_name || 'Coach'} size="sm" src={b.coach_avatar_url} />
            <div className="min-w-0">
              <b className="block font-display text-lg leading-tight font-normal text-tx">
                {b.session_type_name || 'Coaching session'} with {b.coach_display_name}
              </b>
              <p className="t-small">
                <span className="num">{formatDateTime(b.slot_starts_at)}</span>, Manila time
              </p>
            </div>
          </div>
          <div className={`note ${note[0]}`}>
            <Check aria-hidden="true" />
            <span className="num-inline">{note[1]}</span>
          </div>
          <p className="t-meta">
            Cancel more than 24 hours before the session for a full refund. Inside 24 hours it isn’t refundable. If a
            coach cancels, you always get a full refund.
          </p>
          {error ? (
            <div className="note is-bad" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
