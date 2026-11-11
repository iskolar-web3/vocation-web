import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

const InternshipDirectoryPage = React.lazy(() =>
  import('../../pages/internships/InternshipDirectoryPage').then((m) => ({
    default: m.InternshipDirectoryPage,
  }))
);

const internshipSearchSchema = z.object({
  field: z.string().catch('').optional().default(''),
  setup: z.string().catch('all').optional().default('all'),
  pay: z.string().catch('all').optional().default('all'),
  sort: z.string().catch('newest').optional().default('newest'),
  q: z.string().catch('').optional().default(''),
});

export const Route = createFileRoute('/internships/')({
  validateSearch: (search) => internshipSearchSchema.parse(search),
  component: InternshipDirectoryRoute,
});

function InternshipDirectoryRoute() {
  const search = Route.useSearch();
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = search.field
      ? `${search.field} Internships | iSkolar Vocation`
      : 'Internship Directory | iSkolar Vocation';
  }, [search.field]);

  return (
    <Suspense
      fallback={null}
    >
      <InternshipDirectoryPage
        navigate={(path) => routerNavigate({ to: path })}
        initialField={search.field}
        initialSetup={search.setup}
        initialQuery={search.q}
        onFiltersChange={(newFilters) => {
          routerNavigate({
            to: '/internships',
            search: {
              field: newFilters.field,
              setup: newFilters.setup,
              pay: newFilters.pay,
              sort: newFilters.sort,
              q: newFilters.q,
            },
          });
        }}
      />
    </Suspense>
  );
}
