import { SiteLink } from '../../components/layout/shell';
import { AlertCircle, Check, Info, Mail } from 'lucide-react';
import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import {
  type Errors,
  PasswordField,
  PasswordRule,
  TextField,
  check,
  focusFirstInvalid,
} from '../../components/student/forms';
import { toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError, api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useFeatures } from '../../services/queries';
import { UserRole } from '../../types/api';

interface AuthPageProps {
  mode: 'signin' | 'signup' | 'reset';
  navigate: (path: string) => void;
}

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email.')
  .regex(/^\S+@\S+\.\S+$/, 'Enter a valid email, like you@school.edu.ph.');
const newPassword = z.string().min(1, 'Enter a password.').min(8, 'Use at least 8 characters.');

const signinSchema = z.object({ email, password: z.string().min(1, 'Enter your password.') });
const signupSchema = z.object({
  full_name: z.string().trim().min(1, 'Enter your full name.'),
  email,
  password: newPassword,
  terms: z.literal(true, { message: 'Agree to the Terms and Privacy Policy to continue.' }),
});
const requestSchema = z.object({ email });
const confirmSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The two passwords don’t match.' });

const ROLES: { role: UserRole; title: string; body: string }[] = [
  { role: 'student', title: 'Student', body: 'Find OJT roles and book coaches.' },
  { role: 'coach', title: 'Coach', body: 'Run paid or free sessions.' },
];

const isSafeRedirect = (url: string | null): url is string =>
  !!url && url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');

function Card({ children, icon, tone }: { children: ReactNode; icon?: ReactNode; tone?: 'ok' | 'bad' }) {
  return (
    <div className="flex min-h-[calc(100svh-var(--nav-h,72px)-var(--tabbar-total))] justify-center px-4 py-8 sm:items-center sm:py-12">
      <div className="panel panel-pad h-fit w-full max-w-[440px] sm:p-7">
        {icon ? (
          <div
            className={cn(
              'mb-5 grid size-14 place-items-center rounded-full [&_svg]:size-[26px]',
              tone === 'ok' ? 'bg-ok-wash text-ok' : tone === 'bad' ? 'bg-danger-wash text-danger' : 'bg-[rgba(96,139,255,.12)] text-link'
            )}
          >
            {icon}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="note is-bad" role="alert">
      <AlertCircle aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, navigate }) => {
  const { signin, signup, user } = useAuth();
  const features = useFeatures();
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedRole, setSelectedRole] = useState<UserRole>(() =>
    new URLSearchParams(window.location.search).get('role') === 'coach' ? 'coach' : 'student'
  );
  const [emailVal, setEmailVal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeLegal, setAgreeLegal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for reset token in URL (API-025 / Issue #16). Read it synchronously so
  // a token link never renders the first paint as a tokenless request page.
  const [resetToken, setResetToken] = useState<string | null>(() => new URLSearchParams(window.location.search).get('token'));

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      setResetToken(token);
      // Keep the token in state only; drop it from the address bar and history.
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Redirect already authenticated users to their role workspace
  useEffect(() => {
    if (user && mode !== 'reset') {
      if (user.role === 'coach') {
        navigate(user.is_onboarded ? '/coach' : '/coach/onboarding');
      } else if (user.role === 'admin') {
        navigate('/admin/listings');
      } else {
        navigate(user.is_onboarded ? '/app' : '/app/onboarding');
      }
    }
  }, [user, mode]);

  const clear = (key: string) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  const fail = (errs: Errors) => {
    setErrors(errs);
    focusFirstInvalid(formRef.current);
  };

  const requestReset = async () => {
    await api.post('/auth/password-reset/request', { email: emailVal.trim() });
    setResetSent(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    const errs =
      mode === 'signin'
        ? check(signinSchema, { email: emailVal, password })
        : mode === 'signup'
          ? check(signupSchema, { full_name: fullName, email: emailVal, password, terms: agreeLegal })
          : resetToken
            ? check(confirmSchema, { password, confirm: confirmPassword })
            : check(requestSchema, { email: emailVal });
    if (Object.keys(errs).length) return fail(errs);
    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === 'reset') {
        if (resetToken) {
          await api.post('/auth/password-reset/confirm', { token: resetToken, password });
          setResetConfirmed(true);
        } else {
          await requestReset();
        }
      } else if (mode === 'signin') {
        const session = await signin({ email: emailVal.trim(), password });
        // Role-based post-signin redirect (SEC-31: restricted to same-origin relative paths)
        const rawRedirect = new URLSearchParams(window.location.search).get('redirect');
        const safeRedirect = isSafeRedirect(rawRedirect) ? rawRedirect : null;

        if (session?.role === 'coach') {
          if (safeRedirect?.startsWith('/coach')) {
            navigate(safeRedirect);
          } else {
            navigate(session.is_onboarded ? '/coach' : '/coach/onboarding');
          }
        } else if (session?.role === 'admin') {
          navigate('/admin/listings');
        } else if (safeRedirect && !safeRedirect.startsWith('/coach') && !safeRedirect.startsWith('/admin')) {
          navigate(safeRedirect);
        } else {
          navigate(session?.is_onboarded ? '/app' : '/app/onboarding');
        }
      } else {
        await signup({ email: emailVal.trim(), password, role: selectedRole, full_name: fullName.trim() });
        navigate(selectedRole === 'coach' ? '/coach/onboarding' : '/app/onboarding');
      }
    } catch (err: any) {
      if (mode === 'reset' && resetToken && err instanceof ApiError && (err.status === 400 || err.status === 422)) {
        setTokenInvalid(true);
      } else {
        setErrorMsg(
          err.message ||
            (mode === 'signin'
              ? 'That email and password don’t match. Try again or reset your password.'
              : 'Something went wrong. Try again in a moment.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── reset: terminal states ─────────────────────────────────────────── */
  if (mode === 'reset') {
    if (resetConfirmed) {
      return (
        <Card icon={<Check aria-hidden="true" />} tone="ok">
          <h1 className="t-h2">Password updated</h1>
          <p className="t-body mt-2">You can sign in with your new password now.</p>
          <SiteLink to="/signin" className="btn btn-brand btn-block mt-6">
            Sign in
          </SiteLink>
        </Card>
      );
    }
    if (tokenInvalid) {
      return (
        <Card icon={<AlertCircle aria-hidden="true" />} tone="bad">
          <h1 className="t-h2">This reset link has expired</h1>
          <p className="t-body mt-2">Reset links work once and expire after an hour. Ask for a new one and try again.</p>
          <div className="mt-6 grid gap-2.5">
            {features.email ? (
              <button
                type="button"
                className="btn btn-brand btn-block"
                onClick={() => {
                  setTokenInvalid(false);
                  setResetToken(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                Request a new link
              </button>
            ) : null}
            <SiteLink to="/signin" className="btn btn-ghost btn-block">
              Back to sign in
            </SiteLink>
          </div>
        </Card>
      );
    }
    if (!resetToken && !features.email) {
      return (
        <Card icon={<Info aria-hidden="true" />}>
          <h1 className="t-h2">Password reset</h1>
          <p className="t-body mt-2">Password reset by email is coming soon.</p>
          <div className="mt-3">
            <ComingSoonBadge />
          </div>
          <SiteLink to="/signin" className="btn btn-secondary btn-block mt-6">
            Back to sign in
          </SiteLink>
        </Card>
      );
    }
    if (resetSent) {
      return (
        <Card icon={<Mail aria-hidden="true" />}>
          <h1 className="t-h2">Check your inbox</h1>
          <p className="t-body mt-2">
            If an account exists for <b className="font-normal text-tx">{emailVal.trim()}</b>, a reset link is on its way.
          </p>
          <div className="mt-6 grid gap-2.5">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await requestReset();
                  toast.success('Reset link sent again');
                } catch (err: any) {
                  toast.error(err.message || 'Could not send the link. Try again in a moment.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Send the link again
            </button>
            <SiteLink to="/signin" className="btn btn-ghost btn-block">
              Back to sign in
            </SiteLink>
          </div>
        </Card>
      );
    }
  }

  /* ── forms ──────────────────────────────────────────────────────────── */
  const heading =
    mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create your account' : resetToken ? 'Choose a new password' : 'Reset your password';
  const lede =
    mode === 'signin'
      ? 'Pick up your saved roles and bookings.'
      : mode === 'signup'
        ? 'Free for students. Takes a minute.'
        : resetToken
          ? 'Pick something you haven’t used on iSkolar before.'
          : 'Enter the email you signed up with. We’ll send you a link.';
  const cta =
    mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : resetToken ? 'Update password' : 'Send reset link';
  const busy =
    mode === 'signin' ? 'Signing in…' : mode === 'signup' ? 'Creating account…' : resetToken ? 'Updating…' : 'Sending…';

  return (
    <Card>
      <h1 className="t-h2">{heading}</h1>
      <p className="t-body mt-2 mb-6">{lede}</p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-[18px]" aria-busy={isSubmitting}>
        {errorMsg ? <Notice>{errorMsg}</Notice> : null}

        {mode === 'signup' && (
          <>
            <fieldset className="m-0 grid min-w-0 grid-cols-2 gap-2.5 border-0 p-0">
              <legend className="mb-2 p-0 font-data text-sm font-semibold leading-tight text-tx">I’m joining as</legend>
              {ROLES.map((r) => (
                <label
                  key={r.role}
                  className="relative grid cursor-pointer content-start gap-1 rounded-[var(--r)] border border-line-strong bg-field p-3.5 has-[:checked]:border-lightblue has-[:checked]:bg-[rgba(96,139,255,.16)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lightblue"
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.role}
                    checked={selectedRole === r.role}
                    onChange={() => setSelectedRole(r.role)}
                    className="absolute inset-0 m-0 cursor-pointer opacity-0"
                  />
                  <b className="font-display text-lg font-normal leading-tight text-tx">{r.title}</b>
                  <span className="text-[13.5px] leading-snug text-tx-3">{r.body}</span>
                </label>
              ))}
            </fieldset>

            <TextField
              id="auth-name"
              label="Full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clear('full_name');
              }}
              error={errors.full_name}
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              placeholder="e.g. Maria Santos"
            />
          </>
        )}

        {mode === 'reset' && resetToken ? (
          <>
            <PasswordField
              id="auth-password"
              label="New password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clear('password');
              }}
              error={errors.password}
              hint={<PasswordRule met={password.length >= 8} />}
              autoComplete="new-password"
              enterKeyHint="next"
            />
            <PasswordField
              id="auth-confirm"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clear('confirm');
              }}
              error={errors.confirm}
              autoComplete="new-password"
              enterKeyHint="go"
            />
          </>
        ) : (
          <TextField
            id="auth-email"
            label="Email"
            type="email"
            value={emailVal}
            onChange={(e) => {
              setEmailVal(e.target.value);
              clear('email');
            }}
            error={errors.email}
            hint={mode === 'signup' ? 'Use your school email if you have one.' : undefined}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint={mode === 'reset' ? 'go' : 'next'}
            placeholder="you@school.edu.ph"
          />
        )}

        {mode !== 'reset' && (
          <PasswordField
            id="auth-password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear('password');
            }}
            error={errors.password}
            hint={mode === 'signup' ? <PasswordRule met={password.length >= 8} /> : undefined}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            enterKeyHint="go"
          />
        )}

        {mode === 'signin' && (
          <div className="-mt-2 flex justify-end">
            {features.email ? (
              <SiteLink to="/reset" className="inline-flex min-h-11 items-center">
                Forgot password?
              </SiteLink>
            ) : (
              <span className="inline-flex min-h-11 items-center gap-2 text-tx-3">
                Forgot password?
                <ComingSoonBadge />
              </span>
            )}
          </div>
        )}

        {mode === 'signup' && (
          <div className="field">
            <label className="check">
              <input
                type="checkbox"
                checked={agreeLegal}
                onChange={(e) => {
                  setAgreeLegal(e.target.checked);
                  clear('terms');
                }}
                aria-invalid={errors.terms ? true : undefined}
                aria-describedby={errors.terms ? 'auth-terms-e' : undefined}
              />
              <span className="t-small">
                I agree to the <SiteLink to="/terms">Terms of Service</SiteLink> and <SiteLink to="/privacy">Privacy Policy</SiteLink>.
              </span>
            </label>
            {errors.terms ? (
              <span className="error" id="auth-terms-e" role="alert">
                {errors.terms}
              </span>
            ) : null}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-brand btn-block">
          {isSubmitting ? busy : cta}
        </button>
      </form>

      <p className="t-small mt-6 text-center">
        {mode === 'signin' ? (
          <>
            New here? <SiteLink to="/signup">Create an account</SiteLink>
          </>
        ) : (
          <>
            {mode === 'signup' ? 'Have an account?' : 'Remembered it?'} <SiteLink to="/signin">Sign in</SiteLink>
          </>
        )}
      </p>
    </Card>
  );
};
