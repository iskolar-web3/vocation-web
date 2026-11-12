import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CompanyDetailPage = React.lazy(() =>
  import('../../pages/internships/CompanyDetailPage').then((m) => ({
    default: m.CompanyDetailPage,
  }))
);

export const Route = createFileRoute('/companies/$slug')({
  component: CompanyDetailRoute,
});

function CompanyDetailRoute() {
  const { slug } = Route.useParams();
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Company Profile | iSkolar Vocation';
  }, [slug]);

  return (
    <Suspense
      fallback={null}
    >
      <CompanyDetailPage slug={slug} navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
