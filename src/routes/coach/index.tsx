import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CoachDashboardPage = React.lazy(() =>
  import('../../pages/coach/CoachDashboardPage').then((m) => ({
    default: m.CoachDashboardPage,
  }))
);

export const Route = createFileRoute('/coach/')({
  component: CoachDashboardRoute,
});

function CoachDashboardRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Coach Studio & Dashboard — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CoachDashboardPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
