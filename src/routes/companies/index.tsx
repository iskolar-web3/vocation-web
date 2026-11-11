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
    document.title = 'Partner Companies | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <CompaniesPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
