import React, { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AuthPages } from '../pages/static/AuthPages';

export const Route = createFileRoute('/signin')({
  component: SigninRoute,
});

function SigninRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In — iSkolar Vocation';
  }, []);

  return <AuthPages mode="signin" navigate={(path) => routerNavigate({ to: path })} />;
}
