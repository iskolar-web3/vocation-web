import { Star } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dialog, DialogClose } from '../ui';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Something broke' },
  { value: 'feature', label: 'Idea' },
  { value: 'internship', label: 'Internships' },
  { value: 'coaching', label: 'Coaching' },
] as const;

const RATING_LABEL = ['', 'Poor', 'Needs work', 'Okay', 'Good', 'Great'];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['value']>('general');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Write a short message so we know what to look at.');
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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:feedback_submitted', { detail: feedbackPayload }));
      }

      await new Promise((resolve) => setTimeout(resolve, 350));
      setIsSubmitted(true);
    } catch {
      setErrorMsg('We could not send that. Check your connection and try again.');
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
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) handleReset();
      }}
      title={isSubmitted ? 'Thanks, we got it' : 'Send feedback'}
      description={isSubmitted ? 'The team reads every note. Your input shapes what we fix next.' : undefined}
      size="md"
      actions={
        isSubmitted ? (
          <button type="button" className="btn btn-primary" onClick={handleReset}>
            Done
          </button>
        ) : (
          <>
            <DialogClose className="btn btn-ghost">Cancel</DialogClose>
            <button type="submit" form="feedback-form" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send feedback'}
            </button>
          </>
        )
      }
    >
      {isSubmitted ? null : (
        <form id="feedback-form" onSubmit={handleSubmit} className="stack" noValidate>
          {errorMsg ? (
            <p className="note is-bad" role="alert">
              {errorMsg}
            </p>
          ) : null}

          <div className="field">
            <span className="label" id="fb-cat">
              What is this about?
            </span>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }} role="group" aria-labelledby="fb-cat">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className="chip"
                  aria-pressed={category === c.value}
                  onClick={() => setCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label" id="fb-rate">
              How is Vocation working for you?
            </span>
            <div className="row" style={{ gap: 2 }} role="group" aria-labelledby="fb-rate">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="icon-btn"
                  style={{ border: 0 }}
                  aria-label={`${n} of 5, ${RATING_LABEL[n]}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                >
                  <Star
                    aria-hidden="true"
                    style={n <= rating ? { fill: 'var(--lightblue)', color: 'var(--lightblue)' } : undefined}
                  />
                </button>
              ))}
              <span className="t-meta" style={{ marginLeft: 8 }} aria-hidden="true">
                {RATING_LABEL[rating]}
              </span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="fb-msg">Your message</label>
            <textarea
              id="fb-msg"
              className="textarea"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What worked, what did not, what you wish it did"
              aria-invalid={errorMsg && !message.trim() ? true : undefined}
            />
          </div>

          <div className="field">
            <label htmlFor="fb-email">Email for a reply (optional)</label>
            <input
              id="fb-email"
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="send"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu.ph"
            />
          </div>
        </form>
      )}
    </Dialog>
  );
};
