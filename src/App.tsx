import React from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { useAuth } from './context/AuthContext';

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: undefined!,
  },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App: React.FC = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return <RouterProvider router={router} context={{ auth, queryClient }} />;
};
