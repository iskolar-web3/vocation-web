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
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NotFoundPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
