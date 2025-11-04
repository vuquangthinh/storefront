import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const PaymentPageClient = dynamic(() => import('./PaymentPageClient'), { ssr: false });

export const metadata: Metadata = {
  title: 'Checkout Payment',
  description: 'Select a payment method to complete your purchase.'
};

export default function PaymentPage() {
  return (
    <main className="main checkout">
      <PaymentPageClient />
    </main>
  );
}
