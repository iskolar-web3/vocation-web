import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const StudentDashboardPage = React.lazy(() =>
  import('../../pages/student/StudentDashboardPage').then((m) => ({
    default: m.StudentDashboardPage,
  }))
);

export const Route = createFileRoute('/app/')({
  component: StudentDashboardRoute,
});

function StudentDashboardRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Student Dashboard | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <StudentDashboardPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
