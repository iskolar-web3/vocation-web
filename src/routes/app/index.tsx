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
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentDashboardPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
