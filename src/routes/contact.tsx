import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const LegalPages = React.lazy(() =>
  import('../pages/static/LegalPages').then((m) => ({ default: m.LegalPages }))
);

export const Route = createFileRoute('/contact')({
  component: ContactRoute,
});

function ContactRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Contact Support | iSkolar Vocation';
  }, []);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <LegalPages page="contact" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
