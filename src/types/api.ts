/**
 * Types strictly derived from docs/openapi.yaml via openapi-typescript (TASK-011 / Issue #15).
 * Do NOT hand-write contract types here; derive them directly from schema.ts.
 */
import type { components } from './schema';

export type Schemas = components['schemas'];

// Domain Enums & Scalars
export type Role = Schemas['Role'];
export type UserRole = Schemas['Role'];
export type SignupRole = Schemas['SignupRole'];
export type WorkSetup = Schemas['WorkSetup'];
export type CompensationType = Schemas['CompensationType'];
export type InternshipStatus = Schemas['InternshipStatus'];
export type ListingStatus = Schemas['InternshipStatus'];
export type VerificationStatus = Schemas['VerificationStatus'];
export type PriceType = Schemas['PriceType'];
export type BookingStatus = Schemas['BookingStatus'];
export type PaymentStatus = Schemas['PaymentStatus'];
export type LedgerEntryType = Schemas['LedgerEntryType'];
export type UploadPurpose = Schemas['UploadPurpose'];
export type ReferrerSurface = Schemas['ReferrerSurface'];

// Response Envelopes & Meta
export type PaginationMeta = Schemas['Meta'];
export type ApiErrorPayload = Schemas['Error'];
export interface ApiResponse<T> {
  message: string;
  data: T;
  meta?: PaginationMeta;
  error?: ApiErrorPayload;
}

// Platform
export type Features = Schemas['Features'];

// Auth & Session
export type UserSession = Schemas['Me'];
export type Me = Schemas['Me'];
export type AuthAccount = Schemas['AuthAccount'];
export type SignupRequest = Schemas['SignupRequest'];
export type SigninRequest = Schemas['SigninRequest'];
export type GoogleSigninRequest = Schemas['GoogleSigninRequest'];
export type PasswordResetRequest = Schemas['PasswordResetRequest'];
export type PasswordResetConfirmRequest = Schemas['PasswordResetConfirmRequest'];

// Internships & Companies
export type CompanySummary = Schemas['CompanySummary'];
export type InternshipCard = Schemas['InternshipCard'] & {
  ojt_hours?: number;
  compensation_details?: string;
};
export type InternshipDetail = Schemas['InternshipDetail'] & {
  ojt_hours?: number;
  compensation_details?: string;
  recommended_coach_slug?: string;
};
export type CompanyCard = Schemas['CompanyCard'] & {
  banner_url?: string;
  about?: string;
  description?: string;
  perks?: string[];
};
export type CompanyProfile = Schemas['CompanyProfile'] & {
  banner_url?: string;
  about?: string;
  perks?: string[];
};
export type CompanyDetail = CompanyProfile;
export type Company = CompanyProfile;
export type Internship = InternshipDetail;
export type ApplyClickRequest = Schemas['ApplyClickRequest'];

// Coaching & Availability
export type SessionType = Schemas['SessionType'];
export type MySessionType = Schemas['MySessionType'];
export type CoachCard = Schemas['CoachCard'] & {
  primary_topic?: string;
};
export type CoachProfile = Schemas['CoachProfile'];
export type CoachDetail = Schemas['CoachProfile'] & {
  available_slots?: Schemas['PublicAvailabilitySlot'][];
};
export type Coach = CoachDetail;
export type PublicAvailabilitySlot = Schemas['PublicAvailabilitySlot'];
export type AvailabilitySlot = Schemas['PublicAvailabilitySlot'];
export type MyAvailabilitySlot = Schemas['MyAvailabilitySlot'];
export type PutAvailabilityRequest = Schemas['PutAvailabilityRequest'];

export type Review = Schemas['Review'];
export type CoachReview = Schemas['Review'];
export type CreateReviewRequest = Schemas['CreateReviewRequest'];
export type ReviewCreated = Schemas['ReviewCreated'];

// Landing & Student Dashboard
export type LandingResponse = Schemas['LandingResponse'];
export type LandingData = Schemas['LandingResponse'];
export type StudentProfile = Schemas['StudentProfile'];
export type CreateStudentProfileRequest = Schemas['CreateStudentProfileRequest'];
export type UpdateStudentProfileRequest = Schemas['UpdateStudentProfileRequest'];
export type Dashboard = Schemas['Dashboard'];
export type StudentDashboardData = Schemas['Dashboard'];
export type SavedInternship = Schemas['SavedInternship'];
export type Settings = Schemas['Settings'];
export type UpdateSettingsRequest = Schemas['UpdateSettingsRequest'] & {
  current_password?: string;
};

// Bookings
export type BookingResponse = Schemas['BookingResponse'];
export type CreateBookingResponse = Schemas['BookingResponse'];
export type StudentBooking = Schemas['StudentBooking'];
export type BookingItem = Schemas['StudentBooking'];
export type Booking = Schemas['StudentBooking'];
export type CoachBooking = Schemas['CoachBooking'];
export type CreateBookingRequest = Schemas['CreateBookingRequest'];
export type PatchBookingRequest = Schemas['PatchBookingRequest'];

// Coach Self-Service & Earnings
export type CreateCoachProfileRequest = Schemas['CreateCoachProfileRequest'];
export type UpdateCoachProfileRequest = Schemas['UpdateCoachProfileRequest'];
export type CreateSessionTypeRequest = Schemas['CreateSessionTypeRequest'];
export type UpdateSessionTypeRequest = Schemas['UpdateSessionTypeRequest'];
export type EarningsItem = Schemas['EarningsItem'];
export type LedgerEntry = Schemas['LedgerEntry'];
export type Balance = Schemas['Balance'];
export type EarningsMeta = Schemas['EarningsMeta'];

// Admin & Uploads
export type PresignRequest = Schemas['PresignRequest'];
export type PresignResponse = Schemas['PresignResponse'];
export type CreateCompanyRequest = Schemas['CreateCompanyRequest'];
export type CreatedCompany = Schemas['CreatedCompany'];
export type CreateInternshipRequest = Schemas['CreateInternshipRequest'];
export type UpdateInternshipRequest = Schemas['UpdateInternshipRequest'];
export type AdminInternship = Schemas['AdminInternship'];
export type AdminInternshipCard = Schemas['AdminInternshipCard'];
