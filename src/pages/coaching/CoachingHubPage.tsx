import React, { useState } from 'react';
import {
  Award,
  Star,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useCoaches } from '../../services/queries';
import { CoachCard } from '../../components/coaching/CoachCard';
import { SessionTopicMatcher } from '../../components/coaching/SessionTopicMatcher';
import { BookingDialog } from '../../components/coaching/BookingDialog';
import { CoachCard as CoachCardType, CoachDetail } from '../../types/api';

interface CoachingHubPageProps {
  navigate: (path: string) => void;
}

export const CoachingHubPage: React.FC<CoachingHubPageProps> = ({ navigate }) => {
  const { data, isLoading } = useCoaches();
  const coaches = data?.items || [];
  const [selectedCoach, setSelectedCoach] = useState<CoachCardType | CoachDetail | null>(null);

  const topCoaches = coaches.slice(0, 3);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-[#021F53] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#3f58b2]/30 relative overflow-hidden">
        <div className="absolute inset-0 grid-subtle opacity-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
            <Award className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>1-on-1 Mentorship &amp; Interview Flight Deck (S-008)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display leading-tight">
            Get coached by the practitioners who actually hire interns.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Gain unfair advantages with personalized feedback, mock interview practice, and direct advice from engineers and recruiters at Grab, Canva, Maya, and Thinking Machines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/coaches')}
              className="px-6 py-3.5 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Coaches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/coaches?price=free')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              Browse Free Intro Sessions
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Session Simulator Stage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SessionTopicMatcher
          onBookCoach={(c) => setSelectedCoach(c)}
          navigate={navigate}
        />
      </section>

      {/* Transparent Step by Step Booking Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="tactile-card rounded-3xl p-8 sm:p-10">
          <div className="max-w-2xl mb-8 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] font-accent">
              Transparent Workflow
            </span>
            <h3 className="text-2xl font-bold text-[#021F53] font-display">
              How the Booking Process Works
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Choose Coach', desc: 'Filter by expertise, industry background, and session rate.' },
              { step: '02', title: 'Pick Live Slot', desc: 'Select an open date & time slot directly in Asia/Manila time.' },
              { step: '03', title: 'Hosted Checkout', desc: 'Free sessions confirm instantly; paid sessions redirect via PayMongo.' },
              { step: '04', title: 'Live 1-on-1 Call', desc: 'Join via video call and receive actionable feedback.' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="stamp-badge bg-white text-[#3f58b2] border border-[#3f58b2]/20 font-black">
                  Step {s.step}
                </span>
                <h4 className="text-sm font-bold text-[#021F53] font-headline">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Coaches Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff9b00] font-accent">
              Verified Mentors
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
              Featured Top-Rated Coaches
            </h2>
          </div>
          <button
            onClick={() => navigate('/coaches')}
            className="text-xs font-bold text-[#3f58b2] hover:text-[#021F53] flex items-center gap-1 cursor-pointer"
          >
            <span>View all coaches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCoaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                onSelect={() => navigate(`/coaches/${coach.slug}`)}
                onBook={(c) => setSelectedCoach(c)}
              />
            ))}
          </div>
        )}
      </section>

      <BookingDialog
        isOpen={!!selectedCoach}
        onClose={() => setSelectedCoach(null)}
        coach={selectedCoach}
        onBookingSuccess={() => navigate('/app/bookings')}
      />
    </div>
  );
};
