import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CompaniesPage = React.lazy(() =>
  import('../../pages/internships/CompaniesPage').then((m) => ({
    default: m.CompaniesPage,
  }))
);

export const Route = createFileRoute('/companies/')({
  component: CompaniesRoute,
});

function CompaniesRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Partner Companies — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CompaniesPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
