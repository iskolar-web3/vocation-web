import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CoachDetailPage = React.lazy(() =>
  import('../../pages/coaching/CoachDetailPage').then((m) => ({
    default: m.CoachDetailPage,
  }))
);

export const Route = createFileRoute('/coaches/$slug')({
  component: CoachDetailRoute,
});

function CoachDetailRoute() {
  const { slug } = Route.useParams();
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Coach Profile & Booking | iSkolar Vocation';
  }, [slug]);

  return (
    <Suspense
      fallback={null}
    >
      <CoachDetailPage slug={slug} navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
