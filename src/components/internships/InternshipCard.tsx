import React from 'react';
import {
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Building2,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Internship } from '../../types';
import { formatPesos } from '../../lib/utils';
import { DeadlineCountdown } from './DeadlineCountdown';
import { useData } from '../../context/DataContext';

interface InternshipCardProps {
  internship: Internship;
  onSelect: (internship: Internship) => void;
  onApply: (internship: Internship) => void;
  layout?: 'grid' | 'row' | 'split';
  isSelected?: boolean;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onSelect,
  onApply,
  layout = 'grid',
  isSelected = false,
}) => {
  const { isInternshipSaved, toggleSaveInternship } = useData();
  const isSaved = isInternshipSaved(internship.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveInternship(internship.id);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(internship);
  };

  const getSetupBadge = (setup: string) => {
    switch (setup) {
      case 'remote':
        return (
          <span className="stamp-badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] py-0 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Remote
          </span>
        );
      case 'hybrid':
        return (
          <span className="stamp-badge bg-blue-50 text-[#3f58b2] border border-blue-200 text-[10px] py-0 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3f58b2]" />
            Hybrid
          </span>
        );
      default:
        return (
          <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200 text-[10px] py-0 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            On-site
          </span>
        );
    }
  };

  // Layout 1: Split Dossier Master Item (Used in 2-column master-detail view)
  if (layout === 'split') {
    return (
      <div
        onClick={() => onSelect(internship)}
        className={`group relative rounded-2xl p-4 transition-all duration-150 cursor-pointer space-y-3 ${
          isSelected
            ? 'stream-row-active bg-[#f0f7ff]'
            : 'stream-row hover:border-[#3f58b2]/40 hover:shadow-soft'
        }`}
      >
        {/* Header: Logo + (Company & Title) + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <img
              src={internship.company.logo}
              alt={internship.company.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 bg-white flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0 space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {internship.company.name}
                </span>
                {internship.company.isVerified && (
                  <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/30 text-[9px] py-0 px-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors line-clamp-1 font-headline">
                {internship.title}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveToggle}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
              isSaved
                ? 'bg-amber-100 text-[#ff9b00]'
                : 'text-slate-400 hover:text-[#ff9b00] hover:bg-slate-100'
            }`}
            title={isSaved ? 'Saved' : 'Save role'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#ff9b00]' : ''}`} />
          </button>
        </div>

        {/* Badges Horizon Row (Wrap safe with exact heights) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20 text-[10px] py-0 px-2">
            {internship.field}
          </span>
          {getSetupBadge(internship.workSetup)}
          {internship.isPaid && internship.stipendAmount ? (
            <span className="stamp-badge bg-amber-50 text-amber-950 border border-amber-300 text-[10px] py-0 px-2">
              <Coins className="w-2.5 h-2.5 text-[#ff9b00]" />
              {formatPesos(internship.stipendAmount)}/mo
            </span>
          ) : (
            <span className="stamp-badge bg-slate-100 text-slate-600 border border-slate-200 text-[10px] py-0 px-2">
              Unpaid
            </span>
          )}
          {internship.ojtHours && (
            <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200 text-[10px] py-0 px-2 font-medium">
              {internship.ojtHours}h OJT
            </span>
          )}
        </div>

        {/* Footer: Location & Inspect Action */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1 truncate max-w-[200px]">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{internship.company.location}</span>
          </span>
          <span className="text-[#3f58b2] font-semibold text-[10.5px] flex items-center gap-0.5">
            <span>Inspect</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  }

  // Layout 2: Full-Width Stream Row (Used on homepage & full-width directory stream)
  if (layout === 'row') {
    return (
      <div
        onClick={() => onSelect(internship)}
        className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isSelected
            ? 'stream-row-active bg-[#f0f7ff]'
            : 'stream-row hover:border-[#3f58b2]/40 hover:shadow-soft'
        }`}
      >
        {/* Left Side: Logo & Aligned Text */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <img
            src={internship.company.logo}
            alt={internship.company.name}
            className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 bg-white flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5"
          />

          <div className="min-w-0 space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {internship.company.name}
              </span>
              {internship.company.isVerified && (
                <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/30 text-[9.5px] py-0 px-1.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors truncate font-headline leading-snug">
              {internship.title}
            </h3>

            {/* Realigned Metadata Horizon Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{internship.company.location}</span>
              </span>

              <span className="text-slate-300">·</span>

              <span className="text-[11px] font-bold text-[#3f58b2]">
                {internship.field}
              </span>

              {internship.ojtHours && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200 text-[10px] py-0 px-1.5 font-medium">
                    {internship.ojtHours}h OJT
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Realigned Compensation & Action Buttons */}
        <div className="flex items-center justify-between lg:justify-end gap-3.5 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="flex items-center gap-2">
            {getSetupBadge(internship.workSetup)}

            {internship.isPaid && internship.stipendAmount ? (
              <span className="stamp-badge bg-amber-50 text-amber-950 border border-amber-300 text-[11px]">
                <Coins className="w-3 h-3 text-[#ff9b00]" />
                {formatPesos(internship.stipendAmount)}/mo
              </span>
            ) : (
              <span className="stamp-badge bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                Unpaid
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveToggle}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSaved
                  ? 'bg-amber-100 text-[#ff9b00] hover:bg-amber-200'
                  : 'text-slate-400 hover:text-[#ff9b00] hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save role'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#ff9b00]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleApplyClick}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#021F53] hover:bg-[#3f58b2] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ff9b00]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Layout 3: Grid / Matrix View
  return (
    <div
      onClick={() => onSelect(internship)}
      className={`group relative rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-[#f0f7ff] border-2 border-[#3f58b2] shadow-soft'
          : 'tactile-card'
      }`}
    >
      <div className="space-y-3.5">
        {/* Top Header Strip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <img
              src={internship.company.logo}
              alt={internship.company.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 bg-white flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5"
            />
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#3f58b2] transition-colors truncate">
                  {internship.company.name}
                </span>
                {internship.company.isVerified && (
                  <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/30 text-[9.5px] py-0 px-1.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors line-clamp-1 font-headline leading-snug">
                {internship.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveToggle}
            className={`p-2 rounded-xl transition-all flex-shrink-0 cursor-pointer ${
              isSaved
                ? 'bg-amber-100 text-[#ff9b00]'
                : 'text-slate-400 hover:text-[#ff9b00] hover:bg-slate-50'
            }`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#ff9b00]' : ''}`} />
          </button>
        </div>

        {/* Feature Badges Horizon */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/30 text-[10.5px]">
            {internship.field}
          </span>
          {getSetupBadge(internship.workSetup)}
          {internship.isPaid && internship.stipendAmount ? (
            <span className="stamp-badge bg-amber-50 text-amber-950 border border-amber-300 text-[10.5px]">
              <Coins className="w-3 h-3 text-[#ff9b00]" />
              {formatPesos(internship.stipendAmount)}/mo
            </span>
          ) : (
            <span className="stamp-badge bg-slate-100 text-slate-600 border border-slate-200 text-[10.5px]">
              Unpaid
            </span>
          )}
          {internship.ojtHours && (
            <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px]">
              {internship.ojtHours}h OJT
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {internship.description}
        </p>
      </div>

      {/* Card Footer: Location Left, Action Right */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate text-[11px] font-medium">{internship.company.location}</span>
        </div>

        <button
          type="button"
          onClick={handleApplyClick}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#021F53] hover:bg-[#3f58b2] shadow-2xs transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          <span>Apply</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#ff9b00]" />
        </button>
      </div>
    </div>
  );
};
