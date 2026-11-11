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
    document.title = 'Student Onboarding | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <StudentOnboardingPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
