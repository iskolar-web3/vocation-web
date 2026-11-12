import React, { useEffect, Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

const CheckoutCancelPage = React.lazy(() =>
  import('../../pages/checkout/CheckoutCancelPage').then((m) => ({
    default: m.CheckoutCancelPage,
  }))
);

export const Route = createFileRoute('/checkout/cancel')({
  component: CheckoutCancelRoute,
});

function CheckoutCancelRoute() {
  const routerNavigate = useNavigate();

  useEffect(() => {
    document.title = 'Checkout Cancelled | iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={null}
    >
      <CheckoutCancelPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
