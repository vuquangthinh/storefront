import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import CheckoutPageClient from './CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase securely.'
};

export default function Page() {
  return (
    <main className="main checkout">
      <CheckoutPageClient />
    </main>
  );
}
