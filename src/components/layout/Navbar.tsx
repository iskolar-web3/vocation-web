import React, { useState } from 'react';
import {
  Briefcase,
  Bookmark,
  Calendar,
  User,
  ShieldAlert,
  Menu,
  X,
  GraduationCap,
  Award,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedInternships, useStudentBookings } from '../../services/queries';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, role, userName, avatar, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // TanStack queries for badges (only enabled if student)
  const isStudent = isAuthenticated && role === 'student';
  const { data: savedList } = useSavedInternships({ enabled: isStudent });
  const { data: studentBookings } = useStudentBookings('upcoming', { enabled: isStudent });

  const savedCount = savedList?.length || 0;
  const pendingCount = (studentBookings || []).filter(
    (b) => b.status === 'pending' || b.payment_status === 'pending'
  ).length;

  const handleNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#3f58b2]/15 shadow-stripe-subtle">
      {/* Top Banner */}
      <div className="bg-[#021F53] text-white px-4 sm:px-8 py-1.5 text-xs flex items-center justify-between border-b border-[#3f58b2]/20">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#ff9b00] text-[#021F53] font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-accent shadow-2xs">
            Vocation
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px] font-medium">
            Verified Internships &amp; 1-on-1 Career Mentorship for Filipino Students
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          {isAuthenticated ? (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Signed in as <strong className="text-white capitalize">{user?.role}</strong>
            </span>
          ) : (
            <span className="hidden sm:inline text-slate-300">Public Directory</span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with SVG */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer"
          >
            <div className="p-1 rounded-2xl bg-white shadow-2xs border border-slate-200/80 group-hover:scale-105 transition-transform">
              <img
                src="/vocation-logo.svg"
                alt="iSkolar Vocation"
                className="w-8 h-8 rounded-xl object-contain"
              />
            </div>
            <div className="text-left">
              <span className="font-display text-xl text-[#021F53] tracking-tight block leading-tight">
                iSkolar <span className="text-[#3f58b2]">Vocation</span>
              </span>
              <span className="text-[10px] font-bold text-[#ff9b00] tracking-wider uppercase block -mt-0.5 font-accent">
                Internships &amp; Coaching
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <button
              onClick={() => handleNav('/internships')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPath.startsWith('/internships')
                  ? 'bg-[#f0f7ff] text-[#3f58b2] shadow-2xs border border-[#3f58b2]/15'
                  : 'text-[#2c3f77] hover:text-[#021F53] hover:bg-slate-50'
              }`}
            >
              Internships
            </button>

            <button
              onClick={() => handleNav('/companies')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPath.startsWith('/companies')
                  ? 'bg-[#f0f7ff] text-[#3f58b2]'
                  : 'text-[#2c3f77] hover:text-[#021F53] hover:bg-slate-50'
              }`}
            >
              Companies
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

            <button
              onClick={() => handleNav('/coaching')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPath === '/coaching'
                  ? 'bg-[#f0f7ff] text-[#3f58b2]'
                  : 'text-[#2c3f77] hover:text-[#021F53] hover:bg-slate-50'
              }`}
            >
              Coaching Hub
            </button>

            <button
              onClick={() => handleNav('/coaches')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPath.startsWith('/coaches')
                  ? 'bg-[#f0f7ff] text-[#3f58b2]'
                  : 'text-[#2c3f77] hover:text-[#021F53] hover:bg-slate-50'
              }`}
            >
              Find a Coach
            </button>
          </nav>

          {/* Right Action / Account Area */}
          <div className="hidden md:flex items-center gap-3">
            {role === 'student' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/app/saved')}
                  className="relative p-2 text-[#2c3f77] hover:text-[#3f58b2] hover:bg-[#f0f7ff] rounded-full transition-colors cursor-pointer"
                  title="Saved Internships"
                >
                  <Bookmark className="w-4 h-4" />
                  {savedCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff9b00] text-[#021F53] text-[9px] font-bold rounded-full flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav('/app/bookings')}
                  className="relative p-2 text-[#2c3f77] hover:text-[#3f58b2] hover:bg-[#f0f7ff] rounded-full transition-colors cursor-pointer"
                  title="My Bookings"
                >
                  <Calendar className="w-4 h-4" />
                  {pendingCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#607ef2] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#f0f7ff] hover:bg-[#e0efff] border border-[#607ef2]/20 transition-all text-xs font-bold text-[#021F53] cursor-pointer"
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={userName}
                        className="w-7 h-7 rounded-full object-cover border border-[#3f58b2]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#3f58b2] text-white flex items-center justify-center font-bold text-xs">
                        {userName ? userName.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate">{userName}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scaleUp">
                      <button
                        onClick={() => handleNav('/app')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f7ff] hover:text-[#3f58b2] flex items-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Student Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNav('/app/bookings')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f7ff] hover:text-[#3f58b2] flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>My Bookings</span>
                      </button>
                      <button
                        onClick={() => handleNav('/app/saved')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f7ff] hover:text-[#3f58b2] flex items-center gap-2"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Saved Roles</span>
                      </button>
                      <button
                        onClick={() => handleNav('/app/profile')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f7ff] hover:text-[#3f58b2] flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile &amp; Settings</span>
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {role === 'coach' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/coach')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f0f7ff] hover:bg-[#e0efff] border border-[#607ef2]/20 text-xs font-bold text-[#021F53] cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#3f58b2]" />
                  <span>Coach Portal</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/admin/listings')}
                  className="px-4 py-2 rounded-xl bg-[#021F53] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-[#ff9b00]" />
                  <span>Moderation Queue</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/signin')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#3f58b2] hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="tactile-btn-honey px-4 py-2 text-xs rounded-xl flex items-center cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#021F53] hover:bg-slate-100 rounded-xl cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-slideDown">
          <div className="space-y-1">
            <button
              onClick={() => handleNav('/internships')}
              className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm text-[#021F53] hover:bg-[#f0f7ff] flex items-center gap-2.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-[#3f58b2]" />
              <span>Internships Directory</span>
            </button>
            <button
              onClick={() => handleNav('/companies')}
              className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm text-[#021F53] hover:bg-[#f0f7ff] flex items-center gap-2.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#3f58b2]" />
              <span>Partner Companies</span>
            </button>
            <button
              onClick={() => handleNav('/coaching')}
              className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm text-[#021F53] hover:bg-[#f0f7ff] flex items-center gap-2.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#3f58b2]" />
              <span>Coaching Hub</span>
            </button>
            <button
              onClick={() => handleNav('/coaches')}
              className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm text-[#021F53] hover:bg-[#f0f7ff] flex items-center gap-2.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#ff9b00]" />
              <span>Find a Coach</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs text-slate-500 font-medium">
                  Signed in as <strong className="text-slate-800">{userName}</strong> ({role})
                </div>
                {role === 'student' && (
                  <>
                    <button
                      onClick={() => handleNav('/app')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#021F53] hover:bg-[#f0f7ff]"
                    >
                      Student Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('/app/bookings')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#021F53] hover:bg-[#f0f7ff]"
                    >
                      My Bookings
                    </button>
                    <button
                      onClick={() => handleNav('/app/saved')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#021F53] hover:bg-[#f0f7ff]"
                    >
                      Saved Roles ({savedCount})
                    </button>
                  </>
                )}
                {role === 'coach' && (
                  <button
                    onClick={() => handleNav('/coach')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#021F53] hover:bg-[#f0f7ff]"
                  >
                    Coach Portal
                  </button>
                )}
                {role === 'admin' && (
                  <button
                    onClick={() => handleNav('/admin/listings')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#021F53] hover:bg-[#f0f7ff]"
                  >
                    Admin Moderation Queue
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNav('/signin')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-[#3f58b2] bg-[#f0f7ff] text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#3f58b2] text-center"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
