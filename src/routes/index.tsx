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
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  );
}
