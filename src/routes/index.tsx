import React, { useEffect, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';

const LandingPage = React.lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);

export const Route = createFileRoute('/')({
  component: LandingRoute,
});

function LandingRoute() {
  useEffect(() => {
    document.title = 'iSkolar Vocation | Internships & Coaching for Filipino Students';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <LandingPage />
    </Suspense>
  );
}
