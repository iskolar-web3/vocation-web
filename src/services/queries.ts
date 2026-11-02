import { useMemo } from 'react';
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
  CoachProfile,
  CoachReview,
  PublicAvailabilitySlot,
  MyAvailabilitySlot,
  UserSession,
  StudentDashboardData,
  StudentProfile,
  CreateStudentProfileRequest,
  BookingItem,
  CoachBooking,
  CreateBookingRequest,
  BookingResponse,
  CreateBookingResponse,
  CreateReviewRequest,
  CreateCoachProfileRequest,
  UpdateCoachProfileRequest,
  MySessionType,
  EarningsItem,
  EarningsMeta,
  PasswordResetConfirmRequest,
  UpdateSettingsRequest,
  PutAvailabilityRequest,
  AdminInternshipCard,
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
  coachSessions: ['coachSessions'] as const,
  coachAvailabilityMe: ['coachAvailabilityMe'] as const,
  coachEarnings: ['coachEarnings'] as const,
  coachSessionTypes: ['coachSessionTypes'] as const,
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
    staleTime: 1000 * 60 * 5,
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

// Public availability query with required RFC 3339 from & to timestamps (API-040 / Issue #17)
export function useCoachAvailability(slug: string, from?: string, to?: string) {
  const stableWindow = useMemo(() => {
    const now = new Date();
    const f = from || new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)).toISOString();
    const t = to || new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 30, 0, 0, 0)).toISOString();
    return { from: f, to: t };
  }, [from, to]);

  return useQuery({
    queryKey: queryKeys.coachAvailability(slug, stableWindow.from, stableWindow.to),
    queryFn: async () => {
      const res = await api.get<PublicAvailabilitySlot[]>(`/coaches/${slug}/availability`, {
        from: stableWindow.from,
        to: stableWindow.to,
      });
      return res.data || [];
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 10,
    refetchOnMount: 'always',
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

export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: async (email: string) => {
      return api.post('/auth/password-reset/request', { email });
    },
  });
}

export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: async (payload: PasswordResetConfirmRequest) => {
      return api.post('/auth/password-reset/confirm', payload);
    },
  });
}

// Student Dashboard & Profiles
export function useStudentDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.studentDashboard,
    queryFn: async () => {
      const res = await api.get<StudentDashboardData>('/me/dashboard');
      return res.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useSavedInternships(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.savedInternships,
    queryFn: async () => {
      const res = await api.get<InternshipCard[]>('/me/saved');
      return res.data || [];
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
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

export function useStudentBookings(when?: 'upcoming' | 'past', options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.studentBookings(when),
    queryFn: async () => {
      const res = await api.get<BookingItem[]>('/me/bookings', { when });
      return res.data || [];
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useCreateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStudentProfileRequest) => {
      const res = await api.post<StudentProfile>('/me/student-profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
    },
  });
}

export function useStudentProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await api.get<StudentProfile>('/me/student-profile');
      return res.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 1000 * 60 * 2,
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
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSettingsRequest) => {
      return api.patch('/me/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
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
      queryClient.invalidateQueries({ queryKey: ['coach-availability'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.coachAvailabilityMe });
      queryClient.invalidateQueries({ queryKey: ['coachSessions'] });
    },
  });
}

export function useResumeCheckout() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post<BookingResponse>(`/bookings/${bookingId}/checkout`);
      return res.data;
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post<BookingResponse>(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentBookings'] });
      queryClient.invalidateQueries({ queryKey: ['coachSessions'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard });
      queryClient.invalidateQueries({ queryKey: ['coach-availability'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.coachAvailabilityMe });
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

// Coach Portal Queries (Issue #18)
export function useCoachSessions() {
  return useQuery({
    queryKey: queryKeys.coachSessions,
    queryFn: async () => {
      const res = await api.get<CoachBooking[]>('/me/sessions');
      return res.data || [];
    },
  });
}

export function useCoachAvailabilityMe() {
  return useQuery({
    queryKey: queryKeys.coachAvailabilityMe,
    queryFn: async () => {
      const res = await api.get<MyAvailabilitySlot[]>('/me/availability');
      return res.data || [];
    },
  });
}

export function usePublishAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    // API-062 replaces only the coach's unbooked slots; booked ones are kept
    // server-side and must not be re-sent (they would overlap). Each slot is
    // exactly { starts_at, ends_at } — the server rejects unknown fields.
    mutationFn: async (slots: { starts_at: string; ends_at: string }[]) => {
      const body: PutAvailabilityRequest = {
        slots: slots.map(({ starts_at, ends_at }) => ({ starts_at, ends_at })),
      };
      const res = await api.put<MyAvailabilitySlot[]>('/me/availability', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coachAvailabilityMe });
      queryClient.invalidateQueries({ queryKey: ['coach-availability'] });
    },
  });
}

export function useCoachEarnings() {
  return useQuery({
    queryKey: queryKeys.coachEarnings,
    queryFn: async () => {
      const res = await api.get<EarningsItem[]>('/me/earnings');
      return {
        items: res.data || [],
        meta: res.meta as EarningsMeta | undefined,
      };
    },
  });
}

export function useCoachSessionTypes() {
  return useQuery({
    queryKey: queryKeys.coachSessionTypes,
    queryFn: async () => {
      const res = await api.get<MySessionType[]>('/me/session-types');
      return res.data || [];
    },
  });
}

export function useCreateCoachProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCoachProfileRequest) => {
      const res = await api.post<CoachProfile>('/me/coach-profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// Admin Operations
export function useAdminInternships(status?: string) {
  return useQuery({
    queryKey: queryKeys.adminInternships(status),
    queryFn: async () => {
      const res = await api.get<AdminInternshipCard[]>('/admin/internships', { status });
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
