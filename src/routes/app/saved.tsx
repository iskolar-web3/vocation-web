import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const SavedInternshipsPage = React.lazy(() =>
  import('../../pages/student/SavedInternshipsPage').then((m) => ({
    default: m.SavedInternshipsPage,
  }))
);

export const Route = createFileRoute('/app/saved')({
  component: SavedInternshipsRoute,
});

function SavedInternshipsRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Saved Internships | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SavedInternshipsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
