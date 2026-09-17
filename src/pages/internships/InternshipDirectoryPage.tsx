import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  LayoutList,
  LayoutGrid,
  Columns2,
  MapPin,
  ArrowUpDown,
  Calculator,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { InternshipFilters, FilterState } from '../../components/internships/InternshipFilters';
import { InternshipDossier } from '../../components/internships/InternshipDossier';
import { OjtCalculatorWidget } from '../../components/internships/OjtCalculatorWidget';
import { Drawer } from '../../components/common/Drawer';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { PayMongoModal } from '../../components/common/PayMongoModal';
import { Internship, Coach, Booking } from '../../types';

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
  const { internships } = useData();

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
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [activeDossierRole, setActiveDossierRole] = useState<Internship | null>(null);
  const [bookingCoach, setBookingCoach] = useState<Coach | null>(null);
  const [activePayMongoBooking, setActivePayMongoBooking] = useState<Booking | null>(null);

  // Filter only 'open' postings for public directory (BR-003)
  const openPostings = useMemo(() => {
    return internships.filter((i) => i.status === 'open');
  }, [internships]);

  const filteredInternships = useMemo(() => {
    return openPostings
      .filter((item) => {
        // Query search
        if (filters.q.trim()) {
          const query = filters.q.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(query);
          const matchesCompany = item.company.name.toLowerCase().includes(query);
          const matchesField = item.field.toLowerCase().includes(query);
          const matchesLocation = item.company.location.toLowerCase().includes(query);
          const matchesReqs = item.requirements.some((r) => r.toLowerCase().includes(query));
          if (!matchesTitle && !matchesCompany && !matchesField && !matchesLocation && !matchesReqs) {
            return false;
          }
        }

        // Field filter
        if (filters.field && item.field !== filters.field) {
          return false;
        }

        // Work setup
        if (filters.setup !== 'all' && item.workSetup !== filters.setup) {
          return false;
        }

        // Compensation
        if (filters.pay === 'paid' && !item.isPaid) {
          return false;
        }
        if (filters.pay === 'unpaid' && item.isPaid) {
          return false;
        }

        // OJT hours
        if (filters.minOjtHours !== 'all') {
          const minHours = parseInt(filters.minOjtHours, 10);
          if (!item.ojtHours || item.ojtHours < minHours) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filters.sort === 'deadline_soon') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (filters.sort === 'highest_stipend') {
          const aStipend = a.stipendAmount || 0;
          const bStipend = b.stipendAmount || 0;
          return bStipend - aStipend;
        }
        return 0;
      });
  }, [openPostings, filters]);

  // Set active dossier role default if not set
  const currentDossierRole = activeDossierRole || filteredInternships[0] || null;

  const handleResetFilters = () => {
    setFilters({
      q: '',
      field: '',
      setup: 'all',
      pay: 'all',
      minOjtHours: 'all',
      sort: 'newest',
    });
  };

  const hasActiveFilters =
    !!filters.q ||
    !!filters.field ||
    filters.setup !== 'all' ||
    filters.pay !== 'all' ||
    filters.minOjtHours !== 'all';

  const quickFieldTabs = [
    { label: 'All Roles', value: '' },
    { label: 'Software', value: 'Software Engineering' },
    { label: 'UI/UX', value: 'UI/UX Design' },
    { label: 'Data & AI', value: 'Data & AI' },
    { label: 'Business', value: 'Business & Growth' },
    { label: 'Marketing', value: 'Marketing & Comms' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Directory Page Header */}
      <div className="bg-[#021F53] rounded-3xl p-6 sm:p-10 text-white shadow-soft relative overflow-hidden border border-[#3f58b2]/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Internship &amp; OJT Directory (S-004)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
            Verified Internships in the Philippines
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search active openings across vetted tech enterprises and startups. Direct outbound apply with zero stored applicant files (BR-001).
          </p>

          {/* Quick Search Bar */}
          <div className="relative pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Filter by role title, company, skill (e.g. React, Python), or location..."
              className="w-full pl-11 pr-4 py-3 bg-white text-[#021F53] font-medium text-xs sm:text-sm rounded-xl shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff9b00]"
            />
          </div>
        </div>
      </div>

      {/* Quick Field Chips Bar & OJT Calculator Trigger */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {quickFieldTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilters((prev) => ({ ...prev, field: tab.value }))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filters.field === tab.value
                  ? 'bg-[#021F53] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
            isCalculatorOpen
              ? 'bg-[#ff9b00] text-[#021F53]'
              : 'bg-white text-[#021F53] border border-slate-200 hover:border-[#ff9b00]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#ff9b00]" />
          <span>{isCalculatorOpen ? 'Hide OJT Calculator' : 'OJT Feasibility Tool'}</span>
        </button>
      </div>

      {/* Embedded OJT Calculator Accordion */}
      {isCalculatorOpen && (
        <div className="animate-slideDown">
          <OjtCalculatorWidget
            onFindMatchingRoles={(hours) => {
              setFilters((prev) => ({ ...prev, minOjtHours: String(hours) }));
              setIsCalculatorOpen(false);
            }}
          />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar (hidden below 768px) */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3">
          <InternshipFilters
            filters={filters}
            setFilters={setFilters}
            totalResults={filteredInternships.length}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Results Area */}
        <main className="md:col-span-8 lg:col-span-9 space-y-4">
          {/* Top Control Bar: Total Count, 3-Way Mode Switcher & Mobile Filters */}
          <div className="flex items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#021F53]">
                {filteredInternships.length} Opportunities
              </span>
              {hasActiveFilters && (
                <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/30 text-[10px] py-0">
                  Filtered
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 3-Way View Mode Switcher */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-white text-[#021F53] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Master-Detail Split View"
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
                  title="Linear Stream List View"
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
                  title="Matrix Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden px-3 py-1.5 bg-[#f0f7ff] text-[#3f58b2] font-bold text-xs rounded-xl border border-[#607ef2]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-[#3f58b2] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Internships Stream, Split Dossier, or Grid */}
          {filteredInternships.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#021F53] font-headline">
                No matching internships found
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                No roles matched your current filter criteria. Try adjusting your query or resetting active filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : viewMode === 'split' ? (
            /* Split Master-Detail Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Stream Rows */}
              <div className="lg:col-span-6 space-y-3">
                {filteredInternships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    layout="split"
                    isSelected={currentDossierRole?.id === internship.id}
                    onSelect={(item) => setActiveDossierRole(item)}
                    onApply={(item) => setSelectedInternship(item)}
                  />
                ))}
              </div>

              {/* Right Column: Sticky Dossier Inspector */}
              <div className="hidden lg:block lg:col-span-6">
                {currentDossierRole ? (
                  <InternshipDossier
                    internship={currentDossierRole}
                    onApply={(item) => setSelectedInternship(item)}
                    onBookCoach={(c) => setBookingCoach(c)}
                  />
                ) : null}
              </div>
            </div>
          ) : viewMode === 'row' ? (
            <div className="space-y-3">
              {filteredInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  layout="row"
                  onSelect={() => navigate(`/internships/${internship.slug}`)}
                  onApply={(item) => setSelectedInternship(item)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  layout="grid"
                  onSelect={() => navigate(`/internships/${internship.slug}`)}
                  onApply={(item) => setSelectedInternship(item)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer (S-104) */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Filter Internships"
      >
        <InternshipFilters
          filters={filters}
          setFilters={setFilters}
          totalResults={filteredInternships.length}
          onReset={handleResetFilters}
          isMobileDrawer
        />
      </Drawer>

      {/* Outbound Departure Notice Modal (S-103, BR-001/BR-002) */}
      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />

      {/* 1-on-1 Booking Dialog */}
      <BookingDialog
        isOpen={!!bookingCoach}
        onClose={() => setBookingCoach(null)}
        coach={bookingCoach}
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
