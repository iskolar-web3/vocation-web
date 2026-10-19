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
      {/* Stripe-Inspired Radiant Mesh Hero Stage */}
      <section className="relative pt-12 pb-20 md:py-24 stripe-mesh-hero border-b border-[#3f58b2]/15">
        <div className="stripe-grid-lines" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Col: Hero Statement & Tactile Capsule Search Console */}
            <div className="lg:col-span-6 space-y-7 text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3f58b2]/20 shadow-stripe-subtle">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff9b00] animate-pulse" />
                <span className="text-xs font-bold text-[#021F53] uppercase tracking-wider font-accent">
                  iSkolar Vocation · Sessions 2026
                </span>
                <span className="text-[#3f58b2] text-xs font-semibold hidden sm:inline">
                  Directory &amp; 1-on-1 Mentorship &rarr;
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-[#021F53] leading-[1.08] tracking-tight">
                Land high-impact <span className="text-[#3f58b2] underline decoration-[#ff9b00]/60 decoration-wavy decoration-2">internships</span> with verified <span className="text-[#ff9b00]">1-on-1 coaching</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed font-sans">
                A purpose-built ecosystem for Filipino students. Discover curated OJT roles with direct outbound apply, paired with mock technical interviews and portfolio audits from senior industry practitioners.
              </p>

              {/* Neumorphic Tactile Search Capsule Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-2xl sm:rounded-full border border-slate-200/90 shadow-stripe-float flex flex-col sm:flex-row items-center gap-2 max-w-xl"
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
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="">All Setups</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>

                  <button
                    type="submit"
                    className="tactile-btn-honey px-5 py-2.5 text-xs rounded-xl sm:rounded-full flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>Explore Roles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Verified Trust Badges */}
              <div className="flex items-center gap-6 pt-1 text-xs text-slate-600 flex-wrap">
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/60 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700">Direct Outbound Apply (Zero Data Leak)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/60 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700">100% Verified Practitioners</span>
                </div>
              </div>
            </div>

            {/* Right Col: Stripe-Style Layered 3D Tactile Mockup & Companion Dashboard */}
            <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end pt-6 pb-6 pr-2 sm:pr-6">
              {/* Overlapping Companion Card (Behind & To the Right - z-0) */}
              <div className="hidden sm:block absolute -top-6 right-0 sm:right-2 z-0 w-64 bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-slate-200/90 shadow-stripe-float animate-floatSlow">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-accent">
                    Practicum Trajectory
                  </span>
                  <span className="stamp-badge bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] py-0 px-1.5">
                    +34.2% Faster
                  </span>
                </div>
                <div className="mt-2.5 space-y-0.5">
                  <div className="text-xl font-black text-[#021F53] font-display">
                    98.4% Placement
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    300h Certified Practicum Match Rate
                  </p>
                </div>
                {/* Micro Sparkline Curve SVG */}
                <div className="mt-3 h-12 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 180 40">
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#607ef2" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#607ef2" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,35 Q 30,30 60,22 T 120,15 T 180,4 L 180,40 L 0,40 Z"
                      fill="url(#sparklineGrad)"
                    />
                    <path
                      d="M 0,35 Q 30,30 60,22 T 120,15 T 180,4"
                      fill="none"
                      stroke="#3f58b2"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="180" cy="4" r="3.5" fill="#ff9b00" />
                  </svg>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Avg. Hiring Lead Time</span>
                  <span className="font-bold text-[#021F53]">14 Days</span>
                </div>
              </div>

              {/* Main Tactile Foreground Mockup Card (Skeuomorphic Device Frame - z-10) */}
              <div className="w-full max-w-sm sm:max-w-[380px] bg-white rounded-3xl p-6 sm:p-7 border border-white/95 shadow-stripe-float relative z-10 space-y-4">
                {/* Device Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 flex items-center justify-center text-[#3f58b2] shadow-2xs">
                      <GraduationCap className="w-4 h-4 text-[#3f58b2]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#021F53] block font-headline">
                        Verified Mentorship Session
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Pass #VK-2026 · Instant Calendar Invite
                      </span>
                    </div>
                  </div>
                  <span className="stamp-badge bg-amber-50 text-amber-900 border border-amber-300">
                    <Star className="w-3 h-3 fill-[#ff9b00] text-[#ff9b00]" />
                    4.9 ★ Top Rated
                  </span>
                </div>

                {/* Tactile Coach Snapshot Box */}
                <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                      alt="Engr. Mark Villanueva"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#021F53] font-headline">
                        Engr. Mark Villanueva
                      </h4>
                      <p className="text-xs font-semibold text-[#3f58b2] truncate">
                        Senior Tech Lead &amp; Hiring Manager
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        1-on-1 Mock Interview &amp; Resume Audit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500 font-medium">Session Rate</span>
                    <span className="font-bold text-[#021F53] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Free 15-min Intro
                    </span>
                  </div>
                </div>

                {/* Inset Tactile Form Elements */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Student University &amp; Program
                    </label>
                    <div className="tactile-inset rounded-xl px-3.5 py-2 text-xs font-medium text-[#021F53] flex items-center justify-between">
                      <span>University of the Philippines · BS CS</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Target Practicum Track
                    </label>
                    <div className="tactile-inset rounded-xl px-3.5 py-2 text-xs font-medium text-[#021F53] flex items-center justify-between">
                      <span>Full-Stack &amp; Systems Engineering</span>
                      <Compass className="w-3.5 h-3.5 text-[#3f58b2]" />
                    </div>
                  </div>
                </div>

                {/* Tactile Glossy Action Pill Button */}
                <button
                  type="button"
                  onClick={() => navigate('/coaches')}
                  className="tactile-btn-midnight w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#ff9b00]" />
                  <span>Schedule 1-on-1 Practice Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Outbound direct booking · PayMongo verified checkout</span>
                </p>
              </div>
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
            className="px-5 py-2.5 bg-white text-[#3f58b2] hover:text-[#021F53] font-bold text-xs rounded-xl border border-[#3f58b2]/20 shadow-2xs hover:shadow-soft flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
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

      {/* Pillar 2: 1-on-1 Coaching Section (With Deep Brand Radiance) */}
      <section className="bg-gradient-to-b from-[#021F53] via-[#062c73] to-[#021F53] text-white py-20 px-4 sm:px-6 lg:px-8 border-y border-[#3f58b2]/30 relative overflow-hidden">
        <div className="stripe-grid-lines opacity-10" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-radial from-[#ff9b00]/15 to-transparent pointer-events-none rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 bg-radial from-[#607ef2]/20 to-transparent pointer-events-none rounded-full blur-3xl" />

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
              className="tactile-btn-honey px-6 py-3 text-xs rounded-xl flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Coaches</span>
              <ArrowRight className="w-4 h-4" />
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
