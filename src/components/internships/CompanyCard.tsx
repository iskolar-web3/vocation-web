import React from 'react';
import { MapPin, ArrowRight, Briefcase } from 'lucide-react';
import { CompanyCard as CompanyCardType, CompanyDetail } from '../../types/api';

interface CompanyCardProps {
  company: CompanyCardType | CompanyDetail;
  onSelect: (company: CompanyCardType | CompanyDetail) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onSelect }) => {
  const logoUrl = company.logo_url || (company as any).logo || '';
  const openRoles = company.open_role_count ?? (company as any).openRoleCount ?? 0;

  return (
    <div
      onClick={() => onSelect(company)}
      className="tactile-card rounded-3xl p-6 flex flex-col justify-between cursor-pointer group"
    >
      <div className="space-y-4">
        {/* Company Header Row */}
        <div className="flex items-start gap-3.5">
          <img
            src={logoUrl}
            alt={company.name}
            className="w-13 h-13 rounded-2xl object-cover border border-slate-200 bg-white group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5"
          />
          <div className="min-w-0 space-y-1 flex-1">
            <h3 className="text-base font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors font-headline leading-tight truncate">
              {company.name}
            </h3>
            <p className="text-xs font-semibold text-[#3f58b2] truncate">{company.industry}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{company.location}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {company.description}
          </p>
        )}

        {/* Perks Tags */}
        {company.perks && company.perks.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {company.perks.slice(0, 2).map((perk, idx) => (
              <span
                key={idx}
                className="stamp-badge bg-slate-50 text-slate-700 border border-slate-200 text-[10px]"
              >
                ✓ {perk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Strip */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
          <Briefcase className="w-3 h-3 text-[#3f58b2]" />
          <span>{openRoles} Open Roles</span>
        </span>

        <span className="font-bold text-[#021F53] group-hover:text-[#3f58b2] flex items-center gap-1 transition-colors text-xs">
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#ff9b00]" />
        </span>
      </div>
    </div>
  );
};
