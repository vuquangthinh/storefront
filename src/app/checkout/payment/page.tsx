import type { Metadata } from 'next';
import React from 'react';

const PaymentPageClient = React.lazy(() => import('./PaymentPageClient'));

export const metadata: Metadata = {
  title: 'Checkout Payment',
  description: 'Select a payment method to complete your purchase.'
};

export default function PaymentPage() {
  return (
    <main className="main checkout">
      <React.Suspense fallback={<div>Loading...</div>}>
        <PaymentPageClient />
      </React.Suspense>
    </main>
  );
}
