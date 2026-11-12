import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

const CoachDirectoryPage = React.lazy(() =>
  import('../../pages/coaching/CoachDirectoryPage').then((m) => ({
    default: m.CoachDirectoryPage,
  }))
);

const coachSearchSchema = z.object({
  expertise: z.string().catch('').optional().default(''),
  price: z.enum(['all', 'free', 'paid']).catch('all').optional().default('all'),
  q: z.string().catch('').optional().default(''),
});

export const Route = createFileRoute('/coaches/')({
  validateSearch: (search) => coachSearchSchema.parse(search),
  component: CoachDirectoryRoute,
});

function CoachDirectoryRoute() {
  const search = Route.useSearch();
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = search.expertise
      ? `${search.expertise} Coaches | iSkolar Vocation`
      : 'Find a Career Coach | iSkolar Vocation';
  }, [search.expertise]);

  return (
    <Suspense
      fallback={null}
    >
      <CoachDirectoryPage
        navigate={(path) => routerNavigate({ to: path })}
        initialExpertise={search.expertise}
        initialPrice={search.price}
        initialQuery={search.q}
        onFiltersChange={(newFilters) => {
          routerNavigate({
            to: '/coaches',
            search: {
              expertise: newFilters.expertise,
              price: newFilters.price,
              q: newFilters.q,
            },
          });
        }}
      />
    </Suspense>
  );
}
