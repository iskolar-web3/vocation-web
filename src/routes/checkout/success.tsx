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
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessPage navigate={(path) => routerNavigate({ to: path })} />
    </Suspense>
  );
}
