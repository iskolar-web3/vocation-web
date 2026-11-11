import React from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '../../context/AuthContext';
import { AppFrame } from '../../components/layout/AppSidebar';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(meQueryOptions());
    if (user?.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: () => (
    <AppFrame zone="admin">
      <Outlet />
    </AppFrame>
  ),
});
