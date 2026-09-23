import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  LayoutList,
  LayoutGrid,
  Columns2,
  Calculator,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useInternships, useCoach } from '../../services/queries';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { InternshipFilters, FilterState } from '../../components/internships/InternshipFilters';
import { InternshipDossier } from '../../components/internships/InternshipDossier';
import { OjtCalculatorWidget } from '../../components/internships/OjtCalculatorWidget';
import { Drawer } from '../../components/common/Drawer';
import { Modal } from '../../components/common/Modal';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { InternshipCard as InternshipCardType, InternshipDetail, CoachCard as CoachCardType, CoachDetail } from '../../types/api';

interface InternshipDirectoryPageProps {
  navigate: (path: string) => void;
  initialQuery?: string;
  initialField?: string;
  initialSetup?: string;
}

export const InternshipDirectoryPage: React.FC<InternshipDirectoryPageProps> = ({
  navigate,
  initialQuery = '',
  initialField = '',
  initialSetup = 'all',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    q: initialQuery,
    field: initialField,
    setup: initialSetup,
    pay: 'all',
    minOjtHours: 'all',
    sort: 'newest',
  });

  const [viewMode, setViewMode] = useState<'split' | 'row' | 'grid'>('split');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<InternshipCardType | InternshipDetail | null>(null);
  const [activeDossierRole, setActiveDossierRole] = useState<InternshipCardType | InternshipDetail | null>(null);
  const [bookingCoach, setBookingCoach] = useState<CoachCardType | CoachDetail | null>(null);

  const { data, isLoading, error } = useInternships({
    q: filters.q || undefined,
    field: filters.field || undefined,
    setup: filters.setup !== 'all' ? filters.setup : undefined,
    pay: filters.pay !== 'all' ? filters.pay : undefined,
    sort: filters.sort !== 'newest' ? filters.sort : undefined,
  });

  const internships = data?.items || [];
  const currentDossierRole = activeDossierRole || internships[0] || null;

  const handleReset = () => {
    setFilters({
      q: '',
      field: '',
      setup: 'all',
      pay: 'all',
      minOjtHours: 'all',
      sort: 'newest',
    });
  };

  const quickFieldPills = [
    { label: 'All Roles', value: '' },
    { label: 'Software Engineering', value: 'Software Engineering' },
    { label: 'Product & Design', value: 'Product & Design' },
    { label: 'Data & Analytics', value: 'Data & Analytics' },
    { label: 'Marketing & Growth', value: 'Marketing & Growth' },
    { label: 'Finance & Ops', value: 'Finance & Operations' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#021F53] rounded-3xl p-6 sm:p-10 text-white shadow-soft relative overflow-hidden border border-[#3f58b2]/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
            <Briefcase className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Internship &amp; OJT Directory (S-004)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
            Curated Internships for Filipino University Students
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Discover verified tech, finance, product, and design roles with clear stipend details, OJT credit hours, and direct official application links.
          </p>

          <div className="relative pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search by role title, technology (React, Python), company (Maya, GCash), or location..."
              className="w-full pl-11 pr-4 py-3 bg-white text-[#021F53] font-medium text-xs sm:text-sm rounded-xl shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff9b00]"
            />
          </div>
        </div>
      </div>

      {/* Quick Field Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {quickFieldPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => setFilters((prev) => ({ ...prev, field: pill.value }))}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filters.field === pill.value
                ? 'bg-[#021F53] text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6">
          <InternshipFilters
            filters={filters}
            setFilters={setFilters}
            totalResults={internships.length}
            onReset={handleReset}
          />

          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="w-full p-4 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 hover:border-[#3f58b2]/40 transition-all text-left space-y-1 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#021F53] flex items-center gap-1.5 font-headline">
                <Calculator className="w-4 h-4 text-[#3f58b2]" />
                <span>OJT Hours Calculator</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#ff9b00] text-[#021F53] font-accent">
                Widget
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Calculate daily shifts &amp; required weeks to complete 300, 486, or 600 practicum hours.
            </p>
          </button>
        </aside>

        {/* Results Stream / Master-Detail Area */}
        <main className="md:col-span-8 lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#021F53]">
                {isLoading ? 'Searching...' : `${internships.length} Verified Roles Open`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-white text-[#021F53] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="2-Column Dossier Split View"
                >
                  <Columns2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('row')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'row'
                      ? 'bg-white text-[#021F53] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Full Width Stream View"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#021F53] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden px-3 py-1.5 bg-[#f0f7ff] text-[#3f58b2] font-bold text-xs rounded-xl border border-[#607ef2]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-2xs flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
              <p className="text-xs font-semibold text-slate-500">Loading internships...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 rounded-3xl p-8 text-center border border-rose-200 space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-rose-900">Failed to load directory</h3>
              <p className="text-xs text-rose-700">{(error as any).message || 'Unable to connect to server.'}</p>
            </div>
          ) : internships.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-[#021F53] font-headline">
                No internships found matching your criteria
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Try loosening your filters, changing the work setup, or searching for broader keywords.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Master Stream */}
              <div className="lg:col-span-6 space-y-3">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    layout="split"
                    isSelected={currentDossierRole?.id === internship.id}
                    onSelect={(i) => setActiveDossierRole(i)}
                    onApply={(i) => setSelectedInternship(i)}
                  />
                ))}
              </div>

              {/* Right Detail Dossier */}
              <div className="hidden lg:block lg:col-span-6">
                {currentDossierRole && (
                  <InternshipDossier
                    internship={currentDossierRole}
                    onApply={(i) => setSelectedInternship(i)}
                    onBookCoach={(c) => setBookingCoach(c)}
                  />
                )}
              </div>
            </div>
          ) : viewMode === 'row' ? (
            <div className="space-y-3">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  layout="row"
                  onSelect={(i) => navigate(`/internships/${i.slug}`)}
                  onApply={(i) => setSelectedInternship(i)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  layout="grid"
                  onSelect={(i) => navigate(`/internships/${i.slug}`)}
                  onApply={(i) => setSelectedInternship(i)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Filter Internships"
      >
        <InternshipFilters
          filters={filters}
          setFilters={setFilters}
          totalResults={internships.length}
          onReset={handleReset}
          isMobileDrawer
        />
      </Drawer>

      {/* OJT Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="OJT Hours & Allowance Calculator"
        maxWidth="2xl"
      >
        <OjtCalculatorWidget
          onFindMatchingRoles={(hours) => {
            setFilters((prev) => ({ ...prev, minOjtHours: hours.toString() }));
            setIsCalculatorOpen(false);
          }}
        />
      </Modal>

      {/* Outbound Notice Modal */}
      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />

      {/* Mentorship Cross-Sell Booking Dialog */}
      <BookingDialog
        isOpen={!!bookingCoach}
        onClose={() => setBookingCoach(null)}
        coach={bookingCoach}
        onBookingSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
