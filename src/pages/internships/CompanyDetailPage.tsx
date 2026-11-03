import React, { useState } from 'react';
import {
  MapPin,
  Globe,
  Users,
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react';
import { useCompany } from '../../services/queries';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { InternshipCard as InternshipCardType, InternshipDetail } from '../../types/api';

interface CompanyDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({ slug, navigate }) => {
  const { data: company, isLoading, error } = useCompany(slug);
  const [selectedInternship, setSelectedInternship] = useState<InternshipCardType | InternshipDetail | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2] mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
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

  const openInternships = company.open_internships || [];
  const logoUrl = company.logo_url || (company as any).logo || '';

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
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft">
        {/* Banner Area */}
        <div className="h-44 sm:h-56 w-full bg-[#021F53] relative overflow-hidden">
          {(company as any).banner_url && (
            <img
              src={(company as any).banner_url}
              alt={company.name}
              className="w-full h-full object-cover opacity-60"
            />
          )}
        </div>

        {/* Profile Info Stage */}
        <div className="px-6 sm:px-10 pb-8 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 min-w-0 flex-1">
              <div className="-mt-14 sm:-mt-16 flex-shrink-0">
                <img
                  src={logoUrl}
                  alt={company.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lift bg-white"
                />
              </div>

              <div className="space-y-2 min-w-0 pt-1 sm:pt-2 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display leading-tight">
                  {company.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#3f58b2]">
                  {company.industry} · {company.location}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.size} Team Size</span>
                  </div>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#3f58b2] hover:underline font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{company.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Company */}
          {company.about && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-[#021F53] font-headline">About the Organization</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
                {company.about}
              </p>
            </div>
          )}

          {/* Perks & Benefits */}
          {(company as any).perks && (company as any).perks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
                  Intern Benefits &amp; Perks
                </h3>
                <span className="text-[10px] font-bold text-[#1d4ed8] bg-[#f0f7ff] px-2.5 py-0.5 rounded-md border border-[#3f58b2]/20">
                  {((company as any).perks as string[]).length} Perks
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {((company as any).perks as string[]).map((perk: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[#f8fbff] px-3.5 py-2.5 rounded-xl border border-[#dbeafe] flex items-center gap-2.5 text-xs text-slate-700 shadow-2xs hover:border-[#3f58b2]/40 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-md bg-white border border-[#3f58b2]/20 text-[#2563eb] flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 text-[#2563eb]" />
                    </div>
                    <span className="font-semibold text-[#021F53] leading-snug">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Open Roles Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#021F53] font-display">
              Open Internship Roles at {company.name}
            </h2>
            <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
              {openInternships.length} Open
            </span>
          </div>
        </div>

        {openInternships.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#021F53]">No open internship roles currently.</p>
            <p className="text-xs text-slate-500 mt-1">Check back later or browse other partner companies.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openInternships.map((internship) => (
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
      </div>

      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />
    </div>
  );
};
