import React from 'react';
import { GraduationCap, Sparkles, Users, ArrowRight, BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ProgramCard } from '../../components/coaching/ProgramCard';

interface ProgramsPageProps {
  navigate: (path: string) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ navigate }) => {
  const { programs } = useData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#021F53] rounded-3xl p-6 sm:p-10 text-white shadow-soft space-y-3 border border-[#3f58b2]/30">
        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Structured Coaching Cohorts (S-011)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display">
          Multi-Week Career &amp; OJT Readiness Programs
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Structured 6-to-8 week cohorts with weekly live masterclasses, personalized project feedback, live interview rubrics, and direct partner referral spotlights.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onSelect={() => navigate(`/programs/${program.slug}`)}
            onEnroll={() => navigate(`/programs/${program.slug}`)}
          />
        ))}
      </div>
    </div>
  );
};

