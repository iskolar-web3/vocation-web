import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getTimeRemaining } from '../../lib/utils';

interface DeadlineCountdownProps {
  deadline?: string;
  deadlineIso?: string;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({
  deadline,
  deadlineIso,
}) => {
  const target = deadline || deadlineIso;
  if (!target) return null;
  const { days, hours, isUrgent, isExpired } = getTimeRemaining(target);

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
        <Clock className="w-3.5 h-3.5" />
        <span>Applications Closed</span>
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-[#ff9b00]" />
        <span>{days}d {hours}h left to apply</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      <span>Deadline in {days} days</span>
    </span>
  );
};
