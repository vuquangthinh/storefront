"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { loadStripe, Stripe } from '@stripe/stripe-js';

import { CREATE_STRIPE_PAYMENT_INTENT } from '@/graphql/cart';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export type UseStripePaymentArgs = {
  order: any | null;
  selectedPaymentCode: string | null;
  setSelectedPaymentCode: (code: string) => void;
  enabled: boolean;
};

export type UseStripePaymentResult = {
  stripeClientSecret: string | null;
  stripeLoading: boolean;
  stripeStatusMessage: string | null;
  creatingStripeIntent: boolean;
  stripeReady: boolean;
  handlePaymentSelection: (code: string, options?: { force?: boolean }) => Promise<void>;
  handleStripeRetry: () => void;
  handlePaymentStart: () => void;
  handlePaymentEnd: (success: boolean, message?: string) => void;
  stripePromise: Promise<Stripe | null> | null;
  confirmPayment: () => Promise<void>;
  registerConfirmHandler: (handler: (() => Promise<void>) | null) => void;
};

export function useStripePayment({
  order,
  selectedPaymentCode,
  setSelectedPaymentCode,
  enabled,
}: UseStripePaymentArgs): UseStripePaymentResult {
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeStatusMessage, setStripeStatusMessage] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const confirmHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const [createStripePaymentIntent, { loading: creatingStripeIntent }] = useMutation(CREATE_STRIPE_PAYMENT_INTENT);

  const handlePaymentSelection = useCallback(
    async (code: string, options?: { force?: boolean }) => {
      const force = options?.force ?? false;
      if (selectedPaymentCode !== code) {
        setSelectedPaymentCode(code);
      }
      if (!order) {
        toast.error('No active order found. Please add items to your cart and try again.');
        return;
      }

      if (code === 'stripe') {
        if (!enabled && !force) {
          toast.info('Review and save your checkout details before paying with Stripe.');
          return;
        }
        if (!stripePromise) {
          toast.error('Stripe is not configured.');
          return;
        }
        if (stripeLoading || creatingStripeIntent) {
          return;
        }
        if (stripeClientSecret && !force) {
          return;
        }
        try {
          setStripeLoading(true);
          setStripeStatusMessage(null);
          const { data } = await createStripePaymentIntent();
          const clientSecret = (data as { createStripePaymentIntent?: string } | undefined)?.createStripePaymentIntent;
          if (typeof clientSecret === 'string' && clientSecret.length > 0) {
            setStripeClientSecret(clientSecret);
            setStripeReady(false);
          } else {
            toast.error('Unable to start Stripe payment.');
          }
        } catch (error: any) {
          toast.error(error?.message || 'Unable to prepare Stripe payment.');
        } finally {
          setStripeLoading(false);
        }
      } else {
        if (stripeClientSecret) {
          setStripeClientSecret(null);
        }
        setStripeStatusMessage(null);
        setStripeReady(false);
      }
    },
    [
      selectedPaymentCode,
      order,
      stripeLoading,
      creatingStripeIntent,
      stripeClientSecret,
      setSelectedPaymentCode,
      createStripePaymentIntent,
    ]
  );

  useEffect(() => {
    if (
      !enabled ||
      selectedPaymentCode !== 'stripe' ||
      stripeClientSecret ||
      stripeLoading ||
      creatingStripeIntent ||
      stripeStatusMessage
    ) {
      return;
    }
    void handlePaymentSelection('stripe');
  }, [
    enabled,
    selectedPaymentCode,
    stripeClientSecret,
    stripeLoading,
    creatingStripeIntent,
    stripeStatusMessage,
    handlePaymentSelection,
  ]);

  useEffect(() => {
    if (!stripeClientSecret || !stripePromise) {
      return;
    }
    let isActive = true;
    stripePromise.then(async (stripe) => {
      if (!stripe || !isActive) return;
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(stripeClientSecret);
      if (!isActive) return;
      if (error) {
        setStripeStatusMessage(error.message ?? 'Unable to load payment details.');
        setStripeClientSecret(null);
        return;
      }
      if (!paymentIntent) return;
      switch (paymentIntent.status) {
        case 'succeeded':
          setStripeStatusMessage('Payment for this order has already been completed.');
          setStripeClientSecret(null);
          setStripeReady(false);
          break;
        case 'canceled':
          setStripeStatusMessage('Previous payment attempt failed or was canceled. Please try again.');
          setStripeClientSecret(null);
          setStripeReady(false);
          break;
        default:
          setStripeStatusMessage(null);
          break;
      }
    });
    return () => {
      isActive = false;
    };
  }, [stripeClientSecret]);

  const handleStripeRetry = useCallback(() => {
    if (stripeLoading || creatingStripeIntent) return;
    setStripeStatusMessage(null);
    void handlePaymentSelection('stripe', { force: true });
  }, [stripeLoading, creatingStripeIntent, handlePaymentSelection]);

  const handlePaymentStart = useCallback(() => {
    setStripeLoading(true);
  }, []);

  const handlePaymentEnd = useCallback((success: boolean, message?: string) => {
    setStripeLoading(false);
    if (success) {
      toast.info('Finish the payment in the Stripe popup or redirect.');
    } else if (message) {
      toast.error(message);
    }
  }, []);

  const registerConfirmHandler = useCallback((handler: (() => Promise<void>) | null) => {
    confirmHandlerRef.current = handler;
    setStripeReady(Boolean(handler));
  }, []);

  const confirmPayment = useCallback(async () => {
    if (!stripeClientSecret) {
      toast.error('Stripe payment has not been prepared yet.');
      return;
    }
    const handler = confirmHandlerRef.current;
    if (!handler) {
      toast.info('Stripe payment form is still preparing. Please try again in a moment.');
      return;
    }
    setStripeLoading(true);
    try {
      await handler();
    } finally {
      setStripeLoading(false);
    }
  }, [stripeClientSecret]);

  return {
    stripeClientSecret,
    stripeLoading,
    stripeStatusMessage,
    creatingStripeIntent,
    stripeReady,
    handlePaymentSelection,
    handleStripeRetry,
    handlePaymentStart,
    handlePaymentEnd,
    stripePromise,
    confirmPayment,
    registerConfirmHandler,
  };
}
