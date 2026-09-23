import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Coins,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
} from 'lucide-react';
import { InternshipCard as InternshipCardType, InternshipDetail, CoachCard as CoachCardType, CoachDetail } from '../../types/api';
import { formatPesos, formatDate, getTimeRemaining } from '../../lib/utils';
import { useSavedInternships, useSaveInternship, useUnsaveInternship, useCoaches } from '../../services/queries';
import { useAuth } from '../../context/AuthContext';

interface InternshipDossierProps {
  internship: InternshipDetail | InternshipCardType;
  onApply: (internship: InternshipDetail | InternshipCardType) => void;
  onBookCoach?: (coach: CoachCardType | CoachDetail) => void;
  isCompact?: boolean;
}

export const InternshipDossier: React.FC<InternshipDossierProps> = ({
  internship,
  onApply,
  onBookCoach,
  isCompact = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { data: savedList = [] } = useSavedInternships();
  const saveMutation = useSaveInternship();
  const unsaveMutation = useUnsaveInternship();
  const { data: coachesData } = useCoaches();

  const [copiedLink, setCopiedLink] = useState(false);

  const isSaved = savedList.some((item) => item.id === internship.id);
  const { days, isExpired } = getTimeRemaining(internship.deadline);

  // Find coaches specialized in this internship's field
  const coaches = coachesData?.items || [];
  const matchingCoaches = coaches
    .filter((c) =>
      (c.expertise || []).some(
        (exp: string) =>
          exp.toLowerCase().includes(internship.field.toLowerCase()) ||
          internship.field.toLowerCase().includes(exp.toLowerCase())
      )
    )
    .slice(0, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleSave = () => {
    if (!isAuthenticated) return;
    if (isSaved) {
      unsaveMutation.mutate(internship.id);
    } else {
      saveMutation.mutate(internship.id);
    }
  };

  const detail = internship as Partial<InternshipDetail>;
  const responsibilities = detail.responsibilities || [];
  const requirements = detail.requirements || [];
  const perks = detail.perks || [];
  const description = detail.description || '';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden sticky top-24 space-y-6">
      {/* Dossier Header Banner */}
      <div className="bg-gradient-to-r from-[#021F53] to-[#3f58b2] text-white p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="stamp-badge bg-white/15 text-[#ff9b00] border border-white/20">
                {internship.field}
              </span>
              {internship.is_paid ? (
                <span className="stamp-badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Paid Allowance
                </span>
              ) : (
                <span className="stamp-badge bg-slate-500/20 text-slate-300 border border-slate-400/30">
                  Unpaid / For Credit
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy direct posting link"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                title="Save role to checklist"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSaved ? 'bg-[#ff9b00] text-[#021F53]' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {internship.company.name}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight">
              {internship.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Setup</span>
              <span className="font-bold capitalize">{internship.work_setup}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Duration</span>
              <span className="font-bold">{internship.duration_weeks} Weeks</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Allowance</span>
              <span className="font-bold text-[#ff9b00]">
                {internship.is_paid && internship.stipend_amount
                  ? `${formatPesos(internship.stipend_amount)}/${internship.stipend_period || 'mo'}`
                  : 'Unpaid'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Deadline</span>
              <span className="font-bold">{formatDate(internship.deadline)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Outbound CTA Box (BR-001, BR-002: outbound application notice) */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-950 block">Official Application Gateway</span>
            <span className="text-[11px] text-amber-900 leading-relaxed block">
              Apply directly on {internship.company.name}'s careers portal. iSkolar stores 0 student resumes.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onApply(internship)}
            className="px-6 py-3 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>Apply on Company Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Description & Requirements */}
        {description && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
              Role Overview
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {responsibilities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
              Key Responsibilities
            </h4>
            <ul className="space-y-1.5">
              {responsibilities.map((resp, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {requirements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
              Qualifications &amp; Requirements
            </h4>
            <ul className="space-y-1.5">
              {requirements.map((req, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f58b2] shrink-0 mt-1.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cross-sell 1-on-1 Mentorship */}
        {matchingCoaches.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3f58b2]">
              <Sparkles className="w-4 h-4 text-[#ff9b00]" />
              <span>Prepare for {internship.company.name}'s Interview</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Book a 1-on-1 mock interview with industry mentors specializing in {internship.field}:
            </p>
            <div className="space-y-2">
              {matchingCoaches.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={c.avatar_url}
                      alt={c.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#021F53] truncate block">{c.name}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{c.headline}</span>
                    </div>
                  </div>
                  {onBookCoach && (
                    <button
                      type="button"
                      onClick={() => onBookCoach(c)}
                      className="px-3 py-1 bg-[#021F53] text-white text-[11px] font-bold rounded-lg hover:bg-[#3f58b2] transition-colors cursor-pointer"
                    >
                      Book
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
