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
    document.title = 'My Mentorship Sessions | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <StudentBookingsPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
