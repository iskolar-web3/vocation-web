import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { routeTree } from './routeTree.gen';
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';
import { initDotGlow } from './lib/dotGlow';
import { initSmoothScroll } from './lib/smoothScroll';
import './index.css';

// Initialize error reporting & privacy-safe analytics consent mode
initSentry();
initAnalytics();
initDotGlow();
initSmoothScroll();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({ routeTree, context: { auth: undefined as never, queryClient }, scrollRestoration: true });

function AppRouter() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
