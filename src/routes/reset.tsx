import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const AuthPages = React.lazy(() =>
  import('../pages/static/AuthPages').then((m) => ({ default: m.AuthPages }))
);

export const Route = createFileRoute('/reset')({
  component: ResetRoute,
});

function ResetRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Reset Password — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPages mode="reset" navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
