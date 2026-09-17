import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Banknote,
  Clock,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Share2,
  Award,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DeadlineCountdown } from '../../components/internships/DeadlineCountdown';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { PayMongoModal } from '../../components/common/PayMongoModal';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { formatPesos } from '../../lib/utils';
import { Booking, Coach } from '../../types';

interface InternshipDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const InternshipDetailPage: React.FC<InternshipDetailPageProps> = ({ slug, navigate }) => {
  const { internships, coaches, isInternshipSaved, toggleSaveInternship } = useData();

  const [isLeavingModalOpen, setIsLeavingModalOpen] = useState(false);
  const [selectedCoachForBooking, setSelectedCoachForBooking] = useState<Coach | null>(null);
  const [activePayMongoBooking, setActivePayMongoBooking] = useState<Booking | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const internship = internships.find((i) => i.slug === slug);

  if (!internship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#021F53]">Internship Not Found</h2>
        <p className="text-sm text-slate-500">
          This listing may have been withdrawn or expired (BR-003, BR-006).
        </p>
        <button
          onClick={() => navigate('/internships')}
          className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold text-xs rounded-full hover:bg-[#021F53]"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const isSaved = isInternshipSaved(internship.id);

  // Cross-sold coach matching the role's field or recommendation
  const recommendedCoach =
    coaches.find((c) => c.slug === internship.recommendedCoachSlug) || coaches[0];

  // Related internships from same field
  const relatedRoles = internships
    .filter((i) => i.id !== internship.id && i.field === internship.field && i.status === 'open')
    .slice(0, 2);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button */}
      <button
        onClick={() => navigate('/internships')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Internship Directory</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#3f58b2]/15 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <img
              src={internship.company.logo}
              alt={internship.company.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-md flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/companies/${internship.company.slug}`)}
                  className="text-sm font-bold text-[#2c3f77] hover:text-[#3f58b2] transition-colors"
                >
                  {internship.company.name}
                </button>
                {internship.company.isVerified && (
                  <span className="inline-flex items-center text-xs font-bold text-[#3f58b2] bg-[#f0f7ff] px-2 py-0.5 rounded-full border border-[#3f58b2]/20">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5 text-[#3f58b2]" /> Verified Employer
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
                {internship.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{internship.company.location}</span>
                </span>
                <span>•</span>
                <span className="capitalize font-medium text-slate-700">{internship.workSetup} Setup</span>
                <span>•</span>
                <DeadlineCountdown deadline={internship.deadline} />
              </div>
            </div>
          </div>

          {/* Top Actions: Save & Share */}
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button
              onClick={handleShare}
              className="p-3 rounded-full border border-slate-200 text-slate-500 hover:text-[#3f58b2] hover:bg-[#f0f7ff] transition-all"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSaveInternship(internship.id)}
              className={`p-3 rounded-full border transition-all ${
                isSaved
                  ? 'bg-amber-100 text-[#ff9b00] border-amber-300'
                  : 'border-slate-200 text-slate-500 hover:text-[#ff9b00] hover:bg-[#f0f7ff]'
              }`}
              title={isSaved ? 'Saved to bookmarks' : 'Save internship'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#ff9b00]' : ''}`} />
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center font-bold">
            ✓ Link copied to clipboard!
          </div>
        )}

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/15 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Allowance</span>
            <span className="font-bold text-sm text-[#021F53]">
              {internship.isPaid && internship.stipendAmount
                ? `${formatPesos(internship.stipendAmount)}/mo`
                : 'Unpaid'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">OJT Credit</span>
            <span className="font-bold text-sm text-[#021F53]">
              {internship.ojtHours ? `${internship.ojtHours} Hours` : 'Flexible'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Duration</span>
            <span className="font-bold text-sm text-[#021F53]">
              {internship.durationWeeks} Weeks
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Discipline</span>
            <span className="font-bold text-sm text-[#3f58b2]">
              {internship.field}
            </span>
          </div>
        </div>

        {/* Primary Outbound CTA Button (BR-001) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Apply on Official Company Portal
            </h4>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Zero applications are stored on iSkolar. You will be redirected to {internship.company.name}'s careers site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLeavingModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Apply Now (Outbound)</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-[#021F53] font-headline">
              About the Role
            </h3>
            <p className="text-sm text-[#2c3f77] leading-relaxed">
              {internship.description}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-[#021F53] font-headline">
              Key Responsibilities
            </h3>
            <ul className="space-y-2.5 text-sm text-[#2c3f77]">
              {internship.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#3f58b2] flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-[#021F53] font-headline">
              Candidate Requirements
            </h3>
            <ul className="space-y-2.5 text-sm text-[#2c3f77]">
              {internship.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff9b00] flex-shrink-0 mt-2" />
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Perks & Benefits */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-[#021F53] font-headline">
              Student Perks & Benefits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {internship.perks.map((perk, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#f0f7ff] rounded-2xl border border-[#607ef2]/15 text-xs text-[#021F53] font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#ff9b00] flex-shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Cross-sell Coach & Company Profile */}
        <div className="lg:col-span-4 space-y-6">
          {/* Matched Coach Cross-sell Widget */}
          {recommendedCoach && (
            <div className="bg-gradient-to-br from-[#021F53] to-[#3f58b2] rounded-3xl p-6 text-white shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
                  Interview Prep Cross-Sell
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  ★ {recommendedCoach.rating}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold font-headline">
                  Prepare for this role with {recommendedCoach.name}
                </h4>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Book a 1-on-1 mock interview or resume review tailored specifically for {internship.company.name} and {internship.field} positions.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15">
                <img
                  src={recommendedCoach.avatar}
                  alt={recommendedCoach.name}
                  className="w-10 h-10 rounded-xl object-cover border border-white"
                />
                <div className="text-xs min-w-0">
                  <div className="font-bold truncate">{recommendedCoach.name}</div>
                  <div className="text-[11px] text-slate-300 truncate">{recommendedCoach.headline}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCoachForBooking(recommendedCoach)}
                className="w-full py-3 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Book 1-on-1 Prep Session</span>
              </button>
            </div>
          )}

          {/* Company Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3f58b2]">
              About the Employer
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={internship.company.logo}
                alt={internship.company.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
              />
              <div>
                <h5 className="font-bold text-sm text-[#021F53]">{internship.company.name}</h5>
                <p className="text-xs text-slate-500">{internship.company.industry}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/companies/${internship.company.slug}`)}
              className="w-full py-2.5 bg-[#f0f7ff] hover:bg-[#e0efff] text-[#3f58b2] font-bold text-xs rounded-2xl border border-[#3f58b2]/20 transition-all text-center"
            >
              View Company Profile & All Roles
            </button>
          </div>
        </div>
      </div>

      {/* Related Roles */}
      {relatedRoles.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-[#021F53] font-display">
            Similar {internship.field} Internships
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedRoles.map((role) => (
              <InternshipCard
                key={role.id}
                internship={role}
                onSelect={() => navigate(`/internships/${role.slug}`)}
                onApply={() => setIsLeavingModalOpen(true)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Outbound Departure Modal (BR-001) */}
      <LeavingSiteModal
        isOpen={isLeavingModalOpen}
        onClose={() => setIsLeavingModalOpen(false)}
        internship={internship}
      />

      {/* Booking Dialog */}
      <BookingDialog
        isOpen={!!selectedCoachForBooking}
        onClose={() => setSelectedCoachForBooking(null)}
        coach={selectedCoachForBooking}
        onOpenPayMongo={(b) => setActivePayMongoBooking(b)}
        onBookingSuccess={() => navigate('/app/bookings')}
      />

      {/* PayMongo Modal */}
      <PayMongoModal
        isOpen={!!activePayMongoBooking}
        onClose={() => setActivePayMongoBooking(null)}
        booking={activePayMongoBooking}
        onSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
