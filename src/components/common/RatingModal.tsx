import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Modal } from './Modal';
import { Booking } from '../../types';
import { useData } from '../../context/DataContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { submitReview } = useData();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    submitReview({
      coachSlug: booking.coachSlug,
      rating,
      comment: comment.trim() || 'Great session! Very helpful feedback and practical advice.',
      sessionTypeName: booking.sessionTypeName,
      bookingId: booking.id,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-[#021F53]">
          <Star className="w-5 h-5 text-[#ff9b00] fill-[#ff9b00]" />
          <span>Rate Your Coaching Session</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-xs text-[#2c3f77] uppercase tracking-wider font-bold">
            Completed Session with
          </p>
          <h4 className="text-lg font-bold text-[#021F53]">{booking.coachName}</h4>
          <p className="text-xs text-[#607ef2] font-medium">{booking.sessionTypeName}</p>
        </div>

        {/* 1-5 Star Selection */}
        <div className="flex flex-col items-center gap-2 py-3 bg-[#f0f7ff] rounded-2xl border border-[#3f58b2]/10">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = (hoverRating !== null ? hoverRating : rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      filled
                        ? 'text-[#ff9b00] fill-[#ff9b00]'
                        : 'text-slate-300'
                    } transition-colors`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-bold text-[#3f58b2]">
            {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Exceptional & Highly Recommended'}
            {rating === 4 && '⭐️⭐️⭐️⭐️ Very Helpful & Actionable'}
            {rating === 3 && '⭐️⭐️⭐️ Good Session'}
            {rating === 2 && '⭐️⭐️ Needs Improvement'}
            {rating === 1 && '⭐️ Disappointing'}
          </span>
        </div>

        {/* Comment Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] flex items-center justify-between">
            <span>Feedback & Review (Optional)</span>
            <span className="text-[11px] text-[#ff9b00] font-normal">
              BR-011: Displays with first name only
            </span>
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How did this session help with your interview prep or resume? Share your experience..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30 focus:border-[#3f58b2]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3f58b2]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#2c3f77] hover:bg-[#f0f7ff] rounded-full transition-colors"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Submit Review
          </button>
        </div>
      </form>
    </Modal>
  );
};
