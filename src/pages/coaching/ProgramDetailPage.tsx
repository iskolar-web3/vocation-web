import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Users,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Award,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate, formatPHP } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

interface ProgramDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProgramDetailPage: React.FC<ProgramDetailPageProps> = ({ slug, navigate }) => {
  const { programs } = useData();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEnrolledSuccess, setIsEnrolledSuccess] = useState(false);

  const program = programs.find((p) => p.slug === slug);

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#021F53]">Program Not Found</h2>
        <button
          onClick={() => navigate('/programs')}
          className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold text-xs rounded-full"
        >
          Back to Programs
        </button>
      </div>
    );
  }

  const percentFilled = Math.round((program.enrolledCount / program.maxSlots) * 100);

  const handleEnrollSubmit = () => {
    setIsEnrolledSuccess(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <button
        onClick={() => navigate('/programs')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Programs</span>
      </button>

      {/* Main Program Card */}
      <div className="bg-gradient-to-r from-[#021F53] via-[#002774] to-[#3f58b2] rounded-3xl p-6 sm:p-10 text-white shadow-soft space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="px-3.5 py-1 rounded-full bg-[#ff9b00] text-[#021F53] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>{program.badge}</span>
          </span>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
            {program.durationWeeks} Weeks Cohort
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
          {program.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          {program.subtitle}
        </p>

        {/* Lead Coach Box */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15 max-w-lg">
          <img
            src={program.leadCoach.avatar}
            alt={program.leadCoach.name}
            className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm"
          />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#ff9b00]">
              Cohort Lead Coach
            </div>
            <div className="font-bold text-sm">{program.leadCoach.name}</div>
            <div className="text-xs text-slate-300">{program.leadCoach.role}</div>
          </div>
        </div>

        {/* Schedule & Enrollment info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <div>
            <span className="text-slate-300 block text-[11px]">Start Date</span>
            <span className="font-bold text-sm">{formatDate(program.startDate)}</span>
          </div>
          <div>
            <span className="text-slate-300 block text-[11px]">End Date</span>
            <span className="font-bold text-sm">{formatDate(program.endDate)}</span>
          </div>
          <div>
            <span className="text-slate-300 block text-[11px]">Subsidized Student Tuition</span>
            <span className="font-bold text-sm text-[#ff9b00]">{formatPHP(program.priceCentavos)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEnrollModalOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-2"
        >
          <GraduationCap className="w-5 h-5" />
          <span>Apply to Enroll in this Cohort</span>
        </button>
      </div>

      {/* Week-by-Week Syllabus Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#3f58b2]/10 shadow-soft space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-[#3f58b2]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#021F53] font-display">
            Week-by-Week Curriculum & Milestones
          </h2>
        </div>

        <div className="space-y-6">
          {program.syllabus.map((week) => (
            <div
              key={week.week}
              className="p-5 rounded-2xl bg-[#f0f7ff]/70 border border-[#607ef2]/15 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3f58b2] bg-white px-2.5 py-0.5 rounded-full border border-[#3f58b2]/20">
                  Week {week.week}
                </span>
                <span className="text-xs text-slate-400 font-medium">Live Workshop & Assignment</span>
              </div>
              <h3 className="font-bold text-base text-[#021F53]">{week.title}</h3>
              <p className="text-xs sm:text-sm text-[#2c3f77] leading-relaxed">{week.description}</p>
              <div className="pt-2 flex flex-wrap gap-2">
                {week.deliverables.map((deliv, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Deliverable: {deliv}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prerequisites and Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
          <h3 className="text-lg font-bold text-[#021F53] font-headline">Prerequisites</h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#2c3f77]">
            {program.prerequisites.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3f58b2] flex-shrink-0 mt-2" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
          <h3 className="text-lg font-bold text-[#021F53] font-headline">Graduation Outcomes</h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#2c3f77]">
            {program.outcomes.map((out, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{out}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          setIsEnrolledSuccess(false);
        }}
        title="Enroll in Coaching Cohort"
        maxWidth="md"
      >
        {isEnrolledSuccess ? (
          <div className="py-8 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#021F53]">Enrollment Confirmed!</h3>
            <p className="text-xs sm:text-sm text-[#2c3f77]">
              You are enrolled in <strong>{program.title}</strong> starting on {formatDate(program.startDate)}. Check your dashboard for onboarding materials.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsEnrollModalOpen(false);
                navigate('/app');
              }}
              className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold text-xs rounded-full"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Confirm your enrollment in the <strong>{program.title}</strong> cohort led by {program.leadCoach.name}.
            </p>
            <div className="p-4 bg-[#f0f7ff] rounded-2xl text-xs space-y-2">
              <div className="flex justify-between font-semibold text-[#021F53]">
                <span>Tuition</span>
                <span>{formatPHP(program.priceCentavos)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Start Date</span>
                <span>{formatDate(program.startDate)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnrollSubmit}
                className="px-6 py-2.5 bg-[#ff9b00] text-[#021F53] font-bold text-xs rounded-full shadow-md"
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
