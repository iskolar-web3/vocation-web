import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  LandingData,
  InternshipCard,
  InternshipDetail,
  CompanyCard,
  CompanyDetail,
  CoachCard,
  CoachDetail,
  CoachReview,
  AvailabilitySlot,
  UserSession,
  StudentDashboardData,
  StudentProfile,
  BookingItem,
  CreateBookingRequest,
  CreateBookingResponse,
  ResumeCheckoutResponse,
  CreateReviewRequest,
} from '../types/api';

// Keys
export const queryKeys = {
  landing: ['landing'] as const,
  internships: (filters?: Record<string, any>) => ['internships', filters] as const,
  internship: (slug: string) => ['internship', slug] as const,
  companies: (params?: Record<string, any>) => ['companies', params] as const,
  company: (slug: string) => ['company', slug] as const,
  coaches: (filters?: Record<string, any>) => ['coaches', filters] as const,
  coach: (slug: string) => ['coach', slug] as const,
  coachReviews: (slug: string) => ['coach-reviews', slug] as const,
  coachAvailability: (slug: string, from?: string, to?: string) =>
    ['coach-availability', slug, from, to] as const,
  currentUser: ['currentUser'] as const,
  studentDashboard: ['studentDashboard'] as const,
  savedInternships: ['savedInternships'] as const,
  studentBookings: (when?: 'upcoming' | 'past') => ['studentBookings', when] as const,
  adminInternships: (status?: string) => ['adminInternships', status] as const,
};

// Public Reads
export function useLanding() {
  return useQuery({
    queryKey: queryKeys.landing,
    queryFn: async () => {
      const res = await api.get<LandingData>('/landing');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInternships(filters?: {
  q?: string;
  field?: string;
  setup?: string;
  pay?: string;
  duration?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: queryKeys.internships(filters),
    queryFn: async () => {
      const res = await api.get<InternshipCard[]>('/internships', filters);
      return { items: res.data || [], meta: res.meta };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useInternship(slug: string) {
  return useQuery({
    queryKey: queryKeys.internship(slug),
    queryFn: async () => {
      const res = await api.get<InternshipDetail>(`/internships/${slug}`);
      return res.data;
    },
    enabled: Boolean(slug),
  });
}

export function useRecordApplyClick() {
  return useMutation({
    mutationFn: async ({
      internshipId,
      referrerSurface = 'detail',
    }: {
      internshipId: string;
      referrerSurface?: 'directory' | 'detail' | 'share' | 'cross_sell';
    }) => {
      return api.post(`/internships/${internshipId}/apply-click`, {
        referrer_surface: referrerSurface,
      });
    },
  });
}

export function useCompanies(params?: { q?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: queryKeys.companies(params),
    queryFn: async () => {
      const res = await api.get<CompanyCard[]>('/companies', params);
      return { items: res.data || [], meta: res.meta };
    },
  });
}

export function useCompany(slug: string) {
  return useQuery({
    queryKey: queryKeys.company(slug),
    queryFn: async () => {
      const res = await api.get<CompanyDetail>(`/companies/${slug}`);
      return res.data;
    },
    enabled: Boolean(slug),
  });
}

export function useCoaches(filters?: {
  q?: string;
  expertise?: string;
  price?: 'any' | 'free' | 'paid';
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: queryKeys.coaches(filters),
    queryFn: async () => {
      const res = await api.get<CoachCard[]>('/coaches', filters);
      return { items: res.data || [], meta: res.meta };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCoach(slug: string) {
  return useQuery({
    queryKey: queryKeys.coach(slug),
    queryFn: async () => {
      const res = await api.get<CoachDetail>(`/coaches/${slug}`);
      return res.data;
    },
    enabled: Boolean(slug),
  });
}

export function useCoachReviews(slug: string) {
  return useQuery({
    queryKey: queryKeys.coachReviews(slug),
    queryFn: async () => {
      const res = await api.get<CoachReview[]>(`/coaches/${slug}/reviews`);
      return res.data || [];
    },
    enabled: Boolean(slug),
  });
}

export function useCoachAvailability(slug: string, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.coachAvailability(slug, from, to),
    queryFn: async () => {
      const res = await api.get<AvailabilitySlot[]>(`/coaches/${slug}/availability`, {
        from,
        to,
      });
      return res.data || [];
    },
    enabled: Boolean(slug),
  });
}

// Auth & Session
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const res = await api.get<UserSession>('/me');
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

// Student Dashboard & Profiles
export function useStudentDashboard() {
  return useQuery({
    queryKey: queryKeys.studentDashboard,
    queryFn: async () => {
      const res = await api.get<StudentDashboardData>('/me/dashboard');
      return res.data;
    },
  });
}

export function useSavedInternships() {
  return useQuery({
    queryKey: queryKeys.savedInternships,
    queryFn: async () => {
      const res = await api.get<InternshipCard[]>('/me/saved');
      return res.data || [];
    },
  });
}

export function useSaveInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (internshipId: string) => {
      return api.put(`/me/saved/${internshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedInternships });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
    },
  });
}

export function useUnsaveInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (internshipId: string) => {
      return api.delete(`/me/saved/${internshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedInternships });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
    },
  });
}

export function useStudentBookings(when?: 'upcoming' | 'past') {
  return useQuery({
    queryKey: queryKeys.studentBookings(when),
    queryFn: async () => {
      const res = await api.get<BookingItem[]>('/me/bookings', { when });
      return res.data || [];
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<StudentProfile>) => {
      const res = await api.patch<StudentProfile>('/me/student-profile', updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email?: string; password?: string }) => {
      return api.patch('/me/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// Bookings & Payments
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const res = await api.post<CreateBookingResponse>('/bookings', bookingData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentBookings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
    },
  });
}

export function useResumeCheckout() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post<ResumeCheckoutResponse>(`/bookings/${bookingId}/checkout`);
      return res.data;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      review,
    }: {
      bookingId: string;
      review: CreateReviewRequest;
    }) => {
      return api.post(`/bookings/${bookingId}/review`, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentBookings'] });
      queryClient.invalidateQueries({ queryKey: ['coach-reviews'] });
    },
  });
}

// Admin Operations
export function useAdminInternships(status?: string) {
  return useQuery({
    queryKey: queryKeys.adminInternships(status),
    queryFn: async () => {
      const res = await api.get<InternshipDetail[]>('/admin/internships', { status });
      return res.data || [];
    },
  });
}

export function useAdminCreateInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post<InternshipDetail>('/admin/internships', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInternships'] });
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
}

export function useAdminUpdateInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await api.patch<InternshipDetail>(`/admin/internships/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInternships'] });
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
}

export function useAdminWithdrawInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/admin/internships/${id}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInternships'] });
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
}
