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
    document.title = 'Company Profile — iSkolar Vocation';
  }, [slug]);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CompanyDetailPage slug={slug} navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
