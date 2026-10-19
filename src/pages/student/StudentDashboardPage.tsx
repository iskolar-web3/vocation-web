import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  Award,
  Video,
  ExternalLink,
  Briefcase,
  ArrowRight,
  GraduationCap,
  Clock,
  Loader2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useStudentDashboard,
  useStudentProfile,
  useSavedInternships,
  useStudentBookings,
  useInternships,
  useResumeCheckout,
} from '../../services/queries';
import { ProfileMeter } from '../../components/student/ProfileMeter';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { formatDateTime } from '../../lib/utils';
import { InternshipCard as InternshipCardType, InternshipDetail } from '../../types/api';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { user, role } = useAuth();
  const isStudent = role === 'student';
  const { data: dashboard, isLoading: isLoadingDash } = useStudentDashboard({ enabled: isStudent });
  const { data: studentProfile } = useStudentProfile({ enabled: isStudent });
  const { data: savedList = [], isLoading: isLoadingSaved } = useSavedInternships({ enabled: isStudent });
  const { data: bookings = [], isLoading: isLoadingBookings } = useStudentBookings('upcoming', { enabled: isStudent });
  const { data: internshipsData } = useInternships();
  const resumeCheckoutMutation = useResumeCheckout();

  const [selectedInternship, setSelectedInternship] = useState<InternshipCardType | InternshipDetail | null>(null);

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const nextSession = confirmedBookings[0];
  const pendingSession = pendingBookings[0];

  const allInternships = internshipsData?.items || [];
  const savedIds = savedList.map((s) => s.id);
  const recommendedInternships = allInternships
    .filter((i) => !savedIds.includes(i.id))
    .slice(0, 3);

  // Authoritative real-time metric counts reflecting actual state (0 when empty)
  const savedCount = savedList.length;
  const upcomingCount = confirmedBookings.length;
  const directoryRolesCount = internshipsData?.meta?.total ?? allInternships.length;
  const completenessPct = dashboard?.completeness_pct ?? (user?.is_onboarded ? 85 : 40);

  // OJT Practicum calculations
  const targetOjtHours = studentProfile?.target_ojt_hours ?? 300;
  const completedOjtHours = studentProfile?.completed_ojt_hours ?? 180;
  const ojtProgressPct = targetOjtHours > 0 ? Math.min(100, Math.round((completedOjtHours / targetOjtHours) * 100)) : 0;
  const remainingOjtHours = Math.max(0, targetOjtHours - completedOjtHours);

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  const handleResumePayment = async (bookingId: string) => {
    try {
      const res = await resumeCheckoutMutation.mutateAsync(bookingId);
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        navigate('/app/bookings');
      }
    } catch {
      navigate('/app/bookings');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Command Station Header (Radiant Gradient & Tactile Bevels) */}
      <div className="bg-gradient-to-r from-[#021F53] via-[#082d70] to-[#021F53] rounded-2xl p-6 sm:p-8 text-white shadow-stripe-float flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#3f58b2]/40 relative overflow-hidden">
        <div className="stripe-grid-lines opacity-10" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-radial from-[#607ef2]/20 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#ff9b00] uppercase tracking-wider font-accent border border-white/10 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Student Command Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.email} · iSkolar Practicum &amp; Career Account
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => navigate('/internships')}
            className="tactile-btn-honey px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Explore Roles</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/coaches')}
            className="tactile-btn-sapphire px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Book a Coach</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/app/saved')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1 hover:border-[#ff9b00]/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saved Roles
            </span>
            <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
              <Bookmark className="w-4 h-4 text-[#ff9b00]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {savedCount}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {savedCount === 1 ? '1 role shortlisted' : `${savedCount} roles shortlisted`}
          </span>
        </div>

        <div
          onClick={() => navigate('/app/bookings')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1 hover:border-[#3f58b2]/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Upcoming Sessions
            </span>
            <Calendar className="w-4 h-4 text-[#3f58b2]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {upcomingCount}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {pendingBookings.length > 0
              ? `${pendingBookings.length} awaiting checkout`
              : upcomingCount === 1
              ? '1 confirmed 1-on-1 call'
              : `${upcomingCount} confirmed calls`}
          </span>
        </div>

        <div
          onClick={() => navigate('/app/profile')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1 hover:border-emerald-500/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Profile Completeness
            </span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {completenessPct}%
          </div>
          <span className="text-[10px] text-slate-400 block">
            {completenessPct >= 80 ? 'Profile ready & active' : 'Complete to boost reach'}
          </span>
        </div>

        <div
          onClick={() => navigate('/internships')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1 hover:border-[#3f58b2]/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Directory Roles
            </span>
            <Briefcase className="w-4 h-4 text-[#3f58b2]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {directoryRolesCount}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {directoryRolesCount === 1 ? '1 active opening' : `${directoryRolesCount} active openings`}
          </span>
        </div>
      </div>

      {/* Pending Payment Notice Banner */}
      {pendingSession && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#021F53] text-sm">
                Action Required: Pending Mentorship Booking
              </p>
              <p className="text-amber-800 text-xs mt-0.5">
                Session with <strong>{pendingSession.coach_display_name}</strong> scheduled for{' '}
                <strong className="text-[#021F53]">{formatDateTime(pendingSession.slot_starts_at)}</strong> (Asia/Manila) is waiting for checkout completion.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => handleResumePayment(pendingSession.booking_id)}
              disabled={resumeCheckoutMutation.isPending}
              className="px-4 py-2 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              {resumeCheckoutMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CreditCard className="w-3.5 h-3.5" />
              )}
              <span>Complete Payment</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/bookings')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs"
            >
              View All Bookings
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Next Session + Roles; Right: Profile Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Next Scheduled Coaching Call Highlight (Updated from white to rich brand card) */}
          {nextSession ? (
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#021F53] via-[#092B6E] to-[#122b68] text-white border border-[#3f58b2]/40 shadow-soft space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#3f58b2]/20 to-transparent pointer-events-none rounded-full blur-2xl" />
              <div className="flex items-center justify-between border-b border-white/15 pb-3 relative z-10">
                <span className="text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#ff9b00]" /> Next Scheduled Mentorship Call
                </span>
                <span className="stamp-badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Confirmed
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-white font-bold border border-white/20 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                    {nextSession.coach_display_name ? nextSession.coach_display_name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-headline">
                      1-on-1 Career Mentorship
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5">
                      With <strong className="text-[#ff9b00]">{nextSession.coach_display_name}</strong>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-sky-200 mt-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#ff9b00]" />
                      <span>{formatDateTime(nextSession.slot_starts_at)} (Asia/Manila)</span>
                    </div>
                  </div>
                </div>

                {nextSession.join_url && (
                  <a
                    href={nextSession.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Video Call</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : pendingSession ? (
            <div className="tactile-card rounded-2xl p-6 bg-white border border-amber-200 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider font-accent flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Mentorship Session
                </span>
                <span className="stamp-badge bg-amber-100 text-amber-800 border border-amber-300">
                  Payment Pending
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-[#021F53] font-headline">
                    Session with {pendingSession.coach_display_name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Scheduled for {formatDateTime(pendingSession.slot_starts_at)} (Asia/Manila)
                  </p>
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    Complete checkout to reserve your calendar slot with the coach.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleResumePayment(pendingSession.booking_id)}
                  disabled={resumeCheckoutMutation.isPending}
                  className="px-5 py-2.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Resume Checkout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#021F53] font-headline">No upcoming coaching sessions</h4>
                <p className="text-xs text-slate-500">Book a 1-on-1 session for resume audit or mock coding interview.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/coaches')}
                className="px-4 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Browse Coaches
              </button>
            </div>
          )}

          {/* Saved Shortlist Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#ff9b00]" />
                <h3 className="text-lg font-bold text-[#021F53] font-headline">
                  Your Saved Shortlist ({savedCount})
                </h3>
              </div>
              <button
                onClick={() => navigate('/app/saved')}
                className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Shortlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {savedList.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <p className="text-xs text-slate-500">No saved roles yet. Browse the directory to bookmark roles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedList.slice(0, 2).map((item) => (
                  <InternshipCard
                    key={item.id}
                    internship={item}
                    layout="row"
                    onSelect={(i) => navigate(`/internships/${i.slug}`)}
                    onApply={(i) => setSelectedInternship(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recommended Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#021F53] font-headline">
                Recommended Opportunities
              </h3>
              <button
                onClick={() => navigate('/internships')}
                className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedInternships.map((item) => (
                <InternshipCard
                  key={item.id}
                  internship={item}
                  layout="grid"
                  onSelect={(i) => navigate(`/internships/${i.slug}`)}
                  onApply={(i) => setSelectedInternship(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OJT Practicum Tracker & Profile Completeness Meter */}
        <div className="lg:col-span-4 space-y-6">
          {/* OJT Practicum Hours Tracker Card */}
          <div className="tactile-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f0f7ff] border border-[#607ef2]/20 text-[#3f58b2] flex items-center justify-center font-bold shadow-2xs">
                  <Clock className="w-4 h-4 text-[#3f58b2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#021F53] text-sm sm:text-base font-headline">
                    OJT Practicum Tracker
                  </h3>
                  <p className="text-xs text-slate-500">Graduation &amp; academic requirements</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-[#f0f7ff] text-[#3f58b2] font-bold px-2.5 py-1 rounded-full border border-[#607ef2]/20">
                  {ojtProgressPct}%
                </span>
              </div>
            </div>

            {/* Skeuomorphic Tactile OJT Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#021F53]">
                <span>Progress to Completion</span>
                <span className="font-bold text-[#3f58b2]">{completedOjtHours} / {targetOjtHours} hrs</span>
              </div>
              <div className="w-full h-3.5 tactile-track p-0.5">
                <div
                  className="h-full tactile-gauge-fill transition-all duration-700"
                  style={{ width: `${ojtProgressPct}%` }}
                />
              </div>
            </div>

            {/* Metric Boxes */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-[#f0f7ff]/60 p-3 rounded-xl border border-[#607ef2]/15 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Completed So Far
                </span>
                <span className="text-lg font-bold text-[#021F53] font-display">
                  {completedOjtHours} <span className="text-xs font-normal text-slate-500">hrs</span>
                </span>
              </div>
              <div className="bg-[#f0f7ff]/60 p-3 rounded-xl border border-[#607ef2]/15 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Remaining Hours
                </span>
                <span className="text-lg font-bold text-[#021F53] font-display">
                  {remainingOjtHours} <span className="text-xs font-normal text-slate-500">hrs</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {remainingOjtHours > 0
                ? `${remainingOjtHours} hours remaining to satisfy your academic practicum requirement.`
                : 'Curriculum practicum target completed! All required hours satisfied.'}
            </p>

            <button
              type="button"
              onClick={() => navigate('/app/profile')}
              className="tactile-btn-sapphire w-full py-2.5 px-4 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Update Practicum Hours in Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ProfileMeter
            completenessPct={completenessPct}
            onEditProfile={() => navigate('/app/profile')}
            targetOjtHours={targetOjtHours}
            completedOjtHours={completedOjtHours}
          />
        </div>
      </div>

      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />
    </div>
  );
};
