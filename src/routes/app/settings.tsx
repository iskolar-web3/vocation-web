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
    document.title = 'Account Settings — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentProfileSettingsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
