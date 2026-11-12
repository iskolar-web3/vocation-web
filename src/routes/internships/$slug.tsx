import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const InternshipDetailPage = React.lazy(() =>
  import('../../pages/internships/InternshipDetailPage').then((m) => ({
    default: m.InternshipDetailPage,
  }))
);

export const Route = createFileRoute('/internships/$slug')({
  component: InternshipDetailRoute,
});

function InternshipDetailRoute() {
  const { slug } = Route.useParams();
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Internship Details | iSkolar Vocation';
  }, [slug]);

  return (
    <Suspense
      fallback={null}
    >
      <InternshipDetailPage slug={slug} navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
