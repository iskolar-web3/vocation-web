import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Internship,
  Company,
  Coach,
  Program,
  Review,
  Booking,
  StudentProfile,
  EmployerProfile,
  ListingStatus,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_INTERNSHIPS,
  INITIAL_COACHES,
  INITIAL_PROGRAMS,
  INITIAL_REVIEWS,
  INITIAL_STUDENT_BOOKINGS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_EMPLOYER_PROFILE,
} from '../services/mockData';

interface DataContextType {
  internships: Internship[];
  companies: Company[];
  coaches: Coach[];
  programs: Program[];
  reviews: Review[];
  savedInternshipIds: string[];
  bookings: Booking[];
  studentProfile: StudentProfile;
  employerProfile: EmployerProfile;
  applyClickCount: number;

  // Actions
  toggleSaveInternship: (id: string) => boolean;
  isInternshipSaved: (id: string) => boolean;
  createBooking: (data: {
    coachSlug: string;
    sessionTypeId: string;
    slotStartsAt: string;
    notes?: string;
  }) => Booking;
  confirmPayment: (bookingId: string) => void;
  submitReview: (data: {
    coachSlug: string;
    rating: number;
    comment: string;
    sessionTypeName: string;
    bookingId?: string;
  }) => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  updateEmployerProfile: (updates: Partial<EmployerProfile>) => void;
  createInternshipPosting: (data: Omit<Internship, 'id' | 'slug' | 'status' | 'createdAt'>) => Internship;
  updateInternshipPosting: (id: string, updates: Partial<Internship>) => void;
  moderateListing: (id: string, action: 'approve' | 'reject' | 'withdraw', reason?: string) => void;
  recordApplyClick: (internshipId: string, referrerSurface?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Internships
  const [internships, setInternships] = useState<Internship[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_internships');
    return saved ? JSON.parse(saved) : INITIAL_INTERNSHIPS;
  });

  // Companies
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  // Coaches
  const [coaches, setCoaches] = useState<Coach[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_coaches');
    return saved ? JSON.parse(saved) : INITIAL_COACHES;
  });

  // Programs
  const [programs] = useState<Program[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Saved Internships
  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_saved_ids');
    return saved ? JSON.parse(saved) : ['int-1', 'int-3'];
  });

  // Student Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('iskolar_vocation_bookings');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_BOOKINGS;
  });

  // Student Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('iskolar_vocation_student_profile');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
  });

  // Employer Profile
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile>(() => {
    const saved = localStorage.getItem('iskolar_vocation_employer_profile');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYER_PROFILE;
  });

  // Outbound apply click counter
  const [applyClickCount, setApplyClickCount] = useState<number>(() => {
    const saved = localStorage.getItem('iskolar_vocation_apply_clicks');
    return saved ? parseInt(saved, 10) : 142;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('iskolar_vocation_internships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_coaches', JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_saved_ids', JSON.stringify(savedInternshipIds));
  }, [savedInternshipIds]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_student_profile', JSON.stringify(studentProfile));
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_employer_profile', JSON.stringify(employerProfile));
  }, [employerProfile]);

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_apply_clicks', applyClickCount.toString());
  }, [applyClickCount]);

  // Actions
  const toggleSaveInternship = (id: string): boolean => {
    let nowSaved = false;
    setSavedInternshipIds((prev) => {
      if (prev.includes(id)) {
        nowSaved = false;
        return prev.filter((item) => item !== id);
      } else {
        nowSaved = true;
        return [...prev, id];
      }
    });
    return nowSaved;
  };

  const isInternshipSaved = (id: string) => savedInternshipIds.includes(id);

  // BR-007, BR-008: Money split & confirmation rules
  const createBooking = ({
    coachSlug,
    sessionTypeId,
    slotStartsAt,
    notes,
  }: {
    coachSlug: string;
    sessionTypeId: string;
    slotStartsAt: string;
    notes?: string;
  }): Booking => {
    const coach = coaches.find((c) => c.slug === coachSlug);
    if (!coach) throw new Error('Coach not found');

    const sessionType = coach.sessionTypes.find((st) => st.id === sessionTypeId);
    if (!sessionType) throw new Error('Session type not found');

    const isFree = sessionType.priceCentavos === 0;
    const priceCentavos = sessionType.priceCentavos;

    // BR-008: platform_fee = ROUND(price * 0.05), coach_payout = price - platform_fee
    const platformFeeCentavos = Math.round(priceCentavos * 0.05);
    const coachPayoutCentavos = priceCentavos - platformFeeCentavos;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      coachSlug: coach.slug,
      coachName: coach.name,
      coachAvatar: coach.avatar,
      coachRole: coach.headline,
      sessionTypeId: sessionType.id,
      sessionTypeName: sessionType.name,
      sessionDuration: sessionType.durationMinutes,
      slotStartsAt,
      status: isFree ? 'confirmed' : 'pending',
      paymentStatus: isFree ? 'none' : 'pending',
      priceCentavos,
      platformFeeCentavos,
      coachPayoutCentavos,
      joinUrl: isFree ? `https://meet.google.com/isk-${Math.random().toString(36).substring(2, 7)}` : undefined,
      notes,
      studentName: studentProfile.fullName,
      studentEmail: studentProfile.email,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Mark slot as booked
    setCoaches((prev) =>
      prev.map((c) => {
        if (c.slug === coachSlug) {
          return {
            ...c,
            availableSlots: c.availableSlots.map((s) =>
              slotStartsAt.includes(s.date) && slotStartsAt.includes(s.startTime)
                ? { ...s, isBooked: true }
                : s
            ),
          };
        }
        return c;
      })
    );

    return newBooking;
  };

  const confirmPayment = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'confirmed',
            paymentStatus: 'paid',
            joinUrl: b.joinUrl || `https://meet.google.com/isk-${Math.random().toString(36).substring(2, 7)}`,
          };
        }
        return b;
      })
    );
  };

  // BR-010, BR-011: Review rules
  const submitReview = ({
    coachSlug,
    rating,
    comment,
    sessionTypeName,
    bookingId,
  }: {
    coachSlug: string;
    rating: number;
    comment: string;
    sessionTypeName: string;
    bookingId?: string;
  }) => {
    const studentFirstName = studentProfile.fullName.split(' ')[0] || 'Student';
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      coachSlug,
      studentFirstName, // BR-011: first name only
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      sessionTypeName,
    };

    setReviews((prev) => [newReview, ...prev]);

    // Update coach rating score and review count
    setCoaches((prev) =>
      prev.map((c) => {
        if (c.slug === coachSlug) {
          const currentReviews = reviews.filter((r) => r.coachSlug === coachSlug);
          const totalRating = currentReviews.reduce((sum, r) => sum + r.rating, rating);
          const newCount = currentReviews.length + 1;
          const newRating = Number((totalRating / newCount).toFixed(2));
          return {
            ...c,
            rating: newRating,
            reviewCount: newCount,
          };
        }
        return c;
      })
    );

    if (bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, hasReviewed: true } : b))
      );
    }
  };

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    setStudentProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateEmployerProfile = (updates: Partial<EmployerProfile>) => {
    setEmployerProfile((prev) => ({ ...prev, ...updates }));
  };

  const createInternshipPosting = (
    data: Omit<Internship, 'id' | 'slug' | 'status' | 'createdAt'>
  ): Internship => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newPosting: Internship = {
      ...data,
      id: `int-${Date.now()}`,
      slug,
      status: 'pending', // Starts in moderation queue
      createdAt: new Date().toISOString(),
    };

    setInternships((prev) => [newPosting, ...prev]);
    return newPosting;
  };

  const updateInternshipPosting = (id: string, updates: Partial<Internship>) => {
    setInternships((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // BR-003, BR-006: Moderation actions
  const moderateListing = (
    id: string,
    action: 'approve' | 'reject' | 'withdraw',
    reason?: string
  ) => {
    setInternships((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let status: ListingStatus = item.status;
          if (action === 'approve') status = 'open';
          if (action === 'reject') status = 'rejected';
          if (action === 'withdraw') status = 'withdrawn';
          return {
            ...item,
            status,
            rejectionReason: reason || item.rejectionReason,
          };
        }
        return item;
      })
    );
  };

  // API-003: Outbound apply click tracking (BR-001, BR-002)
  const recordApplyClick = (internshipId: string, _referrerSurface = 'detail') => {
    setApplyClickCount((prev) => prev + 1);
    console.log(`[API-003] Outbound apply click recorded for internship: ${internshipId} (BR-001: No student application stored)`);
  };

  return (
    <DataContext.Provider
      value={{
        internships,
        companies,
        coaches,
        programs,
        reviews,
        savedInternshipIds,
        bookings,
        studentProfile,
        employerProfile,
        applyClickCount,
        toggleSaveInternship,
        isInternshipSaved,
        createBooking,
        confirmPayment,
        submitReview,
        updateStudentProfile,
        updateEmployerProfile,
        createInternshipPosting,
        updateInternshipPosting,
        moderateListing,
        recordApplyClick,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
