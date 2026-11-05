import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CoachOnboardingPage = React.lazy(() =>
  import('../../pages/coach/CoachOnboardingPage').then((m) => ({
    default: m.CoachOnboardingPage,
  }))
);

export const Route = createFileRoute('/coach/onboarding')({
  component: CoachOnboardingRoute,
});

function CoachOnboardingRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Coach Onboarding | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CoachOnboardingPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
