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
import { VerifyEmailPage } from './pages/static/VerifyEmailPage';

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

  // Dynamic page title & SEO meta tags (S-001 to S-090 & Open Graph)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const [pathOnly] = currentPath.split('?');

    let title = 'iSkolar Vocation | Internships & Coaching for Filipino Students';
    if (pathOnly === '/signin') title = 'Sign In | iSkolar Vocation';
    else if (pathOnly === '/signup') title = 'Create Account | iSkolar Vocation';
    else if (pathOnly === '/reset-password' || pathOnly === '/reset') title = 'Reset Password | iSkolar Vocation';
    else if (pathOnly === '/verify-email') title = 'Verify Email | iSkolar Vocation';
    else if (pathOnly === '/internships') title = 'Internship Directory | iSkolar Vocation';
    else if (pathOnly.startsWith('/internships/')) title = 'Internship Details | iSkolar Vocation';
    else if (pathOnly === '/companies') title = 'Partner Companies | iSkolar Vocation';
    else if (pathOnly.startsWith('/companies/')) title = 'Company Profile | iSkolar Vocation';
    else if (pathOnly === '/coaching') title = 'Coaching Hub | iSkolar Vocation';
    else if (pathOnly === '/coaches') title = 'Find a Career Coach | iSkolar Vocation';
    else if (pathOnly.startsWith('/coaches/')) title = 'Coach Profile & Booking | iSkolar Vocation';
    else if (pathOnly === '/app') title = 'Student Dashboard | iSkolar Vocation';
    else if (pathOnly === '/app/onboarding' || pathOnly === '/onboarding') title = 'Student Onboarding | iSkolar Vocation';
    else if (pathOnly === '/app/saved') title = 'Saved Internships | iSkolar Vocation';
    else if (pathOnly === '/app/bookings') title = 'My Mentorship Sessions | iSkolar Vocation';
    else if (pathOnly === '/app/profile' || pathOnly === '/app/settings') title = 'Account Settings | iSkolar Vocation';
    else if (pathOnly === '/coach/onboarding' || pathOnly === '/onboarding/coach') title = 'Coach Onboarding | iSkolar Vocation';
    else if (pathOnly.startsWith('/coach')) title = 'Coach Studio & Dashboard | iSkolar Vocation';
    else if (pathOnly.startsWith('/admin')) title = 'Listing Moderation Queue | iSkolar Vocation Admin';
    else if (pathOnly === '/checkout/success') title = 'Payment Received | iSkolar Vocation';
    else if (pathOnly === '/checkout/cancel') title = 'Checkout Cancelled | iSkolar Vocation';
    else if (pathOnly === '/terms') title = 'Terms of Service | iSkolar Vocation';
    else if (pathOnly === '/privacy') title = 'Privacy Policy | iSkolar Vocation';
    else if (pathOnly === '/refunds') title = 'Refund Policy | iSkolar Vocation';
    else if (pathOnly === '/contact') title = 'Contact Support | iSkolar Vocation';
    else if (pathOnly === '/coach-agreement') title = 'Coach Agreement | iSkolar Vocation';

    document.title = title;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);

    const fullUrl = `https://vocation.iskolar.ph${pathOnly}`;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullUrl);
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', fullUrl);
  }, [currentPath]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCoachZone = (path: string) => path === '/coach' || path.startsWith('/coach/');

  // Synchronize browser history URL if cross-role route attempted
  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated || !user) return;
    const [pathOnly] = currentPath.split('?');

    if (user.role !== 'admin' && pathOnly.startsWith('/admin')) {
      const target = user.role === 'coach' ? '/coach' : '/app';
      if (currentPath !== target) {
        navigate(target);
      }
      return;
    }

    if (user.role === 'coach') {
      if (pathOnly.startsWith('/app') || pathOnly === '/onboarding') {
        const target = user.is_onboarded ? '/coach' : '/coach/onboarding';
        if (currentPath !== target) {
          navigate(target);
        }
      }
    } else if (user.role === 'student') {
      if (isCoachZone(pathOnly) || pathOnly === '/onboarding/coach') {
        const target = user.is_onboarded ? '/app' : '/app/onboarding';
        if (currentPath !== target) {
          navigate(target);
        }
      }
    }
  }, [currentPath, user, isAuthenticated, isLoadingAuth]);

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

    // 1. Route Guards for Protected Zones (docs/sitemap.md §5)
    if (!isLoadingAuth) {
      if (pathOnly.startsWith('/app') || isCoachZone(pathOnly) || pathOnly.startsWith('/admin')) {
        if (!isAuthenticated) {
          return <AuthPages mode="signin" navigate={navigate} />;
        }
      }

      // Role isolation: Coach cannot enter Student zone (/app/* or /onboarding)
      if (isAuthenticated && user?.role === 'coach') {
        if (pathOnly.startsWith('/app') || pathOnly === '/onboarding') {
          return user.is_onboarded ? (
            <CoachDashboardPage navigate={navigate} />
          ) : (
            <CoachOnboardingPage navigate={navigate} />
          );
        }
        if (!user.is_onboarded && isCoachZone(pathOnly) && pathOnly !== '/coach/onboarding' && pathOnly !== '/onboarding/coach') {
          return <CoachOnboardingPage navigate={navigate} />;
        }
      }

      // Role isolation: Student cannot enter Coach zone (/coach/* or /onboarding/coach)
      if (isAuthenticated && user?.role === 'student') {
        if (isCoachZone(pathOnly) || pathOnly === '/onboarding/coach') {
          return user.is_onboarded ? (
            <StudentDashboardPage navigate={navigate} />
          ) : (
            <StudentOnboardingPage navigate={navigate} />
          );
        }
        if (!user.is_onboarded && pathOnly.startsWith('/app') && pathOnly !== '/app/onboarding' && pathOnly !== '/onboarding') {
          return <StudentOnboardingPage navigate={navigate} />;
        }
      }

      // Role isolation: non-admins cannot enter Admin zone (/admin/*)
      if (isAuthenticated && user?.role !== 'admin' && pathOnly.startsWith('/admin')) {
        if (user?.role === 'coach') {
          return <CoachDashboardPage navigate={navigate} />;
        }
        return <StudentDashboardPage navigate={navigate} />;
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
    // The server emails /reset-password?token= (API-025); /reset stays as an alias.
    if (pathOnly === '/reset-password' || pathOnly === '/reset') {
      return <AuthPages mode="reset" navigate={navigate} />;
    }
    if (pathOnly === '/verify-email') {
      return <VerifyEmailPage navigate={navigate} />;
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
      const rawPrice = searchParams.get('price');
      const price = rawPrice === 'free' || rawPrice === 'paid' ? rawPrice : 'all';
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
