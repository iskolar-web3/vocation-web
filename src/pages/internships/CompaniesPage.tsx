import React, { useState } from 'react';
import { Building, Search, Loader2, AlertCircle } from 'lucide-react';
import { useCompanies } from '../../services/queries';
import { CompanyCard } from '../../components/internships/CompanyCard';

interface CompaniesPageProps {
  navigate: (path: string) => void;
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({ navigate }) => {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const industries = [
    'All',
    'Fintech & Digital Banking',
    'Graphic Design & SaaS',
    'AI & Data Intelligence',
    'HR Tech & B2B SaaS',
    'E-Commerce & Logistics',
  ];

  const { data, isLoading, error } = useCompanies({
    q: search || undefined,
  });

  const companies = data?.items || [];

  const filteredCompanies = companies.filter((comp) => {
    const matchesIndustry =
      selectedIndustry === 'All' || comp.industry.includes(selectedIndustry);
    return matchesIndustry;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#021F53] to-[#3f58b2] rounded-3xl p-6 sm:p-10 text-white shadow-soft space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
          <Building className="w-3.5 h-3.5" />
          <span>Employer Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display">
          Partner Companies &amp; Organizations
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
          Browse verified Philippine companies offering credited student internships and OJT programs.
        </p>

        {/* Search */}
        <div className="relative pt-2 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, location, or industry..."
            className="w-full pl-12 pr-4 py-3.5 bg-white text-[#021F53] font-medium text-sm rounded-2xl shadow-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff9b00]"
          />
        </div>
      </div>

      {/* Industry Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {industries.map((ind) => (
          <button
            key={ind}
            type="button"
            onClick={() => setSelectedIndustry(ind)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedIndustry === ind
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-rose-700 font-bold">Failed to load partner companies.</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-sm font-bold text-[#021F53]">No companies found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onSelect={() => navigate(`/companies/${company.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
