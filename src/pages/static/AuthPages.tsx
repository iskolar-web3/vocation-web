import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/api';
import { api } from '../../lib/api';

interface AuthPageProps {
  mode: 'signin' | 'signup' | 'reset';
  navigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, navigate }) => {
  const { signin, signup } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'reset') {
        await api.post('/auth/password-reset/request', { email });
        setResetSent(true);
      } else if (mode === 'signin') {
        await signin({ email, password });
        navigate('/app');
      } else if (mode === 'signup') {
        await signup({
          email,
          password,
          role: selectedRole,
          full_name: fullName.trim(),
        });
        if (selectedRole === 'coach') {
          navigate('/coach');
        } else {
          navigate('/app');
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
        <div className="w-12 h-12 rounded-2xl bg-[#3f58b2] text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7 text-[#ff9b00]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#021F53]">
          {mode === 'signin' && 'Sign in to iSkolar Vocation'}
          {mode === 'signup' && 'Create Your iSkolar Account'}
          {mode === 'reset' && 'Reset Your Password'}
        </h1>
        <p className="text-xs text-[#2c3f77]">
          {mode === 'signin' && 'Access your internships, bookings, and coach sessions'}
          {mode === 'signup' && 'Join thousands of students and industry mentors'}
          {mode === 'reset' && 'We will send a secure reset link to your email'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/15 shadow-soft space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
              ✓
            </div>
            <h3 className="font-bold text-base text-[#021F53]">Reset Email Sent</h3>
            <p className="text-xs text-slate-500">
              If an account exists for {email}, you will receive a secure password reset link.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="mt-3 px-5 py-2 bg-[#3f58b2] text-white font-bold text-xs rounded-full cursor-pointer hover:bg-[#021F53] transition-colors"
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
                            ? 'bg-[#3f58b2] text-white shadow-xs'
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

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1 flex items-center justify-between">
                  <span>Password</span>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => navigate('/reset')}
                      className="text-[11px] text-[#607ef2] font-semibold hover:underline cursor-pointer"
                    >
                      Forgot?
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#3f58b2] hover:bg-[#021F53] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'signin' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Quick Demo Accounts
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setEmail('student@iskolar.ph');
                      setPassword('password123');
                      await signin({ email: 'student@iskolar.ph', password: 'password123' });
                      navigate('/app');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#021F53] font-bold text-[11px] hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 text-center"
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setEmail('coach@iskolar.ph');
                      setPassword('password123');
                      await signin({ email: 'coach@iskolar.ph', password: 'password123' });
                      navigate('/coach');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 font-bold text-[11px] hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200 text-center"
                  >
                    💼 Coach
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setEmail('admin@iskolar.ph');
                      setPassword('password123');
                      await signin({ email: 'admin@iskolar.ph', password: 'password123' });
                      navigate('/admin/listings');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold text-[11px] hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200 text-center"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>
            )}
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
