import React from 'react';
import { Search, RotateCcw, Filter, SlidersHorizontal } from 'lucide-react';
import { WorkSetup } from '../../types';

export interface FilterState {
  q: string;
  field: string;
  setup: string; // 'all' | WorkSetup
  pay: 'all' | 'paid' | 'unpaid';
  minOjtHours: string;
  sort: 'newest' | 'deadline_soon' | 'relevance';
}

interface InternshipFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
  onReset: () => void;
  isMobileDrawer?: boolean;
}

export const InternshipFilters: React.FC<InternshipFiltersProps> = ({
  filters,
  setFilters,
  totalResults,
  onReset,
  isMobileDrawer = false,
}) => {
  const fields = [
    'All Fields',
    'Software Engineering',
    'UI/UX Design',
    'Data Science & AI',
    'Cybersecurity',
    'Business & Operations',
    'Marketing',
    'Human Resources',
    'Finance',
  ];

  const workSetups: { value: string; label: string }[] = [
    { value: 'all', label: 'All Setups' },
    { value: 'remote', label: 'Remote Only' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  const payOptions: { value: 'all' | 'paid' | 'unpaid'; label: string }[] = [
    { value: 'all', label: 'All Compensation' },
    { value: 'paid', label: 'Paid Stipend Only' },
    { value: 'unpaid', label: 'Unpaid Roles' },
  ];

  const ojtOptions = [
    { value: 'all', label: 'Any OJT Hours' },
    { value: '200', label: '200+ Hours' },
    { value: '300', label: '300+ Hours' },
    { value: '400', label: '400+ Hours' },
  ];

  return (
    <div className={`space-y-6 ${isMobileDrawer ? '' : 'bg-white rounded-2xl p-6 border border-[#3f58b2]/10 shadow-soft'}`}>
      {/* Search Header */}
      {!isMobileDrawer && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#021F53] font-headline font-bold text-base">
            <SlidersHorizontal className="w-4 h-4 text-[#3f58b2]" />
            <span>Filter Roles</span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-[#607ef2] hover:text-[#3f58b2] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Field / Discipline */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
          Field of Study / Discipline
        </label>
        <select
          value={filters.field}
          onChange={(e) => setFilters((prev) => ({ ...prev, field: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-[#021F53] font-medium focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30"
        >
          {fields.map((f) => (
            <option key={f} value={f === 'All Fields' ? '' : f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Work Setup */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
          Work Setup
        </label>
        <div className="space-y-1.5">
          {workSetups.map((setup) => (
            <label
              key={setup.value}
              className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer hover:text-[#3f58b2]"
            >
              <input
                type="radio"
                name={`setup-${isMobileDrawer ? 'mobile' : 'desktop'}`}
                value={setup.value}
                checked={filters.setup === setup.value}
                onChange={(e) => setFilters((prev) => ({ ...prev, setup: e.target.value }))}
                className="w-4 h-4 text-[#3f58b2] focus:ring-[#3f58b2]"
              />
              <span>{setup.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Compensation */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
          Compensation & Allowance
        </label>
        <div className="space-y-1.5">
          {payOptions.map((pay) => (
            <label
              key={pay.value}
              className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer hover:text-[#3f58b2]"
            >
              <input
                type="radio"
                name={`pay-${isMobileDrawer ? 'mobile' : 'desktop'}`}
                value={pay.value}
                checked={filters.pay === pay.value}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, pay: e.target.value as any }))
                }
                className="w-4 h-4 text-[#3f58b2] focus:ring-[#3f58b2]"
              />
              <span>{pay.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* OJT Hours */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
          OJT Credit Hours
        </label>
        <select
          value={filters.minOjtHours}
          onChange={(e) => setFilters((prev) => ({ ...prev, minOjtHours: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-[#021F53] font-medium focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30"
        >
          {ojtOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
          Sort Results By
        </label>
        <select
          value={filters.sort}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sort: e.target.value as any }))
          }
          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-[#021F53] font-medium focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30 cursor-pointer"
        >
          <option value="newest">Newest Postings First</option>
          <option value="deadline_soon">Deadline Closing Soon</option>
          <option value="relevance">Most Relevant</option>
        </select>
      </div>

      {isMobileDrawer && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-1/2 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="w-1/2 py-2 text-xs font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] rounded-xl cursor-pointer"
          >
            Show {totalResults} Roles
          </button>
        </div>
      )}
    </div>
  );
};
