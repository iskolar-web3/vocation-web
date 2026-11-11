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
      fallback={null}
    >
      <CoachOnboardingPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
