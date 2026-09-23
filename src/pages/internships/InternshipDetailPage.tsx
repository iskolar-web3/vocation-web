import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Bookmark,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Share2,
  Coins,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useInternship, useSavedInternships, useSaveInternship, useUnsaveInternship, useCoaches } from '../../services/queries';
import { DeadlineCountdown } from '../../components/internships/DeadlineCountdown';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { formatPesos } from '../../lib/utils';
import { CoachCard as CoachCardType, CoachDetail } from '../../types/api';
import { useAuth } from '../../context/AuthContext';

interface InternshipDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const InternshipDetailPage: React.FC<InternshipDetailPageProps> = ({ slug, navigate }) => {
  const { isAuthenticated } = useAuth();
  const { data: internship, isLoading, error } = useInternship(slug);
  const { data: savedList = [] } = useSavedInternships();
  const saveMutation = useSaveInternship();
  const unsaveMutation = useUnsaveInternship();
  const { data: coachesData } = useCoaches();

  const [isLeavingModalOpen, setIsLeavingModalOpen] = useState(false);
  const [selectedCoachForBooking, setSelectedCoachForBooking] = useState<CoachCardType | CoachDetail | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2] mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading internship details...</p>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#021F53]">Internship Not Found</h2>
        <p className="text-sm text-slate-500">
          This listing may have been closed, withdrawn, or does not exist (BR-003, BR-006).
        </p>
        <button
          type="button"
          onClick={() => navigate('/internships')}
          className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold text-xs rounded-full hover:bg-[#021F53] cursor-pointer"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const isSaved = savedList.some((item) => item.id === internship.id);

  const handleToggleSave = () => {
    if (!isAuthenticated) return;
    if (isSaved) {
      unsaveMutation.mutate(internship.id);
    } else {
      saveMutation.mutate(internship.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const coaches = coachesData?.items || [];
  const recommendedCoach =
    coaches.find((c) => c.slug === internship.recommended_coach_slug) || coaches[0] || null;

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
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#3f58b2]/15 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <img
              src={logoUrl}
              alt={internship.company.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-md flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/companies/${internship.company.slug}`)}
                  className="text-sm font-bold text-[#2c3f77] hover:text-[#3f58b2] transition-colors cursor-pointer"
                >
                  {internship.company.name}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
                {internship.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{internship.location}</span>
                </div>
                <span>•</span>
                <span className="capitalize">{internship.work_setup} Work Setup</span>
                <span>•</span>
                <span>{internship.duration_weeks} Weeks Duration</span>
                {internship.ojt_hours && (
                  <>
                    <span>•</span>
                    <span>{internship.ojt_hours} OJT Practicum Hours</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsLeavingModalOpen(true)}
              className="flex-1 sm:flex-none w-full px-8 py-3.5 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply on Company Site</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`flex-1 py-2.5 px-4 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSaved
                    ? 'bg-[#f0f7ff] text-[#3f58b2] border-[#3f58b2]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#3f58b2]' : ''}`} />
                <span>{isSaved ? 'Saved Role' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Copy share link"
              >
                <Share2 className="w-4 h-4" />
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
              {internship.is_paid && internship.stipend_amount
                ? `${formatPesos(internship.stipend_amount)} / ${internship.stipend_period || 'month'}`
                : 'Unpaid / For Credit'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#2c3f77] uppercase tracking-wider font-bold block">
              Application Deadline
            </span>
            <div className="mt-0.5">
              <DeadlineCountdown deadlineIso={internship.deadline} />
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
              Status
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5 capitalize">
              {internship.status}
            </span>
          </div>
        </div>
      </div>

      {/* Role Dossier Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          {internship.description && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                About the Role &amp; Team
              </h2>
              <p className="text-xs sm:text-sm text-[#2c3f77] leading-relaxed whitespace-pre-line">
                {internship.description}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {(internship.responsibilities || []).length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                What You Will Do
              </h2>
              <ul className="space-y-2.5">
                {internship.responsibilities.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {(internship.requirements || []).length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#021F53] font-headline">
                What They Are Looking For
              </h2>
              <ul className="space-y-2.5">
                {internship.requirements.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#3f58b2] shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar: Recommended Coach & Outbound Notice */}
        <div className="lg:col-span-4 space-y-6">
          {/* Outbound Notice (BR-001) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-[#021F53] font-headline">
              Official Outbound Gateway (BR-001)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              iSkolar Vocation maintains zero student resumes on its servers. You will apply directly on {internship.company.name}'s careers site.
            </p>
            <button
              type="button"
              onClick={() => setIsLeavingModalOpen(true)}
              className="w-full py-3 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Apply Directly</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cross-sell Coach */}
          {recommendedCoach && (
            <div className="bg-gradient-to-br from-[#021F53] to-[#3f58b2] rounded-3xl p-6 text-white shadow-soft space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#ff9b00]">
                <Sparkles className="w-4 h-4" />
                <span>Prepare for Technical Screening</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Book a 1-on-1 mock interview with <strong>{recommendedCoach.name}</strong> ({recommendedCoach.headline}) to practice coding and behavioral questions before applying.
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
      />

      <BookingDialog
        isOpen={!!selectedCoachForBooking}
        onClose={() => setSelectedCoachForBooking(null)}
        coach={selectedCoachForBooking}
        onBookingSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
