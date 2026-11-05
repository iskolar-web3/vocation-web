import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const LegalPages = React.lazy(() =>
  import('../pages/static/LegalPages').then((m) => ({ default: m.LegalPages }))
);

export const Route = createFileRoute('/refunds')({
  component: RefundsRoute,
});

function RefundsRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Refund Policy | iSkolar Vocation';
  }, []);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <LegalPages page="refunds" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
