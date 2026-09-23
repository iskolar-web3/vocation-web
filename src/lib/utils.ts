import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPHP(centavos: number): string {
  if (centavos === 0) return 'Free';
  const pesos = centavos / 100;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pesos);
}

export function formatPesos(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Timezone rule: Server speaks UTC, UI renders Asia/Manila (UTC+8)
export const MANILA_TZ = 'Asia/Manila';

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00+08:00`);
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: MANILA_TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: MANILA_TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: MANILA_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTimeRange(startIso: string, durationMinutes: number = 45): string {
  if (!startIso) return '';
  const startDate = new Date(startIso);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const startFormatted = new Intl.DateTimeFormat('en-PH', {
    timeZone: MANILA_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(startDate);

  const endFormatted = new Intl.DateTimeFormat('en-PH', {
    timeZone: MANILA_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(endDate);

  return `${startFormatted} – ${endFormatted}`;
}

/**
 * Given a Manila wall-clock date (YYYY-MM-DD) and time (HH:mm),
 * converts to a UTC ISO string (e.g. 2026-09-22 17:00 Manila -> 2026-09-22T09:00:00.000Z).
 */
export function manilaWallClockToUtcIso(dateStr: string, timeStr: string): string {
  // If timeStr doesn't have seconds, pad it
  const cleanTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const manilaDate = new Date(`${dateStr}T${cleanTime}+08:00`);
  return manilaDate.toISOString();
}

export function getTimeRemaining(deadlineIso: string): {
  days: number;
  hours: number;
  isUrgent: boolean;
  isExpired: boolean;
} {
  const total = Date.parse(deadlineIso) - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, isUrgent: false, isExpired: true };
  }
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return {
    days,
    hours,
    isUrgent: days <= 7,
    isExpired: false,
  };
}
