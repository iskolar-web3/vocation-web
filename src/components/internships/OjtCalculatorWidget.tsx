import React, { useState } from 'react';
import {
  Calculator,
  Clock,
  Calendar,
  Coins,
  ArrowRight,
  Check,
  Filter,
} from 'lucide-react';
import { formatPesos } from '../../lib/utils';

interface OjtCalculatorWidgetProps {
  onFindMatchingRoles?: (hours: number) => void;
  isModal?: boolean;
}

export const OjtCalculatorWidget: React.FC<OjtCalculatorWidgetProps> = ({
  onFindMatchingRoles,
  isModal = false,
}) => {
  const [targetHours, setTargetHours] = useState<number>(300);
  const [weeklyHours, setWeeklyHours] = useState<number>(40);
  const [monthlyStipendRate, setMonthlyStipendRate] = useState<number>(12000);

  const totalWeeks = Math.ceil(targetHours / weeklyHours);
  const totalMonths = (totalWeeks / 4.33).toFixed(1);
  const totalEstimatedEarnings = Math.round(parseFloat(totalMonths) * monthlyStipendRate);

  const hourPresets = [200, 300, 400, 500, 600];

  return (
    <div
      className={`text-[#021F53] space-y-6 ${
        isModal
          ? ''
          : 'bg-[#021F53] text-white rounded-2xl p-6 sm:p-8 border border-[#3f58b2]/30 shadow-soft relative overflow-hidden'
      }`}
    >
      {!isModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
              <Calculator className="w-3.5 h-3.5 text-[#ff9b00]" />
              <span>OJT Hours &amp; Allowance Calculator</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
              Estimate Your Internship Timeline &amp; Earnings
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-2xl border border-white/15 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#ff9b00] animate-pulse" />
            <span className="text-xs font-bold text-white">
              {weeklyHours === 40 ? 'Full-Time: 40 hrs/wk' : 'Part-Time: 20 hrs/wk'}
            </span>
          </div>
        </div>
      )}

      {/* 3 Parameter Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Required OJT Hours */}
        <div className="bg-[#f0f7ff] rounded-2xl p-4 sm:p-5 border border-[#607ef2]/20 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#021F53] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#3f58b2]" />
              <span>Required Hours</span>
            </label>
            <span className="text-base font-display font-bold text-[#3f58b2]">
              {targetHours} hrs
            </span>
          </div>

          <div className="space-y-2.5">
            <input
              type="range"
              min="100"
              max="800"
              step="50"
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="w-full accent-[#3f58b2] cursor-pointer"
            />

            <div className="flex flex-wrap gap-1.5">
              {hourPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetHours(preset)}
                  className={`flex-1 min-w-[44px] py-1 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                    targetHours === preset
                      ? 'bg-[#021F53] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Work Schedule */}
        <div className="bg-[#f0f7ff] rounded-2xl p-4 sm:p-5 border border-[#607ef2]/20 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#021F53] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#3f58b2]" />
              <span>Work Schedule</span>
            </label>
            <span className="text-xs font-bold text-[#3f58b2]">
              {weeklyHours} hrs / wk
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWeeklyHours(40)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                weeklyHours === 40
                  ? 'bg-[#021F53] border-[#021F53] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Full-Time</span>
                {weeklyHours === 40 && <Check className="w-3.5 h-3.5 text-[#ff9b00]" />}
              </div>
              <span className="text-[11px] opacity-80 mt-1">40 hrs / wk</span>
            </button>

            <button
              type="button"
              onClick={() => setWeeklyHours(20)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                weeklyHours === 20
                  ? 'bg-[#021F53] border-[#021F53] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Part-Time</span>
                {weeklyHours === 20 && <Check className="w-3.5 h-3.5 text-[#ff9b00]" />}
              </div>
              <span className="text-[11px] opacity-80 mt-1">20 hrs / wk</span>
            </button>
          </div>
        </div>

        {/* 3. Monthly Stipend Rate */}
        <div className="bg-[#f0f7ff] rounded-2xl p-4 sm:p-5 border border-[#607ef2]/20 flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#021F53] uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Target Allowance</span>
            </label>
            <span className="text-sm font-bold text-emerald-700">
              {formatPesos(monthlyStipendRate)}/mo
            </span>
          </div>

          <div className="space-y-2.5">
            <input
              type="range"
              min="0"
              max="25000"
              step="1000"
              value={monthlyStipendRate}
              onChange={(e) => setMonthlyStipendRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>₱0 Unpaid</span>
              <span>₱12k Avg</span>
              <span>₱25k+ Top</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Results Bar */}
      <div className="bg-[#002774] text-white rounded-2xl p-5 border border-[#3f58b2]/30 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 divide-x divide-white/15 text-left">
          <div className="pr-2 sm:pr-4">
            <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block">
              Estimated Duration
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-white">
                {totalWeeks}
              </span>
              <span className="text-xs font-medium text-slate-300">Wks</span>
            </div>
          </div>

          <div className="px-2 sm:px-4">
            <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block">
              Academic Pace
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-display font-bold text-[#ff9b00]">
                ~{totalMonths}
              </span>
              <span className="text-xs font-medium text-slate-300">Mos</span>
            </div>
          </div>

          <div className="pl-2 sm:pl-4">
            <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider block">
              Total Earnings
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-display font-bold text-emerald-400">
                {formatPesos(totalEstimatedEarnings)}
              </span>
            </div>
          </div>
        </div>

        {onFindMatchingRoles && (
          <button
            type="button"
            onClick={() => onFindMatchingRoles(targetHours)}
            className="w-full md:w-auto px-6 py-3.5 bg-[#ff9b00] hover:bg-[#e08900] text-[#021F53] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Filter className="w-4 h-4 text-[#021F53]" />
            <span>Filter Roles for {targetHours}h OJT</span>
            <ArrowRight className="w-4 h-4 text-[#021F53]" />
          </button>
        )}
      </div>
    </div>
  );
};
