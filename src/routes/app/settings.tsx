import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const StudentProfileSettingsPage = React.lazy(() =>
  import('../../pages/student/StudentProfileSettingsPage').then((m) => ({
    default: m.StudentProfileSettingsPage,
  }))
);

export const Route = createFileRoute('/app/settings')({
  component: StudentSettingsRoute,
});

function StudentSettingsRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Account Settings | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <StudentProfileSettingsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
