import { SiteLink } from '../../components/layout/shell';
import { AlertCircle, Check, Clock, Mail } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiError, api } from '../../lib/api';
import { cn } from '../../lib/utils';

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
export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = () => {
  const { refetchUser } = useAuth();
  const [state, setState] = useState<VerifyState>('verifying');
  const sent = useRef(false);

  useEffect(() => {
    // StrictMode runs effects twice in dev; the token is single-use, so post it once.
    if (sent.current) return;
    sent.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    // Drop the single-use token from the address bar and history once read.
    if (token) window.history.replaceState(null, '', window.location.pathname);
    if (!token) {
      setState('invalid');
      return;
    }
    api
      .post('/auth/verify-email', { token })
      .then(() => {
        setState('verified');
        // email_verified changed for a signed-in user. Refetch unconditionally:
        // on a fresh load `user` may not be known yet, and a visitor's /me just
        // 401s to null.
        void refetchUser();
      })
      .catch((err) => {
        setState(err instanceof ApiError && (err.status === 422 || err.status === 400) ? 'invalid' : 'error');
      });
  }, [refetchUser]);

  const Icon = { verifying: Mail, verified: Check, invalid: Clock, error: AlertCircle }[state];
  const tone = state === 'verified' ? 'ok' : state === 'verifying' ? 'info' : 'bad';

  return (
    <div className="flex min-h-[calc(100svh-var(--nav-h,72px)-var(--tabbar-total))] justify-center px-4 py-8 sm:items-center sm:py-12">
      <div className="panel panel-pad h-fit w-full max-w-[440px] sm:p-7" aria-live="polite">
        <div
          className={cn(
            'mb-5 grid size-14 place-items-center rounded-full [&_svg]:size-[26px]',
            tone === 'ok' && 'bg-ok-wash text-ok',
            tone === 'bad' && 'bg-danger-wash text-danger',
            tone === 'info' && 'bg-[rgba(96,139,255,.12)] text-link'
          )}
        >
          <Icon aria-hidden="true" />
        </div>
        <h1 className="t-h2">
          {state === 'verifying' && 'Verifying your email…'}
          {state === 'verified' && 'Email verified'}
          {state === 'invalid' && 'This link has expired'}
          {state === 'error' && 'We couldn’t verify your email'}
        </h1>
        <p className="t-body mt-2">
          {state === 'verifying' && 'This takes a few seconds.'}
          {state === 'verified' && 'You’re all set. Carry on to your account.'}
          {state === 'invalid' &&
            'Verification links work once and expire after 24 hours. Sign in and ask for a new one from your account.'}
          {state === 'error' && 'Something went wrong on our side. Try the link again in a minute.'}
        </p>
        {state === 'verifying' ? (
          <div className="bar-shimmer mt-6" aria-hidden="true" />
        ) : (
          <SiteLink to="/signin" className={cn('btn btn-block mt-6', state === 'error' ? 'btn-secondary' : 'btn-brand')}>
            {state === 'verified' ? 'Continue to sign in' : state === 'invalid' ? 'Sign in' : 'Back to sign in'}
          </SiteLink>
        )}
      </div>
    </div>
  );
};
