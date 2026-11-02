import React, { useEffect, useRef, useState } from 'react';
import { MailCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

interface VerifyEmailPageProps {
  navigate: (path: string) => void;
}

type VerifyState = 'verifying' | 'verified' | 'invalid' | 'error';

/**
 * S-018: the landing page for the signup verification email (API-027).
 * The server emails `{WEB_BASE_URL}/verify-email?token=…`; this page posts the
 * token once. An unknown, expired or used token is 422 → invalid state.
 * Sign-in is never blocked by an unverified email, so every state links on.
 */
export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ navigate }) => {
  const [state, setState] = useState<VerifyState>('verifying');
  const sent = useRef(false);

  useEffect(() => {
    // StrictMode runs effects twice in dev; the token is single-use, so post it once.
    if (sent.current) return;
    sent.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setState('invalid');
      return;
    }
    api
      .post('/auth/verify-email', { token })
      .then(() => setState('verified'))
      .catch((err) => {
        setState(err instanceof ApiError && (err.status === 422 || err.status === 400) ? 'invalid' : 'error');
      });
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center mx-auto">
        {state === 'verifying' && <Loader2 className="w-8 h-8 animate-spin" />}
        {state === 'verified' && <MailCheck className="w-8 h-8 text-emerald-600" />}
        {(state === 'invalid' || state === 'error') && <AlertCircle className="w-8 h-8 text-rose-500" />}
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
        {state === 'verifying' && 'Verifying your email…'}
        {state === 'verified' && 'Email verified'}
        {state === 'invalid' && 'This link is invalid or has expired'}
        {state === 'error' && 'We could not verify your email'}
      </h1>
      <p className="text-xs sm:text-sm text-[#2c3f77] leading-relaxed">
        {state === 'verifying' && 'One moment while we confirm your address.'}
        {state === 'verified' && 'Thanks for confirming your address. You can continue to your account.'}
        {state === 'invalid' &&
          'Verification links are single-use and expire after 24 hours. Sign in and request a new one from your account.'}
        {state === 'error' && 'Something went wrong on our side. Please try the link again in a few minutes.'}
      </p>
      {state !== 'verifying' && (
        <button
          type="button"
          onClick={() => navigate('/signin')}
          className="px-6 py-3 bg-[#3f58b2] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#021F53] transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to sign in</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
