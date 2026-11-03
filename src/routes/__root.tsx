import React, { useState, useEffect } from 'react';
import { createRootRouteWithContext, Outlet, ScrollRestoration } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CookieConsentBanner } from '../components/common/CookieConsentBanner';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen';
import { NotFoundPage } from '../pages/static/NotFoundPage';
import { AuthContextType } from '../context/AuthContext';

export interface RouterContext {
  auth: AuthContextType;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error }: { error: any }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f0f7ff]">
      <h1 className="text-2xl font-bold text-[#021F53] mb-2 font-display">Something went wrong</h1>
      <p className="text-slate-600 mb-6 max-w-md text-sm">{error?.message || 'An unexpected error occurred while loading this page.'}</p>
      <button
        onClick={() => window.location.reload()}
        className="tactile-btn-primary px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
      >
        Reload Page
      </button>
    </div>
  ),
});

function RootLayout() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleMaintenance = () => setIsMaintenance(true);
    const handleOpenFeedback = () => setIsFeedbackOpen(true);

    window.addEventListener('app:maintenance', handleMaintenance);
    window.addEventListener('app:open_feedback', handleOpenFeedback);

    return () => {
      window.removeEventListener('app:maintenance', handleMaintenance);
      window.removeEventListener('app:open_feedback', handleOpenFeedback);
    };
  }, []);

  if (isMaintenance) {
    return (
      <MaintenanceScreen
        onRetry={() => {
          setIsMaintenance(false);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f7ff] text-[#021F53]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsentBanner />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <Toaster richColors position="bottom-right" />
      <ScrollRestoration />
    </div>
  );
}
