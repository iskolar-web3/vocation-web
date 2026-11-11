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
    document.title = 'Coach Studio & Dashboard | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <CoachDashboardPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
