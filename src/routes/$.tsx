import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const NotFoundPage = React.lazy(() =>
  import('../pages/static/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
);

export const Route = createFileRoute('/$')({
  component: SplatRoute,
});

function SplatRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Page Not Found | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <NotFoundPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
