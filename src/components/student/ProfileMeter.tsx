import React from 'react';
import { CheckCircle2, Circle, TrendingUp, ArrowRight } from 'lucide-react';

interface ProfileMeterProps {
  completenessPct?: number;
  onEditProfile: () => void;
  targetOjtHours?: number;
  completedOjtHours?: number;
}

export const ProfileMeter: React.FC<ProfileMeterProps> = ({
  completenessPct = 75,
  onEditProfile,
  targetOjtHours,
  completedOjtHours,
}) => {
  const isTargetSet = Boolean(targetOjtHours && targetOjtHours > 0);
  const checklist = [
    { label: 'Basic Info & Photo', done: completenessPct >= 20, weight: 20 },
    { label: 'University & Degree', done: completenessPct >= 40, weight: 20 },
    { label: `Year Level & Target OJT Hours${isTargetSet ? ` (${targetOjtHours}h)` : ''}`, done: completenessPct >= 60 || isTargetSet, weight: 20 },
    { label: 'Skills Added', done: completenessPct >= 80, weight: 20 },
    { label: 'Resume Key Added', done: completenessPct >= 100, weight: 20 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4 text-[#3f58b2]" />
          </div>
          <div>
            <h3 className="font-bold text-[#021F53] text-sm sm:text-base font-headline">
              Profile Completeness
            </h3>
            <p className="text-xs text-slate-500">Boost your credibility to recruiters and coaches</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-[#3f58b2]">{completenessPct}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-[#3f58b2] rounded-full transition-all duration-700"
          style={{ width: `${completenessPct}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between text-xs p-2 rounded-xl transition-colors ${
              item.done ? 'bg-[#f0f7ff]/50 text-slate-700' : 'bg-amber-50/60 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <span className={item.done ? 'font-medium' : 'font-semibold'}>
                {item.label}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              +{item.weight}%
            </span>
          </div>
        ))}
      </div>

      {completenessPct < 100 && (
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full py-2.5 px-4 bg-[#f0f7ff] hover:bg-[#e0efff] text-[#3f58b2] font-bold text-xs rounded-2xl border border-[#607ef2]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Complete Remaining Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
