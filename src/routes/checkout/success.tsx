import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CheckoutSuccessPage = React.lazy(() =>
  import('../../pages/checkout/CheckoutSuccessPage').then((m) => ({
    default: m.CheckoutSuccessPage,
  }))
);

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccessRoute,
});

function CheckoutSuccessRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Payment Received | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <CheckoutSuccessPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
