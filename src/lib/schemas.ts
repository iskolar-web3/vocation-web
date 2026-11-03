import { z } from 'zod';

export const UserRoleSchema = z.enum(['student', 'coach', 'employer', 'admin']);

export const UserSessionSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  full_name: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  is_onboarded: z.boolean(),
  created_at: z.string().optional(),
}).passthrough();

export const PaginationMetaSchema = z.object({
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  has_more: z.boolean().optional(),
}).passthrough();

export const CompanySummarySchema = z.object({
  name: z.string(),
  slug: z.string(),
  logo_url: z.string().optional().nullable(),
  is_verified: z.boolean().optional(),
  location: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
}).passthrough();

export const InternshipCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  company: CompanySummarySchema,
  field: z.string().optional(),
  work_setup: z.string().optional(),
  compensation_type: z.string().optional(),
  stipend_amount: z.number().optional().nullable(),
  stipend_period: z.string().optional().nullable(),
  compensation_details: z.string().optional().nullable(),
  duration_weeks: z.number().optional().nullable(),
  ojt_hours: z.number().optional().nullable(),
  deadline: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
}).passthrough();

export const InternshipDetailSchema = InternshipCardSchema.extend({
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  apply_url: z.string().optional(),
  recommended_coach_slug: z.string().optional().nullable(),
}).passthrough();

export const CompanyCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo_url: z.string().optional().nullable(),
  banner_url: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  perks: z.array(z.string()).optional(),
  is_verified: z.boolean().optional(),
  open_role_count: z.number().optional(),
}).passthrough();

export const CoachCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  display_name: z.string(),
  headline: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  primary_topic: z.string().optional().nullable(),
  rate_hourly_centavos: z.number().optional(),
  rating_avg: z.number().optional().nullable(),
  rating_count: z.number().optional(),
  review_count: z.number().optional(),
  free_intro_available: z.boolean().optional(),
  is_verified: z.boolean().optional(),
}).passthrough();

export const CoachProfileSchema = CoachCardSchema.extend({
  bio: z.string().optional().nullable(),
  experience_years: z.number().optional().nullable(),
  linkedin_url: z.string().optional().nullable(),
  payout_account: z.string().optional().nullable(),
  is_published: z.boolean().optional(),
  topics: z.array(z.string()).optional(),
  session_types: z.array(z.any()).optional(),
  available_slots: z.array(z.any()).optional(),
}).passthrough();

export const StudentBookingSchema = z.object({
  id: z.string(),
  coach_slug: z.string().optional(),
  coach_display_name: z.string().optional(),
  coach_avatar_url: z.string().optional().nullable(),
  session_type_name: z.string().optional(),
  session_duration_minutes: z.number().optional(),
  slot_starts_at: z.string(),
  status: z.string(),
  payment_status: z.string().optional(),
  price_centavos: z.number().optional(),
  join_url: z.string().optional().nullable(),
  has_reviewed: z.boolean().optional(),
}).passthrough();

export const StudentDashboardSchema = z.object({
  profile: z.object({
    full_name: z.string().optional().nullable(),
    school: z.string().optional().nullable(),
    course: z.string().optional().nullable(),
    target_ojt_hours: z.number().optional().nullable(),
    completed_ojt_hours: z.number().optional().nullable(),
  }).passthrough().optional(),
  stats: z.object({
    saved_count: z.number().optional(),
    upcoming_sessions_count: z.number().optional(),
    applications_count: z.number().optional(),
  }).passthrough().optional(),
  saved_internships: z.array(InternshipCardSchema).optional(),
  upcoming_sessions: z.array(StudentBookingSchema).optional(),
}).passthrough();

export const LandingResponseSchema = z.object({
  featured_internships: z.array(InternshipCardSchema).optional(),
  featured_coaches: z.array(CoachCardSchema).optional(),
  stats: z.record(z.string(), z.any()).optional(),
}).passthrough();
