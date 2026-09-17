import React, { useState } from 'react';
import {
  Briefcase,
  Compass,
  Bookmark,
  Calendar,
  User,
  PlusCircle,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Building,
  GraduationCap,
  Sparkles,
  Award,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Role } from '../../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { role, setRole, userName, avatar, isAuthenticated, logout } = useAuth();
  const { savedInternshipIds, bookings } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'pending' || b.paymentStatus === 'pending'
  ).length;

  const handleNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const rolesList: { role: Role; label: string; desc: string; icon: any }[] = [
    { role: 'visitor', label: 'Guest Visitor', desc: 'Outbound apply & public discovery', icon: Compass },
    { role: 'student', label: 'Student Persona', desc: 'Dashboard, completeness meter, bookings', icon: GraduationCap },
    { role: 'coach', label: 'Coach Persona', desc: 'Manage sessions, availability & earnings', icon: Award },
    { role: 'employer', label: 'Employer Persona', desc: 'Create postings & track moderation', icon: Building },
    { role: 'admin', label: 'Admin / Moderator', desc: 'Approve, reject, or withdraw listings', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#3f58b2]/10 shadow-[0_1px_3px_rgba(2,31,83,0.04)]">
      {/* Top Utility & Role Switcher Bar */}
      <div className="bg-[#021F53] text-white px-4 sm:px-8 py-1.5 text-xs flex items-center justify-between border-b border-[#3f58b2]/20">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#ff9b00] text-[#021F53] font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-accent">
            Vocation
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px] font-medium">
            Internship Directory + 1-on-1 Coaching Marketplace
          </span>
        </div>

        {/* Multi-Persona Interactive Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 bg-[#607ef2]/20 hover:bg-[#607ef2]/30 border border-[#607ef2]/30 px-3 py-1 rounded-full text-[11px] font-bold text-blue-100 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff9b00] animate-pulse" />
            <span className="capitalize font-semibold">Persona: {role}</span>
            <ChevronDown className="w-3 h-3 text-slate-300" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-[#3f58b2]/15 p-2 z-50 text-slate-800 animate-scaleUp">
              <div className="px-3 py-2 border-b border-slate-100 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#3f58b2]">
                Switch Persona to Test Workflows
              </div>
              {rolesList.map((item) => {
                const IconComponent = item.icon;
                const isSelected = role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      setRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#f0f7ff] text-[#3f58b2] font-semibold ring-1 ring-[#3f58b2]/20'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-[#3f58b2]' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
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
            <img
              src="/vocation-logo.svg"
              alt="iSkolar Vocation"
              className="w-10 h-10 rounded-2xl shadow-sm group-hover:scale-105 transition-transform"
            />
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
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentPath.startsWith('/internships')
                  ? 'bg-[#f0f7ff] text-[#3f58b2] shadow-[0_1px_2px_rgba(63,88,178,0.1)]'
                  : 'text-[#2c3f77] hover:text-[#021F53] hover:bg-slate-50'
              }`}
            >
              Internships
            </button>

            <button
              onClick={() => handleNav('/companies')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentPath === '/coaching'
                  ? 'bg-[#f0f7ff] text-[#3f58b2]'
                  : 'text-[#2c3f77] hover:text-[#021F53] hover:bg-slate-50'
              }`}
            >
              Coaching Hub
            </button>

            <button
              onClick={() => handleNav('/coaches')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              <>
                <button
                  onClick={() => handleNav('/app/saved')}
                  className="relative p-2 text-[#2c3f77] hover:text-[#3f58b2] hover:bg-[#f0f7ff] rounded-full transition-colors cursor-pointer"
                  title="Saved Internships"
                >
                  <Bookmark className="w-4 h-4" />
                  {savedInternshipIds.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff9b00] text-[#021F53] text-[9px] font-bold rounded-full flex items-center justify-center">
                      {savedInternshipIds.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav('/app/bookings')}
                  className="relative p-2 text-[#2c3f77] hover:text-[#3f58b2] hover:bg-[#f0f7ff] rounded-full transition-colors cursor-pointer"
                  title="My Bookings"
                >
                  <Calendar className="w-4 h-4" />
                  {pendingBookingsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#607ef2] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {pendingBookingsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav('/app')}
                  className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-[#f0f7ff] hover:bg-[#e0efff] border border-[#607ef2]/20 transition-all text-xs font-bold text-[#021F53] cursor-pointer"
                >
                  <img
                    src={avatar}
                    alt={userName}
                    className="w-7 h-7 rounded-full object-cover border border-[#3f58b2]"
                  />
                  <span>Student Dashboard</span>
                </button>
              </>
            )}

            {role === 'coach' && (
              <button
                onClick={() => handleNav('/coach')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f7ff] hover:bg-[#e0efff] border border-[#607ef2]/20 text-xs font-bold text-[#021F53] cursor-pointer"
              >
                <img src={avatar} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                <span>Coach Portal</span>
              </button>
            )}

            {role === 'employer' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/employer/postings/new')}
                  className="px-4 py-2 rounded-full bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Internship</span>
                </button>
                <button
                  onClick={() => handleNav('/employer/postings')}
                  className="px-3.5 py-2 rounded-full bg-[#f0f7ff] text-[#3f58b2] font-semibold text-xs border border-[#3f58b2]/15 cursor-pointer"
                >
                  Employer Hub
                </button>
              </div>
            )}

            {role === 'admin' && (
              <button
                onClick={() => handleNav('/admin/listings')}
                className="px-4 py-2 rounded-full bg-[#021F53] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#ff9b00]" />
                <span>Moderation Queue</span>
              </button>
            )}

            {role === 'visitor' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/signin')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#3f58b2] hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] shadow-sm transition-all cursor-pointer"
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
              <span>Internship Directory</span>
            </button>
            <button
              onClick={() => handleNav('/companies')}
              className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm text-[#021F53] hover:bg-[#f0f7ff] flex items-center gap-2.5 cursor-pointer"
            >
              <Building className="w-4 h-4 text-[#607ef2]" />
              <span>Companies Directory</span>
            </button>
            <button
              onClick={() => handleNav('/coaching')}
              className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm text-[#021F53] hover:bg-[#f0f7ff] flex items-center gap-2.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#3f58b2]" />
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

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {role === 'student' && (
              <>
                <button
                  onClick={() => handleNav('/app')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f0f7ff] text-[#3f58b2] font-bold text-sm text-left flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Student Dashboard</span>
                </button>
                <button
                  onClick={() => handleNav('/app/saved')}
                  className="w-full px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-semibold text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4" /> Saved Roles
                  </span>
                  <span className="text-xs bg-[#ff9b00] text-[#021F53] px-2 py-0.5 rounded-full font-bold">
                    {savedInternshipIds.length}
                  </span>
                </button>
                <button
                  onClick={() => handleNav('/app/bookings')}
                  className="w-full px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-semibold text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> My Bookings
                  </span>
                </button>
              </>
            )}

            {role === 'employer' && (
              <>
                <button
                  onClick={() => handleNav('/employer/postings/new')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#ff9b00] text-[#021F53] font-bold text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post an Internship</span>
                </button>
                <button
                  onClick={() => handleNav('/employer/postings')}
                  className="w-full px-4 py-2 rounded-xl bg-[#f0f7ff] text-[#3f58b2] font-semibold text-sm text-left cursor-pointer"
                >
                  Employer Listings Hub
                </button>
              </>
            )}

            {role === 'admin' && (
              <button
                onClick={() => handleNav('/admin/listings')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#021F53] text-white font-bold text-sm text-left flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#ff9b00]" />
                <span>Admin Moderation Queue</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
