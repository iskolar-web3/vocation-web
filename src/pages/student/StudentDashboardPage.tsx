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
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileMeter } from '../../components/student/ProfileMeter';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { formatDateTime } from '../../lib/utils';
import { Internship } from '../../types';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { studentProfile, savedInternshipIds, internships, bookings } = useData();
  const { userName } = useAuth();

  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  const savedInternships = internships.filter((i) => savedInternshipIds.includes(i.id));
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const nextSession = upcomingBookings[0];

  const remainingOjtHours = Math.max(0, studentProfile.targetOjtHours - studentProfile.completedOjtHours);
  const ojtPercent = Math.round((studentProfile.completedOjtHours / studentProfile.targetOjtHours) * 100);

  const recommendedInternships = internships
    .filter((i) => i.status === 'open' && !savedInternshipIds.includes(i.id))
    .slice(0, 3);

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
            Welcome back, {studentProfile.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {studentProfile.course} · {studentProfile.school} ({studentProfile.yearLevel})
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => navigate('/internships')}
            className="px-4 py-2 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Explore Roles</span>
          </button>
          <button
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
            {savedInternships.length}
          </div>
          <div className="text-[11px] text-slate-400">Target Applications</div>
        </div>

        <div
          onClick={() => navigate('/app/bookings')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Upcoming Mocks
            </span>
            <Calendar className="w-4 h-4 text-[#3f58b2]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {upcomingBookings.length}
          </div>
          <div className="text-[11px] text-slate-400">Confirmed 1-on-1s</div>
        </div>

        <div
          onClick={() => navigate('/app/bookings')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {bookings.filter((b) => b.status === 'completed').length}
          </div>
          <div className="text-[11px] text-slate-400">Prep Sessions Done</div>
        </div>

        <div
          onClick={() => navigate('/app/profile')}
          className="tactile-card rounded-2xl p-4 sm:p-5 cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              OJT Progress
            </span>
            <Clock className="w-4 h-4 text-[#607ef2]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-display">
            {studentProfile.completedOjtHours}
            <span className="text-sm font-normal text-slate-400">/{studentProfile.targetOjtHours}h</span>
          </div>
          <div className="text-[11px] text-slate-400">{ojtPercent}% University Target</div>
        </div>
      </div>

      {/* Main Grid: Session Ticket & Saved Stream vs Profile Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Next Session Boarding Pass & Saved Internships */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Session Pass (Ticket Stub Design) */}
          {nextSession ? (
            <div className="tactile-card rounded-3xl overflow-hidden">
              <div className="bg-[#021F53] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#3f58b2]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider font-accent text-white">
                    Next Coaching Session Pass
                  </span>
                </div>
                <span className="stamp-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] py-0">
                  Confirmed Slot
                </span>
              </div>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={nextSession.coachAvatar}
                    alt={nextSession.coachName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                      {nextSession.sessionTypeName}
                    </h3>
                    <p className="text-xs text-slate-600">
                      With coach <strong>{nextSession.coachName}</strong> · {nextSession.sessionDuration} mins
                    </p>
                    <p className="text-xs font-semibold text-[#3f58b2] flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#ff9b00]" />
                      <span>{formatDateTime(nextSession.slotStartsAt)}</span>
                    </p>
                  </div>
                </div>

                {nextSession.joinUrl && (
                  <a
                    href={nextSession.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Google Meet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="tactile-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#021F53] font-headline">No upcoming sessions scheduled</h3>
                <p className="text-xs text-slate-600">
                  Connect with a senior engineer or recruiter for mock interviews &amp; resume audits.
                </p>
              </div>
              <button
                onClick={() => navigate('/coaches')}
                className="px-4 py-2 bg-[#021F53] text-white text-xs font-bold rounded-xl hover:bg-[#3f58b2] transition-colors flex-shrink-0 cursor-pointer"
              >
                Find a Coach
              </button>
            </div>
          )}

          {/* Saved Internships Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#ff9b00]" />
                <h3 className="text-lg font-bold text-[#021F53] font-headline">
                  Saved Internships ({savedInternships.length})
                </h3>
              </div>
              <button
                onClick={() => navigate('/app/saved')}
                className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 cursor-pointer"
              >
                <span>View all saved</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {savedInternships.length === 0 ? (
              <div className="tactile-card rounded-2xl p-8 text-center space-y-2">
                <p className="text-xs text-slate-500">You haven't bookmarked any internships yet.</p>
                <button
                  onClick={() => navigate('/internships')}
                  className="px-4 py-2 bg-[#f0f7ff] text-[#3f58b2] text-xs font-bold rounded-xl hover:bg-[#e0efff] cursor-pointer"
                >
                  Browse Open Directory
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedInternships.slice(0, 3).map((item) => (
                  <InternshipCard
                    key={item.id}
                    internship={item}
                    layout="row"
                    onSelect={() => navigate(`/internships/${item.slug}`)}
                    onApply={(int) => setSelectedInternship(int)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Profile Completeness Meter & Recommended Stream */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileMeter
            profile={studentProfile}
            onEditProfile={() => navigate('/app/profile')}
          />

          {/* Recommended Roles Stream */}
          <div className="tactile-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
                Recommended For You
              </span>
              <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20 text-[10px] py-0">
                Match
              </span>
            </div>

            <div className="space-y-2.5">
              {recommendedInternships.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/internships/${rec.slug}`)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-[#f0f7ff] border border-slate-200/80 transition-colors cursor-pointer space-y-1"
                >
                  <div className="text-xs font-bold text-[#021F53] line-clamp-1">{rec.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{rec.company.name}</span>
                    <span className="font-semibold text-[#3f58b2]">{rec.field}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/internships')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#021F53] text-xs font-bold rounded-xl border border-slate-200 transition-colors text-center cursor-pointer block"
            >
              Explore Full Catalog
            </button>
          </div>
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
