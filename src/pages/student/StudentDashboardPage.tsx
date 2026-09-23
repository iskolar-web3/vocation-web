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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentDashboard, useSavedInternships, useStudentBookings, useInternships } from '../../services/queries';
import { ProfileMeter } from '../../components/student/ProfileMeter';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { formatDateTime } from '../../lib/utils';
import { InternshipCard as InternshipCardType, InternshipDetail } from '../../types/api';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { data: dashboard, isLoading: isLoadingDash } = useStudentDashboard();
  const { data: savedList = [], isLoading: isLoadingSaved } = useSavedInternships();
  const { data: bookings = [], isLoading: isLoadingBookings } = useStudentBookings('upcoming');
  const { data: internshipsData } = useInternships();

  const [selectedInternship, setSelectedInternship] = useState<InternshipCardType | InternshipDetail | null>(null);

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const nextSession = upcomingBookings[0];

  const allInternships = internshipsData?.items || [];
  const savedIds = savedList.map((s) => s.id);
  const recommendedInternships = allInternships
    .filter((i) => !savedIds.includes(i.id))
    .slice(0, 3);

  const savedCount = dashboard?.saved_count ?? savedList.length;
  const upcomingCount = dashboard?.upcoming_sessions_count ?? upcomingBookings.length;
  const completenessPct = dashboard?.completeness_pct ?? 85;

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Command Station Header */}
      <div className="bg-[#021F53] rounded-3xl p-6 sm:p-8 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#3f58b2]/30 relative overflow-hidden">
        <div className="absolute inset-0 grid-subtle opacity-20 pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
            <GraduationCap className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Student Command Dashboard (S-021)</span>
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
            className="px-4 py-2 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Explore Roles</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/coaches')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
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
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saved Roles
            </span>
            <Bookmark className="w-4 h-4 text-[#ff9b00]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {savedCount}
          </div>
          <span className="text-[10px] text-slate-400 block">Shortlisted roles</span>
        </div>

        <div
          onClick={() => navigate('/app/bookings')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
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
          <span className="text-[10px] text-slate-400 block">Confirmed 1-on-1 calls</span>
        </div>

        <div
          onClick={() => navigate('/app/profile')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
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
          <span className="text-[10px] text-slate-400 block">Profile strength</span>
        </div>

        <div
          onClick={() => navigate('/internships')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Directory Roles
            </span>
            <Briefcase className="w-4 h-4 text-[#3f58b2]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {allInternships.length || '30+'}
          </div>
          <span className="text-[10px] text-slate-400 block">Verified listings</span>
        </div>
      </div>

      {/* Main Grid: Left Next Session + Roles; Right: Profile Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Next Confirmed Coaching Call Highlight */}
          {nextSession ? (
            <div className="tactile-card rounded-3xl p-6 bg-gradient-to-r from-[#021F53] to-[#3f58b2] text-white border-0 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Next Scheduled Mentorship Call
                </span>
                <span className="stamp-badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Confirmed
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={nextSession.coach_avatar_url || (nextSession as any).coachAvatar || ''}
                    alt={nextSession.coach_name || (nextSession as any).coachName || ''}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40"
                  />
                  <div>
                    <h4 className="text-lg font-bold font-headline">
                      {nextSession.session_type_name || (nextSession as any).sessionTypeName}
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5">
                      With <strong>{nextSession.coach_name || (nextSession as any).coachName}</strong> ({nextSession.coach_role || (nextSession as any).coachRole})
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#ff9b00] mt-2 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateTime(nextSession.slot_starts_at || (nextSession as any).slotStartsAt)} (Asia/Manila)</span>
                    </div>
                  </div>
                </div>

                {nextSession.join_url && (
                  <a
                    href={nextSession.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Call</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex items-center justify-between gap-4">
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
                  Your Saved Shortlist ({savedList.length})
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
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
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

        {/* Right Column: Profile Completeness Meter */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileMeter
            completenessPct={completenessPct}
            onEditProfile={() => navigate('/app/profile')}
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
