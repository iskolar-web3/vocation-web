import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const LegalPages = React.lazy(() =>
  import('../pages/static/LegalPages').then((m) => ({ default: m.LegalPages }))
);

export const Route = createFileRoute('/coach-agreement')({
  component: CoachAgreementRoute,
});

function CoachAgreementRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Coach Agreement — iSkolar Vocation';
  }, []);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <LegalPages page="coach-agreement" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
