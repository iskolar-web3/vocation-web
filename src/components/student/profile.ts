import { z } from 'zod';

/* Field options + zod rules shared by onboarding (S-020) and profile (S-024). */

export const SCHOOLS = [
  'Polytechnic University of the Philippines (PUP)',
  'University of the Philippines Diliman',
  'University of Santo Tomas (UST)',
  'De La Salle University (DLSU)',
  'Ateneo de Manila University',
  'Mapúa University',
  'Far Eastern University (FEU)',
  'University of San Carlos (USC), Cebu',
  'Ateneo de Davao University',
];

export const YEARS = [
  { value: '1', label: '1st year' },
  { value: '2', label: '2nd year' },
  { value: '3', label: '3rd year' },
  { value: '4', label: '4th year' },
  { value: '5', label: '5th year' },
];

export const OJT_PRESETS = [240, 300, 486, 600];
export const SKILL_SUGGESTIONS = ['React', 'Figma', 'SQL', 'Python', 'Excel', 'Canva', 'AutoCAD'];

const intIn = (min: number, max: number) => (v: string) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
};

export const schoolSchema = z.object({
  full_name: z.string().trim().min(1, 'Enter your full name.'),
  school: z.string().trim().min(1, 'Enter your university.'),
  course: z.string().trim().min(1, 'Enter your course.'),
  year_level: z.string().regex(/^[1-5]$/, 'Choose your year level.'),
});

/** Blank means "not set yet". */
export const targetHoursSchema = z.object({
  target_ojt_hours: z
    .string()
    .trim()
    .refine((v) => v === '' || intIn(1, 2000)(v), 'Enter hours between 1 and 2000.'),
});

export const profileSchema = schoolSchema.extend({
  ...targetHoursSchema.shape,
  completed_ojt_hours: z
    .string()
    .trim()
    .refine((v) => v === '' || intIn(0, 2000)(v), 'Enter hours between 0 and 2000.'),
  bio: z.string().max(500, 'Keep your bio under 500 characters.'),
});

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: z.string().min(1, 'Enter a new password.').min(8, 'Use at least 8 characters.'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The two passwords don’t match.' });
