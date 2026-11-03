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
    document.title = 'Checkout Cancelled — iSkolar Vocation';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutCancelPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
