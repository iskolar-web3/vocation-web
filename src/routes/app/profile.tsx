import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const StudentProfileSettingsPage = React.lazy(() =>
  import('../../pages/student/StudentProfileSettingsPage').then((m) => ({
    default: m.StudentProfileSettingsPage,
  }))
);

export const Route = createFileRoute('/app/profile')({
  component: StudentProfileRoute,
});

function StudentProfileRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Student Profile | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <StudentProfileSettingsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
