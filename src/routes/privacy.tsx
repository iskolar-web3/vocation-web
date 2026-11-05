import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const LegalPages = React.lazy(() =>
  import('../pages/static/LegalPages').then((m) => ({ default: m.LegalPages }))
);

export const Route = createFileRoute('/privacy')({
  component: PrivacyRoute,
});

function PrivacyRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy | iSkolar Vocation';
  }, []);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <LegalPages page="privacy" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
