import React from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '../../context/AuthContext';
import { AppFrame } from '../../components/layout/AppSidebar';

export const Route = createFileRoute('/coach')({
  beforeLoad: async ({ context, location }) => {
    let user = context.queryClient.getQueryData<any>(['me']) || context.auth?.user;
    if (!user) {
      user = await context.queryClient.fetchQuery({ ...meQueryOptions(), staleTime: 0 });
    }
    if (!user) {
      throw redirect({
        to: '/signin',
        search: { redirect: location.href },
      });
    }
    if (user.role === 'student') {
      throw redirect({
        to: user.is_onboarded ? '/app' : '/app/onboarding',
      });
    }
    if (user.role === 'admin') {
      throw redirect({ to: '/admin/listings' });
    }
    if (!user.is_onboarded && location.pathname !== '/coach/onboarding') {
      const fresh = await context.queryClient.fetchQuery({ ...meQueryOptions(), staleTime: 0 });
      if (fresh?.is_onboarded) {
        user = fresh;
      } else {
        throw redirect({ to: '/coach/onboarding' });
      }
    }
  },
  component: () => (
    <AppFrame zone="coach">
      <Outlet />
    </AppFrame>
  ),
});
