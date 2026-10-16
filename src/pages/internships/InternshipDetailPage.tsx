import React, { useState } from 'react';
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Share2,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Target,
  Calendar,
  Check,
} from 'lucide-react';
import { useInternship, useCoaches, useSaveInternship, useUnsaveInternship, useSavedInternships } from '../../services/queries';
import { formatPesos } from '../../lib/utils';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { DeadlineCountdown } from '../../components/internships/DeadlineCountdown';
import { CoachCard } from '../../types/api';

// Safe list converter: if value is already an array, use it; if it is a string, split by newlines/bullets.
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

interface InternshipDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const InternshipDetailPage: React.FC<InternshipDetailPageProps> = ({ slug, navigate }) => {
  const { data: internship, isLoading, error } = useInternship(slug);
  const { data: coachesData } = useCoaches();
  const { data: savedList = [] } = useSavedInternships();

  const saveMutation = useSaveInternship();
  const unsaveMutation = useUnsaveInternship();

  const [isLeavingModalOpen, setIsLeavingModalOpen] = useState(false);
  const [selectedCoachForBooking, setSelectedCoachForBooking] = useState<CoachCard | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#3f58b2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-[#021F53]">Loading internship dossier...</p>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#021F53]">Internship Not Found</h2>
        <p className="text-xs text-slate-500">
          This role listing might have expired or been filled.
        </p>
        <button
          onClick={() => navigate('/internships')}
          className="px-6 py-2.5 bg-[#3f58b2] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#021F53]"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const isSaved = savedList.some((s) => s.id === internship.id);

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveMutation.mutate(internship.id);
    } else {
      saveMutation.mutate(internship.id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const coaches = coachesData?.items || [];
  const recommendedCoach =
    coaches.find((c) => c.slug === (internship as any).recommended_coach_slug) || coaches[0] || null;

  const logoUrl = internship.company.logo_url || (internship.company as any).logo || '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button */}
      <button
        onClick={() => navigate('/internships')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Internship Directory</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#3f58b2]/15 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={internship.company.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#021F53] text-white font-bold flex items-center justify-center text-xl flex-shrink-0">
                {internship.company.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/companies/${internship.company.slug}`)}
                  className="text-sm font-bold text-[#2c3f77] hover:text-[#3f58b2] transition-colors cursor-pointer"
                >
                  {internship.company.name}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-headline">
                {internship.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{internship.location}</span>
                </div>
                <span>•</span>
                <span className="capitalize">{internship.work_setup} Work Setup</span>
                {internship.duration_weeks && (
                  <>
                    <span>•</span>
                    <span>{internship.duration_weeks} Weeks Duration</span>
                  </>
                )}
                {(internship as any).ojt_hours && (
                  <>
                    <span>•</span>
                    <span>{(internship as any).ojt_hours} OJT Practicum Hours</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsLeavingModalOpen(true)}
              className="w-full sm:w-44 py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply on Company Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSaved
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-600' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Copy share link"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#f0f7ff]/70 border border-[#607ef2]/15">
          <div>
            <span className="text-[10px] text-[#2c3f77] uppercase tracking-wider font-bold block">
              Allowance &amp; Stipend
            </span>
            <span className="text-sm font-bold text-[#021F53] mt-0.5 block">
              {internship.is_paid
                ? internship.compensation_details || 'Paid Allowance'
                : 'Unpaid / For Credit'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#2c3f77] uppercase tracking-wider font-bold block">
              Application Deadline
            </span>
            <div className="mt-0.5">
              <DeadlineCountdown deadlineIso={internship.deadline || undefined} />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#2c3f77] uppercase tracking-wider font-bold block">
              Pillar Field
            </span>
            <span className="text-sm font-bold text-[#3f58b2] mt-0.5 block">
              {internship.field}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#2c3f77] uppercase tracking-wider font-bold block">
              Work Setup
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block mt-0.5 capitalize">
              {internship.work_setup}
            </span>
          </div>
        </div>
      </div>

      {/* Role Dossier Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          {internship.description && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                About the Role &amp; Team
              </h2>
              <p className="text-xs sm:text-sm text-[#2c3f77] leading-relaxed whitespace-pre-line">
                {internship.description}
              </p>
            </div>
          )}

          {/* Requirements (Safely parsed string via toList) */}
          {internship.requirements && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                Candidate Requirements
              </h2>
              <ul className="space-y-2.5">
                {toList(internship.requirements).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#3f58b2] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perks */}
          {internship.perks && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                Internship Perks &amp; Learning Opportunities
              </h2>
              <ul className="space-y-2.5">
                {toList(internship.perks).map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Apply Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-center">
            <h3 className="text-sm font-bold text-[#021F53] font-headline">Interested in this Role?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Applications are reviewed on a rolling basis. Ensure your resume and portfolio are updated before applying.
            </p>
            <button
              onClick={() => setIsLeavingModalOpen(true)}
              className="w-full py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply on Company Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cross-sell Coach */}
          {recommendedCoach && (
            <div className="bg-[#021F53] rounded-2xl p-6 text-white shadow-xs border border-[#3f58b2]/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#ff9b00]">
                <Target className="w-4 h-4 text-[#ff9b00]" />
                <span>Prepare for Technical Screening</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Book a 1-on-1 mock interview with <strong>{recommendedCoach.display_name}</strong> ({recommendedCoach.headline}) to practice coding and behavioral questions before applying.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCoachForBooking(recommendedCoach)}
                className="w-full py-2.5 bg-white text-[#021F53] hover:bg-[#f0f7ff] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#3f58b2]" />
                <span>Book 1-on-1 Practice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <LeavingSiteModal
        isOpen={isLeavingModalOpen}
        onClose={() => setIsLeavingModalOpen(false)}
        internship={internship}
        referrerSurface="detail"
      />

      <BookingDialog
        isOpen={!!selectedCoachForBooking}
        onClose={() => setSelectedCoachForBooking(null)}
        coach={selectedCoachForBooking as any}
      />
    </div>
  );
};
