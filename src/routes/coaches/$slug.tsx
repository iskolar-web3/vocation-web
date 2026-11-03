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
    document.title = 'Coach Profile & Booking — iSkolar Vocation';
  }, [slug]);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CoachDetailPage slug={slug} navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
