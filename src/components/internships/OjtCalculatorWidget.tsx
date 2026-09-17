import React, { useState } from 'react';
import {
  Calculator,
  Clock,
  Calendar,
  Coins,
  ArrowRight,
  Check,
} from 'lucide-react';
import { formatPesos } from '../../lib/utils';

interface OjtCalculatorWidgetProps {
  onFindMatchingRoles?: (hours: number) => void;
}

export const OjtCalculatorWidget: React.FC<OjtCalculatorWidgetProps> = ({ onFindMatchingRoles }) => {
  const [targetHours, setTargetHours] = useState<number>(300);
  const [weeklyHours, setWeeklyHours] = useState<number>(40);
  const [monthlyStipendRate, setMonthlyStipendRate] = useState<number>(10000);

  const totalWeeks = Math.ceil(targetHours / weeklyHours);
  const totalMonths = (totalWeeks / 4.33).toFixed(1);
  const totalEstimatedEarnings = Math.round(parseFloat(totalMonths) * monthlyStipendRate);

  const hourPresets = [200, 300, 400, 500, 600];

  return (
    <div className="bg-[#021F53] text-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/30 shadow-soft relative overflow-hidden">
      <div className="relative z-10 space-y-6">
        {/* Header Section with Aligned Title & Pace Tag */}
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
              {weeklyHours === 40 ? 'Full-Time: 40 hrs/week' : 'Part-Time: 20 hrs/week'}
            </span>
          </div>
        </div>

        {/* 3 Parameter Input Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* 1. Required OJT Hours */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff9b00]" />
                <span>Required Hours</span>
              </label>
              <span className="text-base font-display font-bold text-[#ff9b00]">
                {targetHours} hrs
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className="w-full accent-[#ff9b00] cursor-pointer"
              />

              <div className="grid grid-cols-5 gap-1 pt-1">
                {hourPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetHours(preset)}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                      targetHours === preset
                        ? 'bg-[#ff9b00] text-[#021F53] shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Weekly Schedule */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#607ef2]" />
                <span>Work Schedule</span>
              </label>
              <span className="text-xs font-bold text-[#607ef2]">
                {weeklyHours}h / wk
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeeklyHours(40)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  weeklyHours === 40
                    ? 'bg-[#3f58b2] border-[#607ef2] text-white shadow-2xs'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
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
                    ? 'bg-[#3f58b2] border-[#607ef2] text-white shadow-2xs'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
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
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stipend Rate</span>
              </label>
              <span className="text-sm font-bold text-emerald-300">
                {formatPesos(monthlyStipendRate)}/mo
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="25000"
                step="1000"
                value={monthlyStipendRate}
                onChange={(e) => setMonthlyStipendRate(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>₱0 Unpaid</span>
                <span>₱10k Avg</span>
                <span>₱25k Top</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projection Results Bar */}
        <div className="bg-white text-[#021F53] rounded-2xl p-5 border border-slate-200 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto divide-x divide-slate-200 text-left">
            <div className="pr-4">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Estimated Duration
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-display font-bold text-[#021F53]">{totalWeeks}</span>
                <span className="text-xs font-semibold text-slate-600">Weeks</span>
              </div>
            </div>

            <div className="px-4">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Academic Months
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-display font-bold text-[#3f58b2]">~{totalMonths}</span>
                <span className="text-xs font-semibold text-slate-600">Months</span>
              </div>
            </div>

            <div className="pl-4">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Allowance
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-display font-bold text-emerald-700">
                  {formatPesos(totalEstimatedEarnings)}
                </span>
              </div>
            </div>
          </div>

          {onFindMatchingRoles && (
            <button
              type="button"
              onClick={() => onFindMatchingRoles(targetHours)}
              className="w-full lg:w-auto px-6 py-3.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <span>Filter Roles for {targetHours}h OJT</span>
              <ArrowRight className="w-4 h-4 text-[#ff9b00]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
