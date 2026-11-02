import React from 'react';
import { Search, RotateCcw, Award, SlidersHorizontal } from 'lucide-react';

export interface CoachFilterState {
  q: string;
  expertise: string;
  // API-020 ?price knows any/free/paid only; peso-range tiers aren't supported server-side.
  price: 'all' | 'free' | 'paid';
}

interface CoachFiltersProps {
  filters: CoachFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CoachFilterState>>;
  onReset: () => void;
  isMobileDrawer?: boolean;
}

export const CoachFilters: React.FC<CoachFiltersProps> = ({
  filters,
  setFilters,
  onReset,
  isMobileDrawer = false,
}) => {
  const expertiseList = [
    'All Areas of Expertise',
    'Software Engineering',
    'Technical Coding Interviews',
    'UI/UX Design',
    'Design Portfolio Critique',
    'Data Science & AI',
    'HR & Behavioral Interviews',
    'STAR Method Coaching',
    'Resume Teardown',
    'OJT Workplace Etiquette',
  ];

  const priceTiers = [
    { value: 'all', label: 'All Session Rates' },
    { value: 'free', label: 'Free Intro Sessions (₱0)' },
    { value: 'paid', label: 'Paid Sessions' },
  ];

  return (
    <div className={`space-y-6 ${isMobileDrawer ? '' : 'bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs sticky top-24'}`}>
      {!isMobileDrawer && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#021F53] font-headline font-bold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-[#3f58b2]" />
            <span>Filter Coaches</span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Expertise */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Mentorship &amp; Prep Topic
        </label>
        <select
          value={filters.expertise}
          onChange={(e) => setFilters((prev) => ({ ...prev, expertise: e.target.value }))}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#021F53] font-medium focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30 cursor-pointer"
        >
          {expertiseList.map((item) => (
            <option key={item} value={item === 'All Areas of Expertise' ? '' : item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Price Tier */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Session Pricing Tier
        </label>
        <div className="space-y-1.5">
          {priceTiers.map((tier) => (
            <label
              key={tier.value}
              className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#3f58b2]"
            >
              <input
                type="radio"
                name={`coach-price-${isMobileDrawer ? 'mobile' : 'desktop'}`}
                value={tier.value}
                checked={filters.price === tier.value}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, price: e.target.value as any }))
                }
                className="w-3.5 h-3.5 text-[#3f58b2] focus:ring-[#3f58b2]"
              />
              <span>{tier.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
