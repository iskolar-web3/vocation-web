import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<'general' | 'bug' | 'feature' | 'coaching' | 'internship'>('general');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'internship', label: 'Internships' },
    { value: 'coaching', label: 'Coaching' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // DP-13: Feedback form does not store personal email in browser localStorage
      const feedbackPayload = {
        category,
        rating,
        message: message.trim(),
        submitted_at: new Date().toISOString(),
      };

      const existingFeedback = JSON.parse(localStorage.getItem('vocation_user_feedback') || '[]');
      existingFeedback.push(feedbackPayload);
      localStorage.setItem('vocation_user_feedback', JSON.stringify(existingFeedback));

      // Dispatch custom event for tracking
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:feedback_submitted', { detail: feedbackPayload }));
      }

      // Brief delay for tactile feel
      await new Promise((resolve) => setTimeout(resolve, 350));
      setIsSubmitted(true);
    } catch {
      setErrorMsg('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setIsSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#3f58b2]" />
          <span>Send In-App Feedback</span>
        </div>
      }
      maxWidth="lg"
    >
      {isSubmitted ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f7ff] text-[#2563eb] border border-[#607ef2]/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#021F53] font-headline">Thank You for Your Feedback!</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your input directly helps us build a better internship directory and coaching experience for Filipino students.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="tactile-btn-primary px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value as any)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                    category === c.value
                      ? 'border-[#3f58b2] bg-[#f0f7ff] text-[#021F53] ring-1 ring-[#3f58b2]/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              How was your experience?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1.5 text-slate-300 hover:text-[#2563eb] transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-[#2563eb] text-[#2563eb]'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#021F53] ml-2">
                {rating === 5 && 'Outstanding'}
                {rating === 4 && 'Good'}
                {rating === 3 && 'Average'}
                {rating === 2 && 'Needs Improvement'}
                {rating === 1 && 'Poor'}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Your Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell us what you liked, report a problem, or suggest new features..."
              className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs sm:text-sm font-medium text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2] placeholder:text-slate-400"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Your Email (Optional, for follow-up)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@iskolar.edu.ph"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2] placeholder:text-slate-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tactile-btn-primary px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
