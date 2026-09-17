import React from 'react';
import { Users, Calendar, ArrowRight, Award, Clock, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import { Program } from '../../types';
import { formatPHP, formatDate } from '../../lib/utils';

interface ProgramCardProps {
  program: Program;
  onSelect: (program: Program) => void;
  onEnroll: (program: Program) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect, onEnroll }) => {
  const percentFilled = Math.round((program.enrolledCount / program.maxSlots) * 100);
  const remainingSlots = program.maxSlots - program.enrolledCount;

  return (
    <div
      onClick={() => onSelect(program)}
      className="tactile-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer group hover:border-[#3f58b2]/50 transition-all relative overflow-hidden"
    >
      {/* Top Badge Strip */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="stamp-badge bg-amber-50 text-[#021F53] border border-amber-300">
            <Award className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>{program.badge}</span>
          </span>
          <span className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20">
            <Clock className="w-3 h-3 mr-1 text-[#3f58b2]" />
            {program.durationWeeks} Weeks Cohort
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#021F53] group-hover:text-[#3f58b2] transition-colors mb-2 font-display leading-tight">
          {program.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-5 leading-relaxed">
          {program.subtitle}
        </p>

        {/* Lead Mentor Snippet */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <img
            src={program.leadCoach.avatar}
            alt={program.leadCoach.name}
            className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white"
          />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
              Cohort Instructor
            </div>
            <div className="text-xs font-bold text-[#021F53] truncate">
              {program.leadCoach.name}
            </div>
            <div className="text-[11px] text-[#3f58b2] truncate font-medium">
              {program.leadCoach.role}
            </div>
          </div>
        </div>

        {/* Enrollment Capacity Meter */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{program.enrolledCount} / {program.maxSlots} Students</span>
            </span>
            <span className="text-[#3f58b2] font-bold text-[11px]">
              {remainingSlots} seats left ({percentFilled}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#3f58b2] to-[#ff9b00] rounded-full transition-all duration-500"
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Date & Syllabus CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Orientation</span>
          <span className="font-bold text-[#021F53]">{formatDate(program.startDate)}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEnroll(program);
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#021F53] hover:bg-[#3f58b2] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#ff9b00]" />
          <span>View Syllabus</span>
        </button>
      </div>
    </div>
  );
};
