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
      fallback={null}
    >
      <CoachingHubPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
