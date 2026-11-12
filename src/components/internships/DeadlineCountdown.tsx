import type React from 'react';
import { Deadline } from '../ui/atoms';

/* Shim: old DeadlineCountdown API on top of ui/Deadline. New code: use <Deadline>. */
interface DeadlineCountdownProps {
  deadline?: string;
  deadlineIso?: string;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({ deadline, deadlineIso }) => (
  <Deadline date={deadline || deadlineIso} />
);
