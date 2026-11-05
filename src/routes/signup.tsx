import React, { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AuthPages } from '../pages/static/AuthPages';

export const Route = createFileRoute('/signup')({
  component: SignupRoute,
});

function SignupRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Create an Account | iSkolar Vocation';
  }, []);

  return <AuthPages mode="signup" navigate={(path) => routerNavigate({ to: path })} />;
}
