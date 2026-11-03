import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const StudentOnboardingPage = React.lazy(() =>
  import('../../pages/student/StudentOnboardingPage').then((m) => ({
    default: m.StudentOnboardingPage,
  }))
);

export const Route = createFileRoute('/app/onboarding')({
  component: StudentOnboardingRoute,
});

function StudentOnboardingRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Student Onboarding — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentOnboardingPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
