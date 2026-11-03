import React from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '../../context/AuthContext';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(meQueryOptions());
    if (user?.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: () => <Outlet />,
});
