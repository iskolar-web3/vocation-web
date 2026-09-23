import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

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
import { ModerationQueuePage } from './pages/employer/ModerationQueuePage';
import { CoachDashboardPage } from './pages/coach/CoachDashboardPage';
import { AuthPages } from './pages/static/AuthPages';
import { LegalPages } from './pages/static/LegalPages';
import { NotFoundPage } from './pages/static/NotFoundPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Browser history sync
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Router resolution
  const renderRoute = () => {
    const [pathOnly, queryString] = currentPath.split('?');
    const searchParams = new URLSearchParams(queryString || '');

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

    // Legal
    if (pathOnly === '/terms') {
      return <LegalPages page="terms" navigate={navigate} />;
    }
    if (pathOnly === '/privacy') {
      return <LegalPages page="privacy" navigate={navigate} />;
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

    // Student Account Module
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

    // Coach Module
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
    <div className="min-h-screen flex flex-col bg-[#f0f7ff] text-[#021F53]">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <div className="flex-1">{renderRoute()}</div>
      <Footer navigate={navigate} />
    </div>
  );
};
