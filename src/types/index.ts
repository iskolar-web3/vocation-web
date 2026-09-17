export type Role = 'visitor' | 'student' | 'coach' | 'employer' | 'admin';

export type WorkSetup = 'remote' | 'hybrid' | 'onsite';
export type PayType = 'paid' | 'unpaid';
export type ListingStatus = 'open' | 'pending' | 'rejected' | 'withdrawn';

export interface Company {
  id: string;
  slug: string;
  name: string;
  logo: string;
  banner?: string;
  industry: string;
  location: string;
  size: string;
  website: string;
  description: string;
  perks: string[];
  isVerified: boolean;
  openRoleCount: number;
}

export interface Internship {
  id: string;
  slug: string;
  title: string;
  company: {
    name: string;
    slug: string;
    logo: string;
    isVerified: boolean;
    location: string;
    industry: string;
  };
  field: string;
  workSetup: WorkSetup;
  isPaid: boolean;
  stipendAmount?: number; // in PHP
  stipendPeriod?: 'month' | 'day' | 'fixed';
  durationWeeks: number;
  ojtHours?: number; // e.g. 300 hrs
  deadline: string; // ISO string
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  applyUrl: string;
  status: ListingStatus;
  createdAt: string;
  recommendedCoachSlug?: string;
  rejectionReason?: string;
}

export interface SessionType {
  id: string;
  name: string;
  durationMinutes: number;
  priceCentavos: number; // 0 = free, e.g. 45000 = ₱450.00
  description: string;
  badge?: string;
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  isBooked: boolean;
}

export interface Coach {
  id: string;
  slug: string;
  name: string;
  headline: string;
  avatar: string;
  currentRole: string;
  company: string;
  location: string;
  bio: string;
  expertise: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  sessionTypes: SessionType[];
  availableSlots: TimeSlot[];
  startingPriceCentavos: number;
}

export interface Review {
  id: string;
  coachSlug: string;
  studentFirstName: string;
  rating: number;
  comment: string;
  date: string;
  sessionTypeName: string;
}

export interface Booking {
  id: string;
  coachSlug: string;
  coachName: string;
  coachAvatar: string;
  coachRole: string;
  sessionTypeId: string;
  sessionTypeName: string;
  sessionDuration: number;
  slotStartsAt: string; // ISO string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'none' | 'pending' | 'paid' | 'refunded';
  priceCentavos: number;
  platformFeeCentavos: number;
  coachPayoutCentavos: number;
  joinUrl?: string;
  notes?: string;
  studentName: string;
  studentEmail: string;
  hasReviewed?: boolean;
}

export interface ProgramMilestone {
  week: number;
  title: string;
  description: string;
  deliverables: string[];
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  field: string;
  durationWeeks: number;
  enrolledCount: number;
  maxSlots: number;
  priceCentavos: number;
  startDate: string;
  endDate: string;
  leadCoach: {
    name: string;
    role: string;
    company: string;
    avatar: string;
  };
  syllabus: ProgramMilestone[];
  prerequisites: string[];
  outcomes: string[];
}

export interface StudentProfile {
  fullName: string;
  email: string;
  school: string;
  course: string;
  yearLevel: string;
  targetOjtHours: number;
  completedOjtHours: number;
  skills: string[];
  bio: string;
  avatar: string;
  resumeUrl?: string;
  resumeFileName?: string;
}

export interface EmployerProfile {
  id: string;
  companyName: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  website: string;
  description: string;
  isVerified: boolean;
  contactEmail: string;
}
