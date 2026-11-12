import React, { useState, useEffect } from 'react';
import { createRootRouteWithContext, Outlet, ScrollRestoration, useRouter, useRouterState } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { SiteShell } from '../components/layout/SiteShell';
import { ErrorScreen } from '../components/common/ErrorBoundary';
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
  errorComponent: ({ error }: { error: any }) => <ErrorScreen message={error?.message} />,
});

function RootLayout() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const router = useRouter();
  const location = useRouterState({ select: (s) => s.location });

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
    <>
      {/* The zone routes (app, coach, admin) add their own sidebar frame, so autoFrame is off here. */}
      <SiteShell
        currentPath={location.pathname + (location.searchStr ?? '')}
        navigate={(to) => router.history.push(to)}
        autoFrame={false}
      >
        <Outlet />
      </SiteShell>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <ScrollRestoration />
    </>
  );
}
