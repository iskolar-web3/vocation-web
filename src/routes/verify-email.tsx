import React, { Suspense, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const VerifyEmailPage = React.lazy(() =>
  import('../pages/static/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage }))
);

// S-018: the path the server's verification email links to (sitemap §4).
export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailRoute,
});

function VerifyEmailRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Verify your email | iSkolar Vocation';
  }, []);

  return (
    <Suspense fallback={null}>
      <VerifyEmailPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
