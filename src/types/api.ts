// Types strictly derived from docs/api-spec.md and ADR-0018

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ApiErrorPayload {
  code: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  meta?: PaginationMeta;
  error?: ApiErrorPayload;
}

export type UserRole = 'student' | 'coach' | 'admin';
export type WorkSetup = 'remote' | 'hybrid' | 'onsite';
export type ListingStatus = 'open' | 'pending' | 'rejected' | 'withdrawn';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_onboarded: boolean;
}

export interface InternshipCompany {
  name: string;
  slug: string;
  logo_url: string;
  location?: string;
  industry?: string;
}

export interface InternshipCard {
  id: string;
  slug: string;
  title: string;
  company: InternshipCompany;
  location: string;
  duration_weeks: number;
  is_paid: boolean;
  stipend_amount?: number;
  stipend_period?: 'month' | 'day' | 'fixed';
  ojt_hours?: number;
  work_setup: WorkSetup;
  field: string;
  deadline: string;
  status: ListingStatus;
  created_at: string;
}

export interface InternshipDetail extends InternshipCard {
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  external_apply_url: string;
  recommended_coach_slug?: string;
}

export interface CompanyCard {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  banner_url?: string;
  industry: string;
  location: string;
  size: string;
  website?: string;
  description?: string;
  perks?: string[];
  open_role_count: number;
}

export interface CompanyDetail extends CompanyCard {
  open_internships: InternshipCard[];
}

export interface SessionType {
  id: string;
  name: string;
  duration_minutes: number;
  price_centavos: number;
  description: string;
  badge?: string;
}

export interface CoachCard {
  id: string;
  slug: string;
  name: string;
  headline: string;
  avatar_url: string;
  current_role: string;
  company: string;
  location: string;
  bio: string;
  expertise: string[];
  experience_years: number;
  rating: number;
  review_count: number;
  starting_price_centavos: number;
  session_types: SessionType[];
}

export interface AvailabilitySlot {
  id: string;
  slot_starts_at: string; // ISO UTC
  duration_minutes: number;
  is_available: boolean;
}

export interface CoachDetail extends CoachCard {
  available_slots?: AvailabilitySlot[];
}

export interface CoachReview {
  id: string;
  coach_slug: string;
  student_first_name: string;
  rating: number;
  comment: string;
  date: string;
  session_type_name: string;
}

export interface LandingData {
  featured_internships: InternshipCard[];
  top_coaches: CoachCard[];
  stats?: {
    open_internships: number;
    active_coaches: number;
    partner_companies: number;
  };
}

export interface StudentDashboardData {
  saved_count: number;
  upcoming_sessions_count: number;
  completeness_pct: number;
}

export interface StudentProfile {
  full_name: string;
  email: string;
  school: string;
  course: string;
  year_level: string;
  target_ojt_hours: number;
  completed_ojt_hours: number;
  skills: string[];
  bio: string;
  avatar_url?: string;
  resume_url?: string;
  resume_file_name?: string;
}

export interface BookingItem {
  id: string;
  coach_slug: string;
  coach_name: string;
  coach_avatar_url: string;
  coach_role: string;
  session_type_id: string;
  session_type_name: string;
  session_duration: number;
  slot_starts_at: string; // UTC ISO
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  payment_status: 'none' | 'pending' | 'paid' | 'refunded';
  price_centavos: number;
  platform_fee_centavos: number;
  coach_payout_centavos: number;
  join_url?: string;
  notes?: string;
  student_name: string;
  student_email: string;
  has_reviewed?: boolean;
  amount_due_centavos?: number;
}

export interface CreateBookingRequest {
  coach_slug: string;
  session_type_id: string;
  slot_starts_at: string; // UTC ISO
  notes?: string;
}

export interface CreateBookingResponse {
  booking_id: string;
  status: 'confirmed' | 'pending';
  payment_status: 'none' | 'pending';
  price_centavos: number;
  platform_fee_centavos: number;
  coach_payout_centavos: number;
  checkout_url?: string;
}

export interface ResumeCheckoutResponse {
  checkout_url: string;
}

export interface CreateReviewRequest {
  rating: number;
  body?: string;
}
