"use client";

import { useEffect } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

type StripePaymentSectionProps = {
  orderCode: string;
  registerConfirmHandler: (handler: (() => Promise<void>) | null) => void;
};

export function StripePaymentSection({ orderCode, registerConfirmHandler }: StripePaymentSectionProps) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!stripe || !elements) {
      registerConfirmHandler(null);
      return;
    }
    const handler = async () => {
      const paymentElement = elements.getElement('payment');
      if (!paymentElement) {
        toast.error('Payment form is still loading. Please try again.');
        return;
      }
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || 'Please review your card details and try again.');
        return;
      }
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation/${orderCode}`,
        },
      });
      if (result.error) {
        toast.error(result.error.message || 'Payment was not completed.');
      }
    };

    registerConfirmHandler(handler);

    return () => {
      registerConfirmHandler(null);
    };
  }, [elements, orderCode, registerConfirmHandler, stripe]);

  return (
    <div className="stripe-payment-section">
      <PaymentElement options={{ layout: 'accordion' }} />
    </div>
  );
}
