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
      fallback={null}
    >
      <SavedInternshipsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
