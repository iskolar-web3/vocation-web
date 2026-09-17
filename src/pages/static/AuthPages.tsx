import React, { useState } from 'react';
import { GraduationCap, ArrowRight, ShieldCheck, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface AuthPageProps {
  mode: 'signin' | 'signup' | 'reset';
  navigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, navigate }) => {
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      setResetSent(true);
      return;
    }
    login(selectedRole);
    if (selectedRole === 'student') navigate('/app');
    else if (selectedRole === 'coach') navigate('/coach');
    else if (selectedRole === 'employer') navigate('/employer/postings');
    else navigate('/');
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
        {resetSent ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="font-bold text-base text-[#021F53]">Reset Email Sent</h3>
            <p className="text-xs text-slate-500">
              Check your inbox for instructions to reset your password.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="mt-3 px-5 py-2 bg-[#3f58b2] text-white font-bold text-xs rounded-full"
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
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'student', label: 'Student' },
                      { role: 'coach', label: 'Coach' },
                      { role: 'employer', label: 'Employer' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSelectedRole(item.role as Role)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
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
                    placeholder="Clarisse Salazar"
                    className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53]"
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
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53]"
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
                      className="text-[11px] text-[#607ef2] font-semibold hover:underline"
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
                  className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-sm font-semibold text-[#021F53]"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Email'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-bold text-[#3f58b2] hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="font-bold text-[#3f58b2] hover:underline"
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
