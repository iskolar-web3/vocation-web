import React from 'react';
import { Star, Calendar } from 'lucide-react';
import { CoachCard as CoachCardType, CoachDetail } from '../../types/api';
import { formatPHP } from '../../lib/utils';

interface CoachCardProps {
  coach: CoachCardType | CoachDetail;
  onSelect: (coach: CoachCardType | CoachDetail) => void;
  onBook: (coach: CoachCardType | CoachDetail) => void;
  layout?: 'grid' | 'row';
}

export const CoachCard: React.FC<CoachCardProps> = ({
  coach,
  onSelect,
  onBook,
  layout = 'grid',
}) => {
  const sessionTypes = coach.session_types || [];
  const hasFreeSession = sessionTypes.some((st) => st.price_centavos === 0);

  if (layout === 'row') {
    return (
      <div
        onClick={() => onSelect(coach)}
        className="stream-row rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-[#3f58b2]/40 hover:shadow-soft transition-all"
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={coach.avatar_url}
              alt={coach.name}
              className="w-13 h-13 rounded-2xl object-cover border border-slate-200/80 bg-white"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#021F53] font-headline hover:text-[#3f58b2] transition-colors">
                {coach.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-950">
                <Star className="w-3 h-3 fill-[#ff9b00] text-[#ff9b00]" />
                <span>{coach.rating}</span>
                <span className="text-slate-500 font-normal">({coach.review_count})</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-[#3f58b2] truncate">
              {coach.headline} · {coach.company}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(coach.expertise || []).slice(0, 3).map((exp, idx) => (
                <span
                  key={idx}
                  className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20 text-[10px] py-0 px-2"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Session Rate
            </span>
            <span className="font-bold text-sm text-[#021F53]">
              {hasFreeSession ? 'Free 15-min Intro' : formatPHP(coach.starting_price_centavos)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook(coach);
            }}
            className="px-4 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Book 1-on-1</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      onClick={() => onSelect(coach)}
      className="tactile-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0">
            <img
              src={coach.avatar_url}
              alt={coach.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-white group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="text-base font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors truncate font-headline">
                {coach.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold text-amber-950 flex-shrink-0">
                <Star className="w-3 h-3 fill-[#ff9b00] text-[#ff9b00]" />
                <span>{coach.rating}</span>
                <span className="text-slate-500 font-normal text-[10px]">({coach.review_count})</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-[#3f58b2] mt-0.5 truncate">
              {coach.headline}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {coach.experience_years}+ yrs exp · {coach.location}
            </p>
          </div>
        </div>

        {/* Bio Excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {coach.bio}
        </p>

        {/* Expertise Stamps */}
        <div className="flex flex-wrap gap-1.5">
          {(coach.expertise || []).slice(0, 3).map((exp, idx) => (
            <span
              key={idx}
              className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20"
            >
              {exp}
            </span>
          ))}
          {coach.expertise && coach.expertise.length > 3 && (
            <span className="stamp-badge bg-slate-100 text-slate-600 border border-slate-200">
              +{coach.expertise.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
            Session Rate
          </span>
          <span className="font-bold text-sm text-[#021F53]">
            {hasFreeSession ? 'Free 15-min Intro' : formatPHP(coach.starting_price_centavos)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook(coach);
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#021F53] hover:bg-[#3f58b2] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#ff9b00]" />
          <span>Book Session</span>
        </button>
      </div>
    </div>
  );
};
