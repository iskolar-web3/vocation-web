import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const LegalPages = React.lazy(() =>
  import('../pages/static/LegalPages').then((m) => ({ default: m.LegalPages }))
);

export const Route = createFileRoute('/terms')({
  component: TermsRoute,
});

function TermsRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms of Service — iSkolar Vocation';
  }, []);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <LegalPages page="terms" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
