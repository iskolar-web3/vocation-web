import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { MaintenanceScreen } from './components/common/MaintenanceScreen';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { FeedbackModal } from './components/common/FeedbackModal';
import { useAuth } from './context/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { InternshipDirectoryPage } from './pages/internships/InternshipDirectoryPage';
import { InternshipDetailPage } from './pages/internships/InternshipDetailPage';
import { CompaniesPage } from './pages/internships/CompaniesPage';
import { CompanyDetailPage } from './pages/internships/CompanyDetailPage';
import { CoachingHubPage } from './pages/coaching/CoachingHubPage';
import { CoachDirectoryPage } from './pages/coaching/CoachDirectoryPage';
import { CoachDetailPage } from './pages/coaching/CoachDetailPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentBookingsPage } from './pages/student/StudentBookingsPage';
import { SavedInternshipsPage } from './pages/student/SavedInternshipsPage';
import { StudentProfileSettingsPage } from './pages/student/StudentProfileSettingsPage';
import { StudentOnboardingPage } from './pages/student/StudentOnboardingPage';
import { CoachDashboardPage } from './pages/coach/CoachDashboardPage';
import { CoachOnboardingPage } from './pages/coach/CoachOnboardingPage';
import { CheckoutSuccessPage } from './pages/checkout/CheckoutSuccessPage';
import { CheckoutCancelPage } from './pages/checkout/CheckoutCancelPage';
import { ModerationQueuePage } from './pages/employer/ModerationQueuePage';
import { AuthPages } from './pages/static/AuthPages';
import { LegalPages } from './pages/static/LegalPages';
import { NotFoundPage } from './pages/static/NotFoundPage';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Browser history sync
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    const handleMaintenance = () => setIsMaintenance(true);
    const handleOpenFeedback = () => setIsFeedbackOpen(true);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('app:maintenance', handleMaintenance);
    window.addEventListener('app:open_feedback', handleOpenFeedback);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('app:maintenance', handleMaintenance);
      window.removeEventListener('app:open_feedback', handleOpenFeedback);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Router resolution with strict Route Guards (Issue #16 & docs/sitemap.md §5)
  const renderRoute = () => {
    if (isMaintenance) {
      return (
        <MaintenanceScreen
          onRetry={() => {
            setIsMaintenance(false);
            window.location.reload();
          }}
          navigate={navigate}
        />
      );
    }

    const [pathOnly, queryString] = currentPath.split('?');
    const searchParams = new URLSearchParams(queryString || '');

    // 1. Route Guards for Protected Zones
    if (!isLoadingAuth) {
      if (pathOnly.startsWith('/app') || pathOnly.startsWith('/coach') || pathOnly.startsWith('/admin')) {
        if (!isAuthenticated) {
          return <AuthPages mode="signin" navigate={navigate} />;
        }
      }

      // Student Onboarding Guard (Issue #16)
      if (isAuthenticated && user?.role === 'student') {
        if (!user.is_onboarded && pathOnly.startsWith('/app') && pathOnly !== '/app/onboarding' && pathOnly !== '/onboarding') {
          return <StudentOnboardingPage navigate={navigate} />;
        }
      }

      // Coach Onboarding Guard (Issue #18)
      if (isAuthenticated && user?.role === 'coach') {
        if (!user.is_onboarded && pathOnly.startsWith('/coach') && pathOnly !== '/coach/onboarding' && pathOnly !== '/onboarding/coach') {
          return <CoachOnboardingPage navigate={navigate} />;
        }
      }
    }

    // Landing
    if (pathOnly === '/' || pathOnly === '') {
      return <LandingPage navigate={navigate} />;
    }

    // Auth
    if (pathOnly === '/signin') {
      return <AuthPages mode="signin" navigate={navigate} />;
    }
    if (pathOnly === '/signup') {
      return <AuthPages mode="signup" navigate={navigate} />;
    }
    if (pathOnly === '/reset') {
      return <AuthPages mode="reset" navigate={navigate} />;
    }

    // Legal Pages (Issue #19 & #23)
    if (pathOnly === '/terms') {
      return <LegalPages page="terms" navigate={navigate} />;
    }
    if (pathOnly === '/privacy') {
      return <LegalPages page="privacy" navigate={navigate} />;
    }
    if (pathOnly === '/coach-agreement') {
      return <LegalPages page="coach-agreement" navigate={navigate} />;
    }
    if (pathOnly === '/refunds') {
      return <LegalPages page="refunds" navigate={navigate} />;
    }
    if (pathOnly === '/contact') {
      return <LegalPages page="contact" navigate={navigate} />;
    }

    // Internships Pillar
    if (pathOnly === '/internships') {
      const field = searchParams.get('field') || '';
      const setup = searchParams.get('setup') || 'all';
      return (
        <InternshipDirectoryPage
          navigate={navigate}
          initialField={field}
          initialSetup={setup}
        />
      );
    }
    if (pathOnly.startsWith('/internships/')) {
      const slug = pathOnly.replace('/internships/', '');
      return <InternshipDetailPage slug={slug} navigate={navigate} />;
    }

    if (pathOnly === '/companies') {
      return <CompaniesPage navigate={navigate} />;
    }
    if (pathOnly.startsWith('/companies/')) {
      const slug = pathOnly.replace('/companies/', '');
      return <CompanyDetailPage slug={slug} navigate={navigate} />;
    }

    // Coaching Pillar
    if (pathOnly === '/coaching') {
      return <CoachingHubPage navigate={navigate} />;
    }
    if (pathOnly === '/coaches') {
      const expertise = searchParams.get('expertise') || '';
      const price = (searchParams.get('price') as any) || 'all';
      return (
        <CoachDirectoryPage
          navigate={navigate}
          initialExpertise={expertise}
          initialPrice={price}
        />
      );
    }
    if (pathOnly.startsWith('/coaches/')) {
      const slug = pathOnly.replace('/coaches/', '');
      return <CoachDetailPage slug={slug} navigate={navigate} />;
    }

    // Checkout Outcomes (Issue #17)
    if (pathOnly === '/checkout/success') {
      return <CheckoutSuccessPage navigate={navigate} />;
    }
    if (pathOnly === '/checkout/cancel') {
      return <CheckoutCancelPage navigate={navigate} />;
    }

    // Student Onboarding & Account
    if (pathOnly === '/app/onboarding' || pathOnly === '/onboarding') {
      return <StudentOnboardingPage navigate={navigate} />;
    }
    if (pathOnly === '/app') {
      return <StudentDashboardPage navigate={navigate} />;
    }
    if (pathOnly === '/app/saved') {
      return <SavedInternshipsPage navigate={navigate} />;
    }
    if (pathOnly === '/app/bookings') {
      return <StudentBookingsPage navigate={navigate} />;
    }
    if (pathOnly === '/app/profile' || pathOnly === '/app/settings') {
      return <StudentProfileSettingsPage navigate={navigate} />;
    }

    // Coach Onboarding & Dashboard
    if (pathOnly === '/coach/onboarding' || pathOnly === '/onboarding/coach') {
      return <CoachOnboardingPage navigate={navigate} />;
    }
    if (pathOnly.startsWith('/coach')) {
      return <CoachDashboardPage navigate={navigate} />;
    }

    // Admin Moderation
    if (pathOnly === '/admin/listings' || pathOnly === '/admin') {
      return <ModerationQueuePage navigate={navigate} />;
    }

    // Fallback 404 (S-090)
    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <ErrorBoundary navigate={navigate}>
      <div className="min-h-screen flex flex-col bg-[#f0f7ff] text-[#021F53]">
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main className="flex-1">{renderRoute()}</main>
        <Footer navigate={navigate} />
        <CookieConsentBanner navigate={navigate} />
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      </div>
    </ErrorBoundary>
  );
};
