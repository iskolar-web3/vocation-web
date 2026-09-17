import React, { useState, useMemo } from 'react';
import { Search, Award, SlidersHorizontal, RotateCcw, Sparkles, LayoutList, LayoutGrid } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CoachCard } from '../../components/coaching/CoachCard';
import { CoachFilters, CoachFilterState } from '../../components/coaching/CoachFilters';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { PayMongoModal } from '../../components/common/PayMongoModal';
import { Drawer } from '../../components/common/Drawer';
import { Coach, Booking } from '../../types';

interface CoachDirectoryPageProps {
  navigate: (path: string) => void;
  initialExpertise?: string;
  initialPrice?: 'all' | 'free' | 'under500' | '500to1000' | '1000plus';
}

export const CoachDirectoryPage: React.FC<CoachDirectoryPageProps> = ({
  navigate,
  initialExpertise = '',
  initialPrice = 'all',
}) => {
  const { coaches } = useData();

  const [filters, setFilters] = useState<CoachFilterState>({
    q: '',
    expertise: initialExpertise,
    price: initialPrice,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'row'>('grid');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [activePayMongoBooking, setActivePayMongoBooking] = useState<Booking | null>(null);

  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      // Query search
      if (filters.q.trim()) {
        const query = filters.q.toLowerCase();
        const matchesName = coach.name.toLowerCase().includes(query);
        const matchesCompany = coach.company.toLowerCase().includes(query);
        const matchesBio = coach.bio.toLowerCase().includes(query);
        const matchesExp = coach.expertise.some((e) => e.toLowerCase().includes(query));
        if (!matchesName && !matchesCompany && !matchesBio && !matchesExp) return false;
      }

      // Expertise filter
      if (filters.expertise) {
        if (!coach.expertise.includes(filters.expertise)) return false;
      }

      // Price tier
      if (filters.price === 'free') {
        const hasFree = coach.sessionTypes.some((st) => st.priceCentavos === 0);
        if (!hasFree) return false;
      } else if (filters.price === 'under500') {
        const hasUnder500 = coach.sessionTypes.some(
          (st) => st.priceCentavos > 0 && st.priceCentavos <= 50000
        );
        if (!hasUnder500) return false;
      } else if (filters.price === '500to1000') {
        const has500to1000 = coach.sessionTypes.some(
          (st) => st.priceCentavos > 50000 && st.priceCentavos <= 100000
        );
        if (!has500to1000) return false;
      } else if (filters.price === '1000plus') {
        const has1000plus = coach.sessionTypes.some((st) => st.priceCentavos > 100000);
        if (!has1000plus) return false;
      }

      return true;
    });
  }, [coaches, filters]);

  const handleReset = () => {
    setFilters({ q: '', expertise: '', price: 'all' });
  };

  const quickExpertisePills = [
    { label: 'All Specialties', value: '' },
    { label: 'System Design', value: 'System Design' },
    { label: 'Frontend & UI', value: 'Frontend & UI' },
    { label: 'STAR Behavioral', value: 'STAR Behavioral' },
    { label: 'ATS Resume Review', value: 'Resume Review' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#021F53] rounded-3xl p-6 sm:p-10 text-white shadow-soft relative overflow-hidden border border-[#3f58b2]/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
            <Award className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Find a Coach Directory (S-009)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
            Book 1-on-1 Coaching with Industry Leaders
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Select a verified coach by specialization and book directly into their live availability schedule. Supports GCash, Maya, and Visa/Mastercard via PayMongo.
          </p>

          <div className="relative pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search by coach name, company (Grab, Canva, Maya), or skill..."
              className="w-full pl-11 pr-4 py-3 bg-white text-[#021F53] font-medium text-xs sm:text-sm rounded-xl shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff9b00]"
            />
          </div>
        </div>
      </div>

      {/* Quick Specialization Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {quickExpertisePills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => setFilters((prev) => ({ ...prev, expertise: pill.value }))}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filters.expertise === pill.value
                ? 'bg-[#021F53] text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Filters */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3">
          <CoachFilters filters={filters} setFilters={setFilters} onReset={handleReset} />
        </aside>

        {/* Results */}
        <main className="md:col-span-8 lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-xs sm:text-sm text-[#021F53]">
              {filteredCoaches.length} Available Coaches
            </span>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#021F53] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
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
                  title="Stream Row View"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden px-3 py-1.5 bg-[#f0f7ff] text-[#3f58b2] font-bold text-xs rounded-xl border border-[#607ef2]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {filteredCoaches.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-[#021F53] font-headline">
                No coaches match your filters
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Try selecting a different specialty or clearing price filters.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'row' ? (
            <div className="space-y-3">
              {filteredCoaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  layout="row"
                  onSelect={() => navigate(`/coaches/${coach.slug}`)}
                  onBook={(c) => setSelectedCoach(c)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCoaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  layout="grid"
                  onSelect={() => navigate(`/coaches/${coach.slug}`)}
                  onBook={(c) => setSelectedCoach(c)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Filter Coaches"
      >
        <CoachFilters filters={filters} setFilters={setFilters} onReset={handleReset} isMobileDrawer />
      </Drawer>

      <BookingDialog
        isOpen={!!selectedCoach}
        onClose={() => setSelectedCoach(null)}
        coach={selectedCoach}
        onOpenPayMongo={(b) => setActivePayMongoBooking(b)}
        onBookingSuccess={() => navigate('/app/bookings')}
      />

      <PayMongoModal
        isOpen={!!activePayMongoBooking}
        onClose={() => setActivePayMongoBooking(null)}
        booking={activePayMongoBooking}
        onSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
