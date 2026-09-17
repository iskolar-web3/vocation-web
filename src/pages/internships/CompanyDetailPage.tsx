import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { Internship } from '../../types';

interface CompanyDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({ slug, navigate }) => {
  const { companies, internships } = useData();
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  const company = companies.find((c) => c.slug === slug);

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#021F53] font-display">Company Not Found</h2>
        <p className="text-xs text-slate-600">The requested employer profile does not exist.</p>
        <button
          onClick={() => navigate('/companies')}
          className="px-6 py-2.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  const companyInternships = internships.filter(
    (i) => i.company.slug === company.slug && i.status === 'open'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/companies')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Companies Directory</span>
      </button>

      {/* Main Company Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft">
        {/* Banner Area */}
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-[#021F53] via-[#002774] to-[#3f58b2] relative overflow-hidden">
          {company.banner ? (
            <img
              src={company.banner}
              alt={company.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 grid-subtle opacity-30 pointer-events-none" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Profile Info Stage */}
        <div className="px-6 sm:px-10 pb-8 relative z-10 space-y-6">
          {/* Top Row: Floating Logo + Company Meta + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-0">
            {/* Left: Floating Avatar + Name/Details */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 min-w-0 flex-1">
              {/* Floating Logo: only this has negative top margin */}
              <div className="-mt-14 sm:-mt-16 flex-shrink-0">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-lift bg-white"
                />
              </div>

              {/* Company Info: firmly inside the white card area */}
              <div className="space-y-2 min-w-0 pt-1 sm:pt-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display leading-tight">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3f58b2]" /> Verified Employer
                    </span>
                  )}
                </div>

                {/* Subtitle / Industry & Location Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="font-semibold text-[#3f58b2]">{company.industry}</span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.location}</span>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.size}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* External Website Button */}
            {company.website && (
              <div className="pt-1 sm:pt-2 flex-shrink-0">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#ff9b00]" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="pt-5 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About {company.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
              {company.description}
            </p>
          </div>

          {/* Culture & Perks Grid */}
          {company.perks && company.perks.length > 0 && (
            <div className="pt-2 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Internship Perks &amp; Environment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {company.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-[#021F53] font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3f58b2] flex-shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Open Internship Roles Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#3f58b2]" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#021F53]">
              Open Internships at {company.name} ({companyInternships.length})
            </h2>
          </div>
        </div>

        {companyInternships.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-2xs space-y-2">
            <p className="text-xs text-slate-500">No active openings available at this time.</p>
            <button
              onClick={() => navigate('/internships')}
              className="px-4 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Explore Other Internships
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {companyInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                layout="row"
                onSelect={() => navigate(`/internships/${internship.slug}`)}
                onApply={(item) => setSelectedInternship(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Outbound Departure Modal */}
      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />
    </div>
  );
};
