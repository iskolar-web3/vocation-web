import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const ModerationQueuePage = React.lazy(() =>
  import('../../pages/employer/ModerationQueuePage').then((m) => ({
    default: m.ModerationQueuePage,
  }))
);

export const Route = createFileRoute('/admin/listings')({
  component: AdminListingsRoute,
});

function AdminListingsRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Listing Moderation Queue — iSkolar Vocation Admin';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ModerationQueuePage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
