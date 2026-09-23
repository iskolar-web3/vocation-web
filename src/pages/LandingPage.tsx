import React, { useState } from 'react';
import {
  Briefcase,
  ArrowRight,
  Star,
  Users,
  CheckCircle2,
  Sparkles,
  Award,
  Search,
  Building,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { useLanding, useInternships, useCoaches } from '../services/queries';
import { InternshipCard } from '../components/internships/InternshipCard';
import { CoachCard } from '../components/coaching/CoachCard';
import { LeavingSiteModal } from '../components/common/LeavingSiteModal';
import { BookingDialog } from '../components/coaching/BookingDialog';
import { InternshipCard as InternshipCardType, InternshipDetail, CoachCard as CoachCardType, CoachDetail } from '../types/api';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { data: landingData, isLoading: isLoadingLanding } = useLanding();
  const { data: internshipsData, isLoading: isLoadingInternships } = useInternships();
  const { data: coachesData, isLoading: isLoadingCoaches } = useCoaches();

  const [selectedInternship, setSelectedInternship] = useState<InternshipCardType | InternshipDetail | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<CoachCardType | CoachDetail | null>(null);
  const [activeTabField, setActiveTabField] = useState<string>('Software Engineering');

  // Quick Hero Search State
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [heroSetup, setHeroSetup] = useState('');

  const featuredInternships =
    landingData?.featured_internships || internshipsData?.items || [];
  const openInternships = featuredInternships.filter((i) => i.status === 'open');
  const filteredPreviewRoles = openInternships.filter((i) => i.field === activeTabField);
  const activeSpotlightRole = filteredPreviewRoles[0] || openInternships[0];
  const featuredCoaches =
    landingData?.top_coaches || (coachesData?.items || []).slice(0, 3);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearchQuery) params.append('q', heroSearchQuery);
    if (heroSetup) params.append('setup', heroSetup);
    navigate(`/internships?${params.toString()}`);
  };

  const fieldsList = [
    'Software Engineering',
    'UI/UX Design',
    'Data & Analytics',
    'Marketing & Growth',
  ];

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* Editorial Hero Stage */}
      <section className="relative pt-10 pb-16 md:py-20 bg-gradient-to-b from-[#f0f7ff] via-white to-[#f0f7ff] border-b border-slate-200/80 dots-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Hero Statement & Integrated Console */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#3f58b2]/20 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#ff9b00] animate-pulse" />
                <span className="text-xs font-bold text-[#021F53] uppercase tracking-wider font-accent">
                  iSkolar Vocation · Directory &amp; Coaching
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-[#021F53] leading-tight tracking-tight">
                Land high-impact <span className="text-[#3f58b2]">internships</span> with verified <span className="text-[#ff9b00]">1-on-1 coaching</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                A purpose-built ecosystem for Filipino students. Search vetted OJT roles with direct outbound apply, paired with mock interviews and portfolio audits from top industry practitioners.
              </p>

              {/* High-Utility Hero Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center gap-2 max-w-xl"
              >
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Search roles (e.g. Frontend, React, Maya)..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-[#021F53] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={heroSetup}
                    onChange={(e) => setHeroSetup(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="">All Setups</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Verified Trust Stats */}
              <div className="flex items-center gap-6 pt-2 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Outbound Apply (Zero Data Leak)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Verified Industry Mentors</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Interactive Spotlight Card */}
            <div className="lg:col-span-5">
              {activeSpotlightRole && (
                <div className="tactile-card rounded-3xl p-6 sm:p-7 space-y-5 bg-white border border-slate-200 shadow-lift">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-[#3f58b2] uppercase tracking-wider font-accent flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff9b00]" />
                      Featured Opportunity (Live Data)
                    </span>
                    <span className="stamp-badge bg-emerald-50 text-emerald-800 border border-emerald-300">
                      Open Now
                    </span>
                  </div>

                  <InternshipCard
                    internship={activeSpotlightRole}
                    onSelect={(i) => navigate(`/internships/${i.slug}`)}
                    onApply={(i) => setSelectedInternship(i)}
                  />

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => navigate('/internships')}
                      className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore all {openInternships.length} open internships</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 1: Verified Internships Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] font-accent">
              Pillar 1 · Internship Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#021F53]">
              Curated Opportunities for Student Careers
            </h2>
          </div>

          <button
            onClick={() => navigate('/internships')}
            className="px-5 py-2.5 bg-[#f0f7ff] text-[#3f58b2] hover:bg-[#e0efff] font-bold text-xs rounded-full border border-[#607ef2]/20 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {fieldsList.map((f) => (
            <button
              key={f}
              onClick={() => setActiveTabField(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTabField === f
                  ? 'bg-[#021F53] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Roles Grid */}
        {isLoadingInternships ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPreviewRoles.slice(0, 3).map((item) => (
              <InternshipCard
                key={item.id}
                internship={item}
                onSelect={(i) => navigate(`/internships/${i.slug}`)}
                onApply={(i) => setSelectedInternship(i)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pillar 2: 1-on-1 Coaching Section */}
      <section className="bg-[#021F53] text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-[#3f58b2]/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff9b00] font-accent">
                Pillar 2 · 1-on-1 Career Coaching
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-display leading-tight">
                Practice Mock Interviews with Senior Practitioners
              </h2>
            </div>

            <button
              onClick={() => navigate('/coaches')}
              className="px-6 py-3 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Coaches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCoaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                onSelect={() => navigate(`/coaches/${coach.slug}`)}
                onBook={(c) => setSelectedCoach(c)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Outbound Notice Modal */}
      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />

      {/* Mentorship Booking Modal */}
      <BookingDialog
        isOpen={!!selectedCoach}
        onClose={() => setSelectedCoach(null)}
        coach={selectedCoach}
        onBookingSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
