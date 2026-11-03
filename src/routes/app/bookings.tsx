import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const StudentBookingsPage = React.lazy(() =>
  import('../../pages/student/StudentBookingsPage').then((m) => ({
    default: m.StudentBookingsPage,
  }))
);

export const Route = createFileRoute('/app/bookings')({
  component: StudentBookingsRoute,
});

function StudentBookingsRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'My Mentorship Sessions — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentBookingsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
