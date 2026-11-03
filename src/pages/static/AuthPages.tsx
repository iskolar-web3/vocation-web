import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/api';
import { api } from '../../lib/api';

interface AuthPageProps {
  mode: 'signin' | 'signup' | 'reset';
  navigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, navigate }) => {
  const { signin, signup, user } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeLegal, setAgreeLegal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for reset token in URL (API-025 / Issue #16)
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'reset') {
        if (resetToken) {
          // Confirming password reset with token
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match.');
          }
          if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long.');
          }
          await api.post('/auth/password-reset/confirm', {
            token: resetToken,
            password: password,
          });
          setResetConfirmed(true);
        } else {
          // Requesting password reset email
          await api.post('/auth/password-reset/request', { email });
          setResetSent(true);
        }
      } else if (mode === 'signin') {
        const session = await signin({ email, password });
        // Role-based post-signin redirect (SEC-31: restricted to same-origin relative paths)
        const rawRedirect = new URLSearchParams(window.location.search).get('redirect');
        const isSafeRedirect = (url: string | null): url is string => {
          if (!url) return false;
          return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
        };
        const safeRedirect = isSafeRedirect(rawRedirect) ? rawRedirect : null;

        if (session?.role === 'coach') {
          if (safeRedirect?.startsWith('/coach')) {
            navigate(safeRedirect);
          } else {
            navigate(session.is_onboarded ? '/coach' : '/coach/onboarding');
          }
        } else if (session?.role === 'admin') {
          navigate('/admin/listings');
        } else {
          if (
            safeRedirect &&
            !safeRedirect.startsWith('/coach') &&
            !safeRedirect.startsWith('/admin')
          ) {
            navigate(safeRedirect);
          } else {
            navigate(session?.is_onboarded ? '/app' : '/app/onboarding');
          }
        }
      } else if (mode === 'signup') {
        if (!agreeLegal) {
          throw new Error('Please agree to the Terms of Service and Privacy Policy to proceed.');
        }
        await signup({
          email,
          password,
          role: selectedRole,
          full_name: fullName.trim(),
        });

        if (selectedRole === 'coach') {
          navigate('/coach/onboarding');
        } else {
          navigate('/app/onboarding');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#021F53] text-white flex items-center justify-center mx-auto shadow-sm">
          <GraduationCap className="w-6 h-6 text-[#607ef2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#021F53]">
          {mode === 'signin' && 'Sign in to iSkolar Vocation'}
          {mode === 'signup' && 'Create Your iSkolar Account'}
          {mode === 'reset' && (resetToken ? 'Set New Password' : 'Reset Your Password')}
        </h1>
        <p className="text-xs text-[#2c3f77]">
          {mode === 'signin' && 'Access your internships, bookings, and coaching sessions'}
          {mode === 'signup' && 'Join thousands of students and industry mentors'}
          {mode === 'reset' && (resetToken ? 'Choose a strong password for your account' : 'We will send a secure password reset link to your email')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resetConfirmed ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f0f7ff] text-[#2563eb] border border-[#607ef2]/30 flex items-center justify-center mx-auto font-bold shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#021F53]">Password Updated</h3>
            <p className="text-xs text-slate-500">
              Your password has been successfully reset. You can now sign in with your new credentials.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="tactile-btn-primary mt-3 px-6 py-2.5 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
            >
              Sign In Now
            </button>
          </div>
        ) : resetSent ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f0f7ff] text-[#2563eb] border border-[#607ef2]/30 flex items-center justify-center mx-auto font-bold shadow-inner">
              ✓
            </div>
            <h3 className="font-bold text-base text-[#021F53]">Reset Email Sent</h3>
            <p className="text-xs text-slate-500">
              If an account exists for {email}, you will receive a secure password reset link shortly.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="mt-3 px-6 py-2.5 bg-[#021F53] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#002774] transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                    I want to register as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'student', label: 'Student / Intern' },
                      { role: 'coach', label: 'Industry Coach' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSelectedRole(item.role as UserRole)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedRole === item.role
                            ? 'bg-[#021F53] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                    required
                  />
                </div>
              </>
            )}

            {mode === 'reset' && resetToken ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                    required
                    minLength={8}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu.ph"
                  className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                  required
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1 flex items-center justify-between">
                  <span>Password</span>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => navigate('/reset-password')}
                      className="text-[11px] text-[#3f58b2] font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div className="pt-2">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeLegal}
                    onChange={(e) => setAgreeLegal(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#021F53] rounded border-slate-300 focus:ring-[#021F53]"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/terms')}
                      className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/privacy')}
                      className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]"
                    >
                      Privacy Policy
                    </button>.
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="tactile-btn-primary w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && (resetToken ? 'Update Password' : 'Send Reset Link')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-bold text-[#3f58b2] hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="font-bold text-[#3f58b2] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
