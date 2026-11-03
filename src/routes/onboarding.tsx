import { createFileRoute, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '../context/AuthContext';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(meQueryOptions());
    if (!user) {
      throw redirect({ to: '/signin' });
    }
    if (user.role === 'coach') {
      throw redirect({ to: '/coach/onboarding' });
    }
    throw redirect({ to: '/app/onboarding' });
  },
  component: () => null,
});
