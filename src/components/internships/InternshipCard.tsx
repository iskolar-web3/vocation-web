import React from 'react';
import {
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { InternshipCard as InternshipCardType, InternshipDetail } from '../../types/api';
import { formatPesos } from '../../lib/utils';
import { DeadlineCountdown } from './DeadlineCountdown';
import { useSavedInternships, useSaveInternship, useUnsaveInternship } from '../../services/queries';
import { useAuth } from '../../context/AuthContext';

interface InternshipCardProps {
  internship: InternshipCardType | InternshipDetail;
  onSelect: (internship: InternshipCardType | InternshipDetail) => void;
  onApply: (internship: InternshipCardType | InternshipDetail) => void;
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
  const { isAuthenticated } = useAuth();
  const { data: savedList = [] } = useSavedInternships();
  const saveMutation = useSaveInternship();
  const unsaveMutation = useUnsaveInternship();

  const isSaved = savedList.some((item) => item.id === internship.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isSaved) {
      unsaveMutation.mutate(internship.id);
    } else {
      saveMutation.mutate(internship.id);
    }
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

  const logoUrl = internship.company.logo_url || (internship.company as any).logo || '';

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
              src={logoUrl}
              alt={internship.company.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 bg-white flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0 space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {internship.company.name}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors line-clamp-1 font-headline">
                {internship.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveToggle}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isSaved
                ? 'text-[#ff9b00] bg-[#ff9b00]/10'
                : 'text-slate-400 hover:text-[#3f58b2] hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save internship'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Spec Pill Strip */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(internship as any).work_setup && getSetupBadge((internship as any).work_setup)}
          {internship.duration_weeks && (
            <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200 text-[10px] py-0 px-2">
              {internship.duration_weeks} wks
            </span>
          )}
          {internship.is_paid ? (
            <span className="stamp-badge bg-amber-50 text-amber-950 border border-amber-300 text-[10px] py-0 px-2 font-bold">
              {(internship as any).compensation_details || ((internship as any).stipend_amount ? `${formatPesos((internship as any).stipend_amount)}/${(internship as any).stipend_period || 'mo'}` : 'Paid')}
            </span>
          ) : (
            <span className="stamp-badge bg-slate-100 text-slate-600 border border-slate-200 text-[10px] py-0 px-2">
              Unpaid / For Credit
            </span>
          )}
        </div>

        {/* Footer Meta: Location + Deadline Countdown */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
          <DeadlineCountdown deadlineIso={internship.deadline || undefined} />
        </div>
      </div>
    );
  }

  // Layout 2: Wide Stream Row
  if (layout === 'row') {
    return (
      <div
        onClick={() => onSelect(internship)}
        className="stream-row rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-[#3f58b2]/40 hover:shadow-soft transition-all"
      >
        <div className="flex items-start gap-4 min-w-0">
          <img
            src={logoUrl}
            alt={internship.company.name}
            className="w-13 h-13 rounded-2xl object-cover border border-slate-200/80 bg-white flex-shrink-0"
          />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {internship.company.name}
              </span>
              <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20 text-[10px] py-0 px-2">
                {internship.field}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#021F53] hover:text-[#3f58b2] transition-colors truncate font-headline">
              {internship.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{internship.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{internship.duration_weeks} Weeks</span>
              </div>
              {internship.is_paid && (
                <div className="flex items-center gap-1 font-bold text-amber-950 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                  <Coins className="w-3 h-3 text-[#ff9b00]" />
                  <span>
                    {(internship as any).compensation_details || ((internship as any).stipend_amount ? `${formatPesos((internship as any).stipend_amount)}/${(internship as any).stipend_period || 'month'}` : 'Paid Allowance')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <DeadlineCountdown deadlineIso={internship.deadline || undefined} />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveToggle}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSaved
                  ? 'text-[#ff9b00] bg-[#ff9b00]/10'
                  : 'text-slate-400 hover:text-[#3f58b2] hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleApplyClick}
              className="px-4 py-2 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Layout 3: Default Grid Card
  return (
    <div
      onClick={() => onSelect(internship)}
      className="tactile-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group"
    >
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={internship.company.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {internship.company.name}
              </span>
              <h3 className="text-base font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors line-clamp-1 font-headline">
                {internship.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveToggle}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSaved
                ? 'text-[#ff9b00] bg-[#ff9b00]/10'
                : 'text-slate-400 hover:text-[#3f58b2] hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Spec Pill Strip */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(internship as any).work_setup && getSetupBadge((internship as any).work_setup)}
          <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200">
            {internship.field}
          </span>
          {internship.duration_weeks && (
            <span className="stamp-badge bg-slate-100 text-slate-700 border border-slate-200">
              {internship.duration_weeks} Weeks
            </span>
          )}
        </div>

        {/* Location & Allowance */}
        <div className="space-y-1.5 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{internship.location}</span>
          </div>
          {internship.is_paid ? (
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Coins className="w-3.5 h-3.5 text-[#ff9b00]" />
              <span>
                {(internship as any).compensation_details || ((internship as any).stipend_amount ? `${formatPesos((internship as any).stipend_amount)} / ${(internship as any).stipend_period || 'month'} stipend` : 'Paid Allowance')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              <span>Unpaid / School credit</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <DeadlineCountdown deadlineIso={internship.deadline || undefined} />

        <button
          type="button"
          onClick={handleApplyClick}
          className="px-4 py-2 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Apply</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
