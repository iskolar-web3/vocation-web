import React, { useState } from 'react';
import {
  Briefcase,
  ArrowRight,
  Star,
  Users,
  CheckCircle2,
  Compass,
  Award,
  Search,
  Building,
  GraduationCap,
  Loader2,
  MapPin,
  Check,
} from 'lucide-react';
import { useLanding, useInternships, useCoaches } from '../services/queries';
import { InternshipCard } from '../components/internships/InternshipCard';
import { CoachCard } from '../components/coaching/CoachCard';
import { LeavingSiteModal } from '../components/common/LeavingSiteModal';
import { BookingDialog } from '../components/coaching/BookingDialog';
import { InternshipCard as InternshipCardType, InternshipDetail, CoachCard as CoachCardType, CoachDetail } from '../types/api';

interface LandingPageProps {
  navigate?: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate: propNavigate }) => {
  const navigate = propNavigate ?? ((path: string) => { if (typeof window !== 'undefined') { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); } });
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
  const openInternships = featuredInternships.filter((i: any) => !i.status || i.status === 'open');
  const filteredPreviewRoles = openInternships.filter((i) => i.field === activeTabField);
  const activeSpotlightRole = filteredPreviewRoles[0] || openInternships[0];
  const featuredCoaches: CoachCardType[] =
    landingData?.featured_coaches || (coachesData?.items || []).slice(0, 3);

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
      {/* Radiant Blue & White Mesh Hero Stage (Centered, Zero Whitespace Gaps) */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 stripe-mesh-hero border-b border-[#3f58b2]/15">
        <div className="stripe-grid-lines" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Centered Hero Header & Standout CTA Console */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            {/* Standout Commanding Header */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-[#021F53] leading-[1.12] tracking-tight font-bold">
              Land high-impact <span className="text-[#1d4ed8]">internships</span> with verified <span className="text-[#2563eb]">1-on-1 coaching</span>.
            </h1>

            {/* Exact 50-character subheader */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-medium font-sans">
              Curated OJT internships and 1-on-1 career coaching.
            </p>

            {/* Centered Elevated Architectural Search & Explore Console */}
            <div className="pt-2 max-w-2xl mx-auto">
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="relative flex-1 w-full pl-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Search roles (e.g. Frontend, Data, React, Maya)..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-medium text-[#021F53] placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto pr-1">
                  <select
                    value={heroSetup}
                    onChange={(e) => setHeroSetup(e.target.value)}
                    className="px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="">All Setups</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>

                  <button
                    type="submit"
                    className="tactile-btn-primary px-6 py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-md"
                  >
                    <span>Explore Roles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Quick Trending Intent Tags */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-3 text-xs">
                <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider font-accent">
                  Trending:
                </span>
                {fieldsList.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setHeroSearchQuery(f);
                      navigate(`/internships?field=${encodeURIComponent(f)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-slate-600 hover:text-[#021F53] border border-slate-200/80 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dual-Card Platform Showcase: Grounded, Balanced & Interactive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-stretch">
            {/* Left Card (6 cols): Featured Internship Spotlight */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-soft flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-accent">
                      Featured Verified Opportunity
                    </span>
                  </div>
                  <span className="bg-[#f0f7ff] text-[#1d4ed8] border border-[#3f58b2]/20 rounded-md text-[10px] py-0.5 px-2 font-bold">
                    Active Intake
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#021F53] text-white font-bold flex items-center justify-center text-lg flex-shrink-0 shadow-2xs">
                    M
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Maya Philippines
                      </span>
                      <span className="text-[10px] text-[#2563eb] font-bold bg-[#f0f7ff] px-2 py-0.2 rounded border border-[#607ef2]/20">
                        Verified Partner
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#021F53] font-headline leading-tight mt-0.5">
                      Frontend Engineering Intern
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Taguig, Metro Manila · Hybrid (3 days onsite)</span>
                    </p>
                  </div>
                </div>

                {/* Benefits & Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f8fbff] p-2.5 rounded-xl border border-[#dbeafe]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allowance</span>
                    <span className="font-bold text-[#021F53]">₱15,000 / month</span>
                  </div>
                  <div className="bg-[#f8fbff] p-2.5 rounded-xl border border-[#dbeafe]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Practicum</span>
                    <span className="font-bold text-[#021F53]">300h Certified Credit</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Direct Outbound Application</span>
                <button
                  type="button"
                  onClick={() => navigate('/internships/frontend-engineering-intern')}
                  className="tactile-btn-primary px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>View Role Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Card (6 cols): Verified Mentorship & Practicum Acceleration */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-soft flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#1d4ed8]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-accent">
                      Verified Career Mentorship
                    </span>
                  </div>
                  <span className="bg-[#f0f7ff] text-[#021F53] border border-[#3f58b2]/20 font-bold rounded-md px-2 py-0.5 text-[10px] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#1d4ed8] text-[#1d4ed8]" />
                    4.9 Top Rated
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                    alt="Engr. Mark Villanueva"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#021F53] font-headline leading-tight">
                      Engr. Mark Villanueva
                    </h3>
                    <p className="text-xs font-semibold text-[#1d4ed8]">
                      Senior Tech Lead &amp; Hiring Manager
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Specializes in Mock Technical Interviews &amp; Resume Audits
                    </p>
                  </div>
                </div>

                {/* Trajectory Stat */}
                <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-accent">
                      Student Placement Rate
                    </span>
                    <span className="text-sm font-bold text-[#021F53]">98.4% Matched in &lt;14 Days</span>
                  </div>
                  <span className="text-xs font-bold text-[#1d4ed8] bg-[#f0f7ff] px-2.5 py-1 rounded-lg border border-[#3f58b2]/20">
                    Free 15-min Intro
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">1-on-1 Google Meet Prep</span>
                <button
                  type="button"
                  onClick={() => navigate('/coaches')}
                  className="tactile-btn-primary px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Users className="w-3.5 h-3.5 text-white" />
                  <span>Book Practice Session</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Social Proof & Trust Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200/80 text-center">
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-black text-[#021F53] block font-display">500+</span>
              <span className="text-[11px] text-slate-500 font-medium">Verified OJT Roles</span>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-black text-[#1d4ed8] block font-display">₱15,000</span>
              <span className="text-[11px] text-slate-500 font-medium">Avg. Monthly Allowance</span>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-black text-[#021F53] block font-display">14 Days</span>
              <span className="text-[11px] text-slate-500 font-medium">Avg. Placement Speed</span>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-lg sm:text-xl font-black text-[#2563eb] block font-display">100%</span>
              <span className="text-[11px] text-slate-500 font-medium">Credited Practicum</span>
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
            className="tactile-btn-primary px-5 py-2.5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tactile Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
          {fieldsList.map((f) => (
            <button
              key={f}
              onClick={() => setActiveTabField(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTabField === f
                  ? 'tactile-btn-midnight shadow-stripe-subtle'
                  : 'bg-white text-slate-700 hover:text-[#021F53] hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Roles Grid */}
        {isLoadingInternships ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-soft">
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

      {/* Pillar 2: 1-on-1 Coaching Section (Blue & White Contrast) */}
      <section className="bg-gradient-to-b from-[#021F53] via-[#05225c] to-[#021F53] text-white py-20 px-4 sm:px-6 lg:px-8 border-y border-[#3f58b2]/30 relative overflow-hidden">
        <div className="stripe-grid-lines opacity-10" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-radial from-[#2563eb]/20 to-transparent pointer-events-none rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 bg-radial from-[#607ef2]/20 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#607ef2] font-accent">
                Pillar 2 · 1-on-1 Career Coaching
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-display leading-tight">
                Practice Mock Interviews with Senior Practitioners
              </h2>
            </div>

            <button
              onClick={() => navigate('/coaches')}
              className="tactile-btn-white px-6 py-3 text-xs rounded-xl flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-lift"
            >
              <span>Explore All Coaches</span>
              <ArrowRight className="w-4 h-4 text-[#021F53]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCoaches.map((coach) => (
              <CoachCard
                key={coach.slug || (coach as any).id}
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
