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
  X,
  RotateCcw,
} from 'lucide-react';
import { useInternships } from '../../services/queries';
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
  onFiltersChange?: (newFilters: FilterState) => void;
}

export const InternshipDirectoryPage: React.FC<InternshipDirectoryPageProps> = ({
  navigate,
  initialQuery = '',
  initialField = '',
  initialSetup = 'all',
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    q: initialQuery,
    field: initialField,
    setup: initialSetup,
    pay: 'all',
    minOjtHours: 'all',
    sort: 'newest',
  });

  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      q: initialQuery !== undefined ? initialQuery : prev.q,
      field: initialField !== undefined ? initialField : prev.field,
      setup: initialSetup !== undefined ? initialSetup : prev.setup,
    }));
  }, [initialQuery, initialField, initialSetup]);

  const updateFilters = (updater: React.SetStateAction<FilterState>) => {
    setFilters((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (onFiltersChange) {
        onFiltersChange(next);
      }
      return next;
    });
  };

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

  let internships = data?.items || [];

  // Filter by min OJT hours if applied
  if (filters.minOjtHours && filters.minOjtHours !== 'all') {
    const minH = Number(filters.minOjtHours);
    internships = internships.filter((i) => {
      const estimatedHours = i.ojt_hours || (i.duration_weeks ? i.duration_weeks * 20 : 0);
      return estimatedHours >= minH;
    });
  }

  const currentDossierRole = activeDossierRole || internships[0] || null;

  const handleReset = () => {
    updateFilters({
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
    { label: 'UI/UX Design', value: 'UI/UX Design' },
    { label: 'Data Science & AI', value: 'Data Science & AI' },
    { label: 'Cybersecurity', value: 'Cybersecurity' },
    { label: 'Business & Ops', value: 'Business & Operations' },
  ];

  const hasActiveFilters = Boolean(
    filters.q ||
    filters.field ||
    filters.setup !== 'all' ||
    filters.pay !== 'all' ||
    filters.minOjtHours !== 'all'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#021F53] rounded-2xl p-6 sm:p-10 text-white shadow-soft relative overflow-hidden border border-[#3f58b2]/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md text-xs font-bold text-[#607ef2] uppercase tracking-wider font-accent border border-white/15">
              <Briefcase className="w-3.5 h-3.5 text-[#607ef2]" />
              <span>Verified OJT &amp; Internship Directory</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#2563eb]/25 hover:bg-[#2563eb]/35 border border-[#607ef2]/40 px-3 py-1 rounded-md text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>OJT Hours &amp; Allowance Calculator</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight tracking-tight">
            Find High-Impact Internships in the Philippines
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Curated practicum and OJT opportunities with verified monthly allowances, flexible setups, and direct outbound application links.
          </p>

          <div className="relative pt-2 max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => updateFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search by role title, tech stack (React, Python, Go), company, or city..."
              className="w-full pl-11 pr-10 py-3.5 bg-white text-[#021F53] font-medium text-xs sm:text-sm rounded-2xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => updateFilters((prev) => ({ ...prev, q: '' }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Field Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {quickFieldPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => updateFilters((prev) => ({ ...prev, field: pill.value }))}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filters.field === pill.value
                ? 'bg-[#021F53] text-white shadow-2xs font-bold ring-2 ring-[#021F53]/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters (Frozen Sidebar) */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          <InternshipFilters
            filters={filters}
            setFilters={updateFilters}
            totalResults={internships.length}
            onReset={handleReset}
          />

          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="w-full p-4 rounded-2xl bg-[#002774] text-white border border-[#3f58b2]/30 hover:border-[#607ef2]/50 transition-all text-left space-y-2 group cursor-pointer shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 font-headline text-white">
                <Calculator className="w-4 h-4 text-[#607ef2]" />
                <span>OJT Hours Calculator</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2563eb] text-white font-accent">
                Widget
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Estimate required weeks and projected earnings for 200h, 300h, or 500h practicum requirements.
            </p>
          </button>
        </aside>

        {/* Results Stream / Master-Detail Area */}
        <main className="md:col-span-8 lg:col-span-9 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#021F53]">
                {isLoading ? 'Searching opportunities...' : `${internships.length} Opportunities Available`}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {/* View Switcher (Desktop) */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
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
              </div>

              {/* Mobile Filter Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden px-3.5 py-1.5 bg-[#f0f7ff] text-[#3f58b2] font-bold text-xs rounded-xl border border-[#607ef2]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {hasActiveFilters ? '•' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className="sm:hidden px-3 py-1.5 bg-[#f0f7ff] text-[#021F53] border border-[#607ef2]/20 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Calculator</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Active Filters:</span>
              {filters.q && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f7ff] text-[#021F53] font-semibold border border-[#607ef2]/20">
                  <span>"{filters.q}"</span>
                  <button type="button" onClick={() => setFilters((p) => ({ ...p, q: '' }))} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.field && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f7ff] text-[#021F53] font-semibold border border-[#607ef2]/20">
                  <span>Field: {filters.field}</span>
                  <button type="button" onClick={() => setFilters((p) => ({ ...p, field: '' }))} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.setup !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f7ff] text-[#021F53] font-semibold border border-[#607ef2]/20 capitalize">
                  <span>Setup: {filters.setup}</span>
                  <button type="button" onClick={() => setFilters((p) => ({ ...p, setup: 'all' }))} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.pay !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f7ff] text-[#021F53] font-semibold border border-[#607ef2]/20 capitalize">
                  <span>Pay: {filters.pay}</span>
                  <button type="button" onClick={() => setFilters((p) => ({ ...p, pay: 'all' }))} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.minOjtHours !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f7ff] text-[#021F53] font-semibold border border-[#607ef2]/20">
                  <span>Min OJT: {filters.minOjtHours}h</span>
                  <button type="button" onClick={() => setFilters((p) => ({ ...p, minOjtHours: 'all' }))} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            </div>
          )}

          {/* Results State */}
          {isLoading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-2xs flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
              <p className="text-xs font-semibold text-slate-500">Loading internships from API...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 rounded-2xl p-8 text-center border border-rose-200 space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-rose-900">Failed to load directory</h3>
              <p className="text-xs text-rose-700">{(error as any).message || 'Unable to connect to server.'}</p>
            </div>
          ) : internships.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-[#021F53] font-headline">
                No internships found matching your criteria
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Try loosening your filters, changing the work setup, or searching for broader keywords.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Master Stream (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    layout="split"
                    isSelected={currentDossierRole?.id === internship.id}
                    onSelect={(i) => {
                      setActiveDossierRole(i);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        navigate(`/internships/${i.slug}`);
                      }
                    }}
                    onApply={(i) => setSelectedInternship(i)}
                  />
                ))}
              </div>

              {/* Right Detail Dossier (7 cols) */}
              <div className="hidden lg:block lg:col-span-7 sticky top-20">
                {currentDossierRole && (
                  <InternshipDossier
                    internship={currentDossierRole}
                    onApplyOutbound={(i) => setSelectedInternship(i)}
                    onBookCoach={(c) => setBookingCoach(c)}
                    navigate={navigate}
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
          setFilters={updateFilters}
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
        maxWidth="3xl"
      >
        <OjtCalculatorWidget
          isModal
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
