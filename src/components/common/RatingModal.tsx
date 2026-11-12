import { AlertCircle, Star } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { type BookingX } from '../student/CancelBookingDialog';
import { Dialog, DialogClose, Disc, toast } from '../ui';
import { cn, formatDateTime } from '../../lib/utils';
import { BookingItem as BookingItemType } from '../../types/api';
import { useCreateReview } from '../../services/queries';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItemType | null;
  /** Called after the review is posted, so a list can mark the row as rated. */
  onRated?: (bookingId: string) => void;
}

/** S-102: 1 to 5 stars plus an optional note. Dismissible (BR-010); shown with the first name only (BR-011). */
export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, booking, onRated }) => {
  const createReviewMutation = useCreateReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [starError, setStarError] = useState(false);
  const shown = useRef<BookingItemType | null>(booking);
  if (booking) shown.current = booking;
  const b = shown.current as BookingX | null;

  const close = () => {
    setRating(0);
    setComment('');
    setErrorMsg(null);
    setStarError(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!b) return;
    setErrorMsg(null);
    if (!rating) return setStarError(true);
    try {
      await createReviewMutation.mutateAsync({
        bookingId: b.booking_id,
        review: { rating, body: comment.trim() || undefined },
      });
      toast.success('Review posted. It shows your first name only.');
      onRated?.(b.booking_id);
      close();
    } catch (err: any) {
      setErrorMsg(err.message || 'We couldn’t post your review. Try again.');
    }
  };

  const pending = createReviewMutation.isPending;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => !o && close()}
      title="Rate your session"
      actions={
        <>
          <DialogClose className="btn btn-ghost">Skip</DialogClose>
          <button type="submit" form="rate-form" className="btn btn-brand" disabled={pending}>
            {pending ? 'Posting…' : 'Post review'}
          </button>
        </>
      }
    >
      {b ? (
        <form id="rate-form" onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="flex items-center gap-3.5">
            <Disc name={b.coach_display_name || 'Coach'} size="sm" src={b.coach_avatar_url} />
            <div className="min-w-0">
              <b className="block font-display text-lg leading-tight font-normal text-tx">
                {b.session_type_name || 'Coaching session'} with {b.coach_display_name}
              </b>
              <p className="t-small num">{formatDateTime(b.slot_starts_at)}</p>
            </div>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <div className="flex items-center justify-between gap-3">
              <legend className="float-left p-0 font-data text-sm font-semibold text-tx">Your rating</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className={cn(
                      'relative grid size-12 cursor-pointer place-items-center rounded-xl has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lightblue',
                      rating >= n ? 'text-honey' : 'text-tx-3'
                    )}
                  >
                    <Star className={cn('size-7', rating >= n && 'fill-current')} aria-hidden="true" />
                    <input
                      type="radio"
                      name="stars"
                      value={n}
                      checked={rating === n}
                      onChange={() => {
                        setRating(n);
                        setStarError(false);
                      }}
                      className="absolute inset-0 m-0 cursor-pointer opacity-0"
                    />
                    <span className="sr-only">
                      {n} star{n > 1 ? 's' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {starError ? (
              <p className="error mt-1 text-[13px] text-danger" role="alert">
                Pick a star rating first.
              </p>
            ) : null}
          </fieldset>

          <div className="field">
            <label htmlFor="rate-text">What helped?</label>
            <textarea
              id="rate-text"
              className="textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional. What should the next student know?"
              aria-describedby="rate-text-h"
            />
            <span className="hint" id="rate-text-h">
              Shown with your first name only.
            </span>
          </div>

          {errorMsg ? (
            <div className="note is-bad" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          ) : null}
        </form>
      ) : null}
    </Dialog>
  );
};
