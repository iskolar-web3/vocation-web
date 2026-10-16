import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Coins,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Share2,
  Calendar,
  Target,
  Copy,
  Check,
} from 'lucide-react';
import { InternshipCard, InternshipDetail, CoachCard } from '../../types/api';
import { formatPesos, formatDate, getTimeRemaining } from '../../lib/utils';
import { useSaveInternship, useUnsaveInternship, useSavedInternships, useCoaches } from '../../services/queries';

interface InternshipDossierProps {
  internship: InternshipCard | InternshipDetail;
  onApplyOutbound: (internship: InternshipCard | InternshipDetail) => void;
  onBookCoach?: (coach: CoachCard) => void;
  navigate?: (path: string) => void;
}

export const InternshipDossier: React.FC<InternshipDossierProps> = ({
  internship,
  onApplyOutbound,
  onBookCoach,
  navigate,
}) => {
  const { data: savedList = [] } = useSavedInternships();
  const saveMutation = useSaveInternship();
  const unsaveMutation = useUnsaveInternship();
  const { data: coachesData } = useCoaches();

  const [copiedLink, setCopiedLink] = useState(false);

  const isSaved = savedList.some((item) => item.id === internship.id);
  const { days, isExpired } = getTimeRemaining(internship.deadline || '');

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
    if (isSaved) {
      unsaveMutation.mutate(internship.id);
    } else {
      saveMutation.mutate(internship.id);
    }
  };

  const toList = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') {
      return val
        .split(/\r?\n|•|\*|;/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return [];
  };

  const detail = internship as Partial<InternshipDetail>;
  const responsibilities = toList((detail as any).responsibilities);
  const requirements = toList(detail.requirements);
  const perks = toList(detail.perks);
  const description = detail.description || '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden sticky top-24 space-y-6">
      {/* Dossier Header Banner */}
      <div className="bg-[#021F53] text-white p-6 relative overflow-hidden border-b border-[#3f58b2]/30">
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
            <h2 className="text-xl sm:text-2xl font-bold font-headline leading-tight">
              {internship.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Setup</span>
              <span className="font-bold capitalize">{(internship as any).work_setup || 'Internship'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Duration</span>
              <span className="font-bold">{internship.duration_weeks ? `${internship.duration_weeks} Wks` : 'Flexible'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Allowance</span>
              <span className="font-bold text-[#ff9b00]">
                {internship.is_paid
                  ? (internship as any).compensation_details || 'Paid'
                  : 'Unpaid'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Deadline</span>
              <span className="font-bold">{formatDate(internship.deadline || '')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Outbound Application Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <ExternalLink className="w-4 h-4 text-[#ff9b00]" />
            <span>Outbound Official Application</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            iSkolar Vocation directs you directly to <strong>{internship.company.name}</strong>'s official portal. We do not store or intermediate student resumes.
          </p>
          <button
            type="button"
            onClick={() => onApplyOutbound(internship)}
            className="w-full mt-2 py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Company Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Role Overview */}
        {description && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Role Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* Key Responsibilities */}
        {responsibilities.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Key Responsibilities
            </h3>
            <ul className="space-y-1.5">
              {responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f58b2] mt-1.5 shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Candidate Requirements
            </h3>
            <ul className="space-y-1.5">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Mentorship */}
        {perks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Perks &amp; Learning
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {perks.map((perk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20"
                >
                  ✓ {perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Sell Mentorship Widget */}
        {matchingCoaches.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3 pb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#021F53]">
              <Target className="w-3.5 h-3.5 text-[#3f58b2]" />
              <span>Need Mock Interview Prep?</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Book a 1-on-1 mock interview with industry mentors specializing in {internship.field}:
            </p>
            <div className="space-y-2">
              {matchingCoaches.map((c) => (
                <div
                  key={c.slug}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {c.avatar_url ? (
                      <img
                        src={c.avatar_url}
                        alt={c.display_name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#021F53] text-white font-bold flex items-center justify-center text-xs">
                        {c.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#021F53] truncate block">{c.display_name}</span>
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
