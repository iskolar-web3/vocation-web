import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Share2,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  Briefcase,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Internship, Coach } from '../../types';
import { formatPesos, formatDate, getTimeRemaining } from '../../lib/utils';
import { useData } from '../../context/DataContext';

interface InternshipDossierProps {
  internship: Internship;
  onApply: (internship: Internship) => void;
  onBookCoach?: (coach: Coach) => void;
  isCompact?: boolean;
}

export const InternshipDossier: React.FC<InternshipDossierProps> = ({
  internship,
  onApply,
  onBookCoach,
  isCompact = false,
}) => {
  const { coaches } = useData();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { days, isExpired } = getTimeRemaining(internship.deadline);

  // Find coaches specialized in this internship's field
  const matchingCoaches = coaches
    .filter((c) =>
      c.expertise.some(
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
              {internship.isPaid ? (
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
                onClick={() => setIsSaved(!isSaved)}
                title="Save role to checklist"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSaved ? 'bg-[#ff9b00] text-[#021F53]' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug">
              {internship.title}
            </h2>
            <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm">
              <span className="font-semibold text-white">{internship.company.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#ff9b00]" />
                {internship.company.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dossier Body Content */}
      <div className="p-6 pt-0 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Compensation</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-700 block mt-0.5">
              {internship.isPaid && internship.stipendAmount ? formatPesos(internship.stipendAmount) + '/mo' : 'For Academic Credit'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">OJT Credit</span>
            <span className="text-xs sm:text-sm font-bold text-[#3f58b2] block mt-0.5">
              {internship.ojtHours ? `${internship.ojtHours} hrs verified` : 'CHED Accredited'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Work Setup</span>
            <span className="text-xs sm:text-sm font-bold text-[#021F53] block mt-0.5 capitalize">
              {internship.workSetup}
            </span>
          </div>
        </div>

        {/* Role Overview */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Role Overview</h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {internship.description}
          </p>
        </div>

        {/* Requirements & Competencies */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Candidate Requirements</h4>
          <div className="space-y-1.5">
            {internship.requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3f58b2] flex-shrink-0 mt-0.5" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status & Deadline Strip */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <Calendar className="w-4 h-4 text-[#ff9b00] flex-shrink-0" />
            <span>
              {isExpired
                ? 'Application closed'
                : `Deadline: ${formatDate(internship.deadline)} (${days}d left)`}
            </span>
          </div>
          <span className="font-bold text-[#021F53] uppercase tracking-wider text-[10px] bg-white px-2 py-0.5 rounded-md border border-amber-200">
            Outbound Direct
          </span>
        </div>

        {/* Outbound Action CTA (BR-001) */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => onApply(internship)}
            disabled={isExpired}
            className="w-full py-3.5 px-6 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-sm rounded-2xl transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span>Apply Directly on Company Portal</span>
            <ExternalLink className="w-4 h-4 text-[#ff9b00] group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="text-[11px] text-center text-slate-600">
            Zero files stored on iSkolar. You will be redirected safely with click tracking.
          </p>
        </div>

        {/* Paired Coach Matcher Strip */}
        {matchingCoaches.length > 0 && onBookCoach && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#021F53] flex items-center gap-1.5 font-headline">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9b00]" />
                <span>Prepare for this Interview</span>
              </span>
              <span className="text-[11px] text-slate-600">Verified Practitioners</span>
            </div>

            <div className="space-y-2">
              {matchingCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-[#3f58b2]/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{coach.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3f58b2] flex-shrink-0" />
                      </div>
                      <span className="text-[11px] text-slate-600 truncate block">
                        {coach.currentRole} at {coach.company}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onBookCoach(coach)}
                    className="px-3 py-1.5 bg-white hover:bg-[#3f58b2] hover:text-white text-[#021F53] font-bold text-xs rounded-xl border border-slate-200 hover:border-transparent transition-all shadow-2xs flex-shrink-0 cursor-pointer"
                  >
                    Book Practice
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
