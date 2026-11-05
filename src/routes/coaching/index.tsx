import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CoachingHubPage = React.lazy(() =>
  import('../../pages/coaching/CoachingHubPage').then((m) => ({
    default: m.CoachingHubPage,
  }))
);

export const Route = createFileRoute('/coaching/')({
  component: CoachingHubRoute,
});

function CoachingHubRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Coaching Hub | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CoachingHubPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
