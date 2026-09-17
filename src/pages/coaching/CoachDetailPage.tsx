import React, { useState } from 'react';
import {
  Award,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { PayMongoModal } from '../../components/common/PayMongoModal';
import { formatPHP, formatDate } from '../../lib/utils';
import { Coach, Booking } from '../../types';

interface CoachDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CoachDetailPage: React.FC<CoachDetailPageProps> = ({ slug, navigate }) => {
  const { coaches, reviews } = useData();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activePayMongoBooking, setActivePayMongoBooking] = useState<Booking | null>(null);

  const coach = coaches.find((c) => c.slug === slug);

  if (!coach) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#021F53]">Coach Not Found</h2>
        <button
          onClick={() => navigate('/coaches')}
          className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold text-xs rounded-full"
        >
          Back to Coach Directory
        </button>
      </div>
    );
  }

  // Filter reviews for this coach
  const coachReviews = reviews.filter((r) => r.coachSlug === coach.slug);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <button
        onClick={() => navigate('/coaches')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Find a Coach</span>
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#3f58b2]/15 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="relative">
              <img
                src={coach.avatar}
                alt={coach.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white shadow-lg flex-shrink-0"
              />
              {coach.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#3f58b2] text-white rounded-full flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
                  {coach.name}
                </h1>
                {coach.isVerified && (
                  <span className="inline-flex items-center text-xs font-bold text-[#3f58b2] bg-[#f0f7ff] px-2 py-0.5 rounded-full border border-[#3f58b2]/20">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified Coach
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-[#607ef2]">{coach.headline}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-[#ff9b00] text-[#ff9b00]" />
                  <span>{coach.rating}</span>
                  <span className="text-slate-400 font-normal">({coach.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span>{coach.experienceYears}+ years experience</span>
                <span>•</span>
                <span>{coach.location}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book a Session</span>
          </button>
        </div>

        {/* Expertise Tags */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] mb-3">
            Areas of Specialization
          </h4>
          <div className="flex flex-wrap gap-2">
            {coach.expertise.map((exp, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h3 className="text-base font-bold text-[#021F53] font-headline">About {coach.name}</h3>
          <p className="text-sm text-[#2c3f77] leading-relaxed max-w-4xl">
            {coach.bio}
          </p>
        </div>
      </div>

      {/* Session Types Offerings */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#021F53] font-display">
          Available Session Offerings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coach.sessionTypes.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-3xl p-6 border border-[#3f58b2]/10 shadow-soft flex flex-col justify-between space-y-4 hover:border-[#607ef2]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-[#021F53]">
                    {formatPHP(st.priceCentavos)}
                  </div>
                  {st.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff9b00]/15 text-[#ff9b00] border border-[#ff9b00]/30">
                      {st.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-[#021F53] font-headline">{st.name}</h4>
                <p className="text-xs text-[#2c3f77] leading-relaxed">{st.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{st.durationMinutes} mins</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="px-4 py-2 bg-[#f0f7ff] hover:bg-[#3f58b2] hover:text-white text-[#3f58b2] font-bold text-xs rounded-full border border-[#3f58b2]/20 transition-all"
                >
                  Book This
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Reviews Section (BR-011: First name only) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#021F53] font-display">
              Student Reviews & Ratings
            </h2>
            <span className="text-xs bg-[#f0f7ff] text-[#3f58b2] px-2.5 py-0.5 rounded-full font-bold">
              {coachReviews.length} Verified
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            BR-011: Public reviews show student first name only
          </span>
        </div>

        {coachReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <p className="text-xs text-slate-500">No reviews yet for this coach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coachReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-[#3f58b2]/10 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#ff9b00]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#ff9b00]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(rev.date)}</span>
                </div>
                <p className="text-xs text-[#2c3f77] leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#021F53]">{rev.studentFirstName}</span>
                  <span className="text-[11px] text-[#607ef2]">{rev.sessionTypeName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookingDialog
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        coach={coach}
        onOpenPayMongo={(b) => setActivePayMongoBooking(b)}
        onBookingSuccess={() => navigate('/app/bookings')}
      />

      <PayMongoModal
        isOpen={!!activePayMongoBooking}
        onClose={() => setActivePayMongoBooking(null)}
        booking={activePayMongoBooking}
        onSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
