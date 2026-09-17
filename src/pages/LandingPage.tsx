import React, { useState } from 'react';
import {
  Briefcase,
  Compass,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Sparkles,
  Award,
  ExternalLink,
  Calendar,
  Building,
  GraduationCap,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Calculator,
  Coins,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { InternshipCard } from '../components/internships/InternshipCard';
import { CoachCard } from '../components/coaching/CoachCard';
import { LeavingSiteModal } from '../components/common/LeavingSiteModal';
import { BookingDialog } from '../components/coaching/BookingDialog';
import { PayMongoModal } from '../components/common/PayMongoModal';
import { OjtCalculatorWidget } from '../components/internships/OjtCalculatorWidget';
import { Internship, Coach, Booking } from '../types';
import { formatPesos } from '../lib/utils';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { internships, coaches } = useData();
  const { setRole } = useAuth();

  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [activePayMongoBooking, setActivePayMongoBooking] = useState<Booking | null>(null);
  const [activeTabField, setActiveTabField] = useState<string>('Software Engineering');

  // Quick Hero Search State
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [heroSetup, setHeroSetup] = useState('');

  const openInternships = internships.filter((i) => i.status === 'open');
  const filteredPreviewRoles = openInternships.filter((i) => i.field === activeTabField);
  const activeSpotlightRole = filteredPreviewRoles[0] || openInternships[0];
  const featuredCoaches = coaches.slice(0, 3);

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
    'Data & AI',
    'Business & Growth',
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
                    placeholder="Search roles (e.g. Frontend, Product, QA)..."
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={heroSetup}
                    onChange={(e) => setHeroSetup(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none w-full sm:w-auto cursor-pointer"
                  >
                    <option value="">All Setups</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ff9b00]" />
                  </button>
                </div>
              </form>

              {/* Trust Metadata Metrics Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#021F53] text-sm font-headline">
                    {openInternships.length}
                  </span>
                  <span>Active Openings</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#021F53] text-sm font-headline">
                    {coaches.length}
                  </span>
                  <span>Verified Coaches</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700 text-sm font-headline">
                    100% Direct
                  </span>
                  <span>Outbound Apply</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Interactive Opportunity Radar */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
                      Live Opportunity Radar
                    </span>
                  </div>
                  <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
                    Verified Roles
                  </span>
                </div>

                {/* Field Selector Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {fieldsList.map((field) => (
                    <button
                      key={field}
                      onClick={() => setActiveTabField(field)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeTabField === field
                          ? 'bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/30 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>

                {/* Active Spotlight Card */}
                {activeSpotlightRole && (
                  <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={activeSpotlightRole.company.logo}
                          alt={activeSpotlightRole.company.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-600">
                              {activeSpotlightRole.company.name}
                            </span>
                            {activeSpotlightRole.company.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#3f58b2]" />
                            )}
                          </div>
                          <h4 className="text-base font-bold text-[#021F53] font-headline">
                            {activeSpotlightRole.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {activeSpotlightRole.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-600">
                          Allowance
                        </span>
                        <div className="font-bold text-[#021F53]">
                          {activeSpotlightRole.isPaid && activeSpotlightRole.stipendAmount
                            ? `${formatPesos(activeSpotlightRole.stipendAmount)} / mo`
                            : 'Unpaid / OJT Credit'}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedInternship(activeSpotlightRole)}
                        className="px-4 py-2 rounded-xl bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Apply Direct</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#ff9b00]" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => navigate('/internships')}
                    className="text-[#3f58b2] hover:text-[#021F53] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {openInternships.length} opportunities</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OJT Hours & Allowance Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OjtCalculatorWidget
          onFindMatchingRoles={(hours) => {
            navigate(`/internships?minOjtHours=${hours}`);
          }}
        />
      </section>

      {/* Structured Dual-Pillars Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] font-accent">
            The Two-Pillar System
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#021F53] font-display">
            How iSkolar Vocation Works
          </h2>
          <p className="text-sm text-slate-600">
            Unifying internship discovery and tailored 1-on-1 industry coaching in a seamless student experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1: Verified Directory */}
          <div className="tactile-card rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200">
                  Pillar 01
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#021F53] font-headline">
                Curated Internship &amp; OJT Directory
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Filter verified openings across top Philippine tech, finance, and creative organizations. All listings include transparent work setup, monthly stipend allowance, and university OJT hours.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3f58b2] flex-shrink-0" />
                  <span>Real-time deadline countdown trackers</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3f58b2] flex-shrink-0" />
                  <span>Direct Master-Detail role dossier inspection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3f58b2] flex-shrink-0" />
                  <span>Direct outbound application routing with zero stored files (BR-001)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/internships')}
              className="w-full py-3.5 bg-[#f0f7ff] hover:bg-[#e0efff] text-[#3f58b2] font-bold text-xs rounded-xl border border-[#3f58b2]/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All {openInternships.length} Openings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pillar 2: 1-on-1 Coaching Marketplace */}
          <div className="tactile-card rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#ff9b00] flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <span className="stamp-badge bg-amber-50 text-amber-950 border border-amber-300">
                  Pillar 02
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#021F53] font-headline">
                1-on-1 Industry Coaching Marketplace
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Practice technical coding mocks, STAR behavioral interviews, and ATS resume audits with senior engineers, product designers, and talent leaders from leading Philippine tech companies.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff9b00] flex-shrink-0" />
                  <span>Free 15-minute intro sessions with verified mentors</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff9b00] flex-shrink-0" />
                  <span>Transparent PayMongo checkout (GCash, Maya, Cards)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff9b00] flex-shrink-0" />
                  <span>Transparent 5% platform fee / 95% coach payout (BR-008)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/coaches')}
              className="w-full py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Schedule 1-on-1 Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Internships Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] font-accent">
              Active Listings
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
              Latest Verified Internships &amp; OJT Openings
            </h2>
          </div>
          <button
            onClick={() => navigate('/internships')}
            className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 cursor-pointer"
          >
            <span>View all {openInternships.length} roles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {openInternships.slice(0, 4).map((item) => (
            <InternshipCard
              key={item.id}
              internship={item}
              layout="row"
              onSelect={() => navigate(`/internships/${item.slug}`)}
              onApply={(int) => setSelectedInternship(int)}
            />
          ))}
        </div>
      </section>

      {/* Top Coaches Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff9b00] font-accent">
              Mentorship Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
              Top-Rated Career Coaches
            </h2>
          </div>
          <button
            onClick={() => navigate('/coaches')}
            className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 cursor-pointer"
          >
            <span>View all {coaches.length} coaches</span>
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
      </section>

      {/* For Employers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-white via-[#f0f7ff] to-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-soft flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
              For Employers &amp; Organizations
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-headline">
              Reach college interns from leading Philippine universities
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              Post your internship and OJT roles with direct outbound application routing. Zero applicant storage fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
            <button
              onClick={() => {
                setRole('employer');
                navigate('/employer/postings/new');
              }}
              className="px-6 py-3.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Post an Internship</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ff9b00]" />
            </button>
            <button
              onClick={() => navigate('/companies')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#021F53] font-semibold text-xs rounded-xl border border-slate-200 transition-colors text-center cursor-pointer"
            >
              Company Directory
            </button>
          </div>
        </div>
      </section>

      {/* Outbound Departure Modal (BR-001) */}
      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />

      {/* 1-on-1 Booking Dialog */}
      <BookingDialog
        isOpen={!!selectedCoach}
        onClose={() => setSelectedCoach(null)}
        coach={selectedCoach}
        onOpenPayMongo={(b) => setActivePayMongoBooking(b)}
        onBookingSuccess={() => {}}
      />

      {/* PayMongo Modal */}
      <PayMongoModal
        isOpen={!!activePayMongoBooking}
        onClose={() => setActivePayMongoBooking(null)}
        booking={activePayMongoBooking}
        onSuccess={() => {
          navigate('/app/bookings');
        }}
      />
    </div>
  );
};
