import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const AuthPages = React.lazy(() =>
  import('../pages/static/AuthPages').then((m) => ({ default: m.AuthPages }))
);

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Reset Password | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <AuthPages mode="reset" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
