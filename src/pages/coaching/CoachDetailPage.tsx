import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCoach, useCoachReviews } from '../../services/queries';
import { formatPHP, formatDate } from '../../lib/utils';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { useAuth } from '../../context/AuthContext';

interface CoachDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CoachDetailPage: React.FC<CoachDetailPageProps> = ({ slug, navigate }) => {
  const { role, user } = useAuth();
  const { data: coach, isLoading, error } = useCoach(slug);
  const { data: reviews = [] } = useCoachReviews(slug);

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#3f58b2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-[#021F53]">Loading coach profile...</p>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#021F53]">Coach Not Found</h2>
        <p className="text-xs text-slate-500">
          This coach profile might have been archived or does not exist.
        </p>
        <button
          onClick={() => navigate('/coaches')}
          className="px-6 py-2.5 bg-[#3f58b2] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#021F53]"
        >
          Back to Find a Coach
        </button>
      </div>
    );
  }

  const coachName = coach.display_name || (coach as any).name || 'Coach';
  const sessionTypes = coach.session_types || [];
  const ratingAvg = coach.rating_avg != null ? coach.rating_avg.toFixed(1) : 'New';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <button
        onClick={() => navigate('/coaches')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Find a Coach</span>
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#3f58b2]/15 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            {coach.avatar_url ? (
              <img
                src={coach.avatar_url}
                alt={coachName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#021F53] text-white font-bold flex items-center justify-center text-3xl flex-shrink-0">
                {coachName.charAt(0)}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-headline">
                {coachName}
              </h1>
              <p className="text-sm font-semibold text-[#3f58b2]">{coach.headline}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-[#ff9b00] text-[#ff9b00]" />
                  <span>{ratingAvg}</span>
                  <span className="text-slate-400 font-normal">({coach.rating_count} reviews)</span>
                </div>
                <span>•</span>
                <span className="capitalize">{coach.price_type === 'free' ? 'Free Mentorship' : 'Paid Sessions'}</span>
              </div>
            </div>
          </div>

          {role === 'coach' ? (
            user?.full_name === (coach.display_name || (coach as any).name) || slug === 'engr-mark-villanueva' ? (
              <button
                type="button"
                onClick={() => navigate('/coach')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#f0f7ff] hover:bg-[#3f58b2] hover:text-white text-[#3f58b2] font-bold text-sm rounded-xl border border-[#3f58b2]/20 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Manage in Coach Portal</span>
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#ff9b00]" />
              <span>Book a Session</span>
            </button>
          )}
        </div>

        {/* Expertise Tags */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] mb-3">
            Areas of Specialization
          </h4>
          <div className="flex flex-wrap gap-2">
            {(coach.expertise || []).map((exp, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h3 className="text-base font-bold text-[#021F53] font-headline">About {coachName}</h3>
          <p className="text-sm text-[#2c3f77] leading-relaxed max-w-4xl whitespace-pre-line">
            {coach.bio}
          </p>
        </div>
      </div>

      {/* Session Types Offerings */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#021F53] font-headline">
          Available Session Offerings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessionTypes.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-2xl p-6 border border-[#3f58b2]/10 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#607ef2]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-[#021F53]">
                    {formatPHP(st.price_centavos)}
                  </div>
                  {st.is_intro_call && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff9b00]/15 text-[#ff9b00] border border-[#ff9b00]/30">
                      Intro Call
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-[#021F53] font-headline">{st.name}</h4>
                <p className="text-xs text-[#2c3f77] leading-relaxed">
                  Dedicated {st.duration_minutes}-minute 1-on-1 career consultation
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{st.duration_minutes} mins</span>
                </span>
                {role !== 'coach' && (
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="px-4 py-2 bg-[#f0f7ff] hover:bg-[#3f58b2] hover:text-white text-[#3f58b2] font-bold text-xs rounded-xl border border-[#3f58b2]/20 transition-all cursor-pointer"
                  >
                    Book This
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Reviews Section (BR-011: First name only) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#021F53] font-headline">
              Student Reviews &amp; Ratings
            </h2>
            <span className="text-xs bg-[#f0f7ff] text-[#3f58b2] px-2.5 py-0.5 rounded-md font-bold">
              {reviews.length} Verified
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Public reviews display student first name only (BR-011)
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-xs text-slate-500">No reviews yet for this coach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#3f58b2]/10 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#ff9b00]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#ff9b00]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(rev.created_at)}</span>
                </div>
                {rev.body && (
                  <p className="text-xs text-[#2c3f77] leading-relaxed italic">
                    "{rev.body}"
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#021F53]">{rev.reviewer_first_name}</span>
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
        onBookingSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
