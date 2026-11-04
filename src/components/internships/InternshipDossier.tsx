import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Coins,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Share2,
  Calendar,
  Target,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { InternshipCard, InternshipDetail, CoachCard } from '../../types/api';
import { formatPesos, formatDate, getTimeRemaining } from '../../lib/utils';
import { useSaveInternship, useUnsaveInternship, useSavedInternships, useCoaches } from '../../services/queries';
import { toast } from 'sonner';

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
    toast.success('Link copied to clipboard!');
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
  const requirements = toList(detail.requirements);
  const responsibilities = toList((detail as any).responsibilities);
  const perks = toList(detail.perks);
  const description = detail.description || '';
  const logoUrl = internship.company.logo_url || (internship.company as any).logo || '';

  const allowanceDisplay = internship.is_paid
    ? (internship as any).compensation_details ||
      ((internship as any).stipend_amount
        ? `${formatPesos((internship as any).stipend_amount)} / ${(internship as any).stipend_period || 'mo'}`
        : 'Paid Allowance')
    : 'pay_not_stated' in internship && internship.pay_not_stated
      ? 'Pay not stated'
      : 'School Credit';

  const ojtHoursDisplay = (internship as any).ojt_hours
    ? `${(internship as any).ojt_hours} Practicum Hours`
    : internship.duration_weeks
    ? `${internship.duration_weeks} Weeks Duration`
    : 'Full Academic Credit';

  const workSetup = (internship as any).work_setup || 'Internship';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Pinned Executive Header */}
      <div className="shrink-0 bg-[#021F53] text-white p-5 sm:p-6 border-b border-[#3f58b2]/30 space-y-4">
        {/* Top Company Info & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={internship.company.name}
                className="w-12 h-12 rounded-xl object-cover bg-white border border-white/20 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#2563eb] text-white font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
                {internship.company.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {navigate ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/companies/${internship.company.slug}`)}
                    className="text-xs font-bold text-[#93c5fd] hover:text-white uppercase tracking-wider inline-flex items-center gap-1 transition-colors cursor-pointer group truncate"
                    title={`View ${internship.company.name} profile`}
                  >
                    <span className="truncate">{internship.company.name}</span>
                    <span className="text-[10px] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform">↗</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#93c5fd] uppercase tracking-wider truncate">
                    {internship.company.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-[#60a5fa]" />
                  <span>Verified</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-headline text-white leading-tight truncate mt-0.5">
                {internship.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy direct posting link"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#93c5fd]" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleToggleSave}
              title="Save role to checklist"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSaved ? 'bg-[#2563eb] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

          </div>
        </div>

        {/* Primary Outbound Action Bar */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => onApplyOutbound(internship)}
            className="tactile-btn-primary w-full py-3 px-4 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
          >
            <span>Proceed to Official Company Portal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-300 text-center leading-tight">
            Direct apply on <strong>{internship.company.name}</strong>'s portal • No intermediate student data stored
          </p>
        </div>
      </div>

      {/* Dossier Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* 4-Metric Practicum Matrix */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#f8fbff] border border-[#dbeafe] space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Allowance</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#021F53] truncate" title={allowanceDisplay}>
              {allowanceDisplay}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fbff] border border-[#dbeafe] space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Practicum Credit</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#021F53] truncate" title={ojtHoursDisplay}>
              {ojtHoursDisplay}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fbff] border border-[#dbeafe] space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Setup &amp; Location</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#021F53] truncate capitalize" title={`${workSetup} · ${internship.location}`}>
              {workSetup} · {internship.location}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fbff] border border-[#dbeafe] space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Intake Deadline</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#021F53] truncate" title={formatDate(internship.deadline || '')}>
              {internship.deadline ? formatDate(internship.deadline) : 'Rolling Intake'}
            </div>
          </div>
        </div>

        {/* Role Overview */}
        {description && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
              Role Overview
            </h3>
            <p className="text-xs sm:text-sm text-[#2c3f77] leading-relaxed whitespace-pre-line font-body">
              {description}
            </p>
          </div>
        )}

        {/* Key Responsibilities */}
        {responsibilities.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
              Key Responsibilities
            </h3>
            <ul className="space-y-2">
              {responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb] mt-1.5 shrink-0" />
                  <span className="leading-relaxed flex-1 break-words">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
              Candidate Requirements
            </h3>
            <ul className="space-y-2">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#2563eb] mt-0.5 shrink-0" />
                  <span className="leading-relaxed flex-1 break-words">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Learning Opportunities (Spacious, No Overlap) */}
        {perks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#021F53] font-headline">
                Perks &amp; Learning Opportunities
              </h3>
              <span className="text-[10px] font-bold text-[#1d4ed8] bg-[#f0f7ff] px-2 py-0.5 rounded-md border border-[#3f58b2]/20">
                {perks.length} Benefits
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {perks.map((perk, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8fbff] p-3 rounded-xl border border-[#dbeafe] flex items-start gap-2.5 text-xs text-slate-700 shadow-2xs hover:border-[#3f58b2]/40 transition-colors"
                >
                  <div className="w-5 h-5 rounded-md bg-white border border-[#3f58b2]/20 text-[#2563eb] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 text-[#2563eb]" />
                  </div>
                  <span className="font-semibold text-[#021F53] leading-snug break-words flex-1">
                    {perk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentorship Match Card */}
        {matchingCoaches.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3 pb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#021F53]">
              <Target className="w-4 h-4 text-[#2563eb]" />
              <span>Need Mock Interview Prep?</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Book a 1-on-1 mock interview with industry mentors specializing in <strong>{internship.field}</strong>:
            </p>
            <div className="space-y-2">
              {matchingCoaches.map((c) => (
                <div
                  key={c.slug}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {c.avatar_url ? (
                      <img
                        src={c.avatar_url}
                        alt={c.display_name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#021F53] text-white font-bold flex items-center justify-center text-xs shrink-0">
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
                      className="px-3.5 py-1.5 bg-[#021F53] hover:bg-[#2563eb] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Book 1-on-1
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
