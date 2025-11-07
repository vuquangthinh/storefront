"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

import ALink from '~/components/features/custom-link';
import { StripePaymentSection } from '@/components/checkout/StripePaymentSection';
import { useCart } from '@/context/cart/CartContext';
import { useMutation, useQuery } from '@apollo/client/react';
import { ADD_PAYMENT_TO_ORDER, ELIGIBLE_PAYMENT_METHODS } from '@/graphql/cart';
import { useStripePayment, stripePromise } from '@/hooks/useStripePayment';
import { toDecimal } from '~/utils';

function PaymentPageClient() {
  const router = useRouter();
  const { order, isLoading, refetch } = useCart();
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string | null>(null);
  const [initialRefreshing, setInitialRefreshing] = useState<boolean>(true);

  // Refetch cart/order immediately on mount before rendering payment content
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refetch();
      } catch (e) {
        // ignore; page guards will handle missing order
      } finally {
        if (active) setInitialRefreshing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refetch]);

  useEffect(() => {
    if (initialRefreshing) return;
    if (!order || isLoading) {
      return;
    }
    if (!order.lines?.length || !order.shippingAddress || !(order.shippingLines?.length)) {
      router.push('/checkout');
    }
  }, [initialRefreshing, isLoading, order?.id, order?.lines?.length, order?.shippingAddress, order?.shippingLines?.length, router]);

  const { data: paymentData, loading: paymentLoading } = useQuery<{ eligiblePaymentMethods: any[] }>(ELIGIBLE_PAYMENT_METHODS);
  const paymentMethods = useMemo(
    () => (paymentData?.eligiblePaymentMethods ?? []).filter((method: any) => method?.isEligible !== false),
    [paymentData?.eligiblePaymentMethods]
  );

  const [addPaymentToOrder, { loading: addingPayment }] = useMutation(ADD_PAYMENT_TO_ORDER);

  const {
    stripeClientSecret,
    stripeLoading,
    stripeStatusMessage,
    creatingStripeIntent,
    handlePaymentSelection,
    handleStripeRetry,
    confirmPayment,
    registerConfirmHandler,
    stripeReady,
  } = useStripePayment({
    order,
    selectedPaymentCode,
    setSelectedPaymentCode,
    enabled: Boolean(order && order.shippingLines?.length && order.totalWithTax),
  });

  const handlePaymentMethodChange = useCallback(
    async (code: string) => {
      debugger
      if (!order) {
        toast.error('Order not ready. Please go back and review your checkout details.');
        router.push('/checkout');
        return;
      }

      if (!order?.shippingLines?.length) {
        toast.error('Select a shipping method before choosing payment.');
        router.push('/checkout');
        return;
      }

      if ((order.totalWithTax ?? 0) <= 0) {
        toast.error('Order total must be greater than zero.');
        router.push('/checkout');
        return;
      }

      if (!order?.lines?.length) {
        toast.error('Your cart is empty.');
        router.push('/checkout');
        return;
      }

      if (selectedPaymentCode !== code) {
        setSelectedPaymentCode(code);
      }

      if (code === 'stripe') {
        await handlePaymentSelection('stripe', { force: true });
      } else {
        await handlePaymentSelection(code);
      }
    },
    [handlePaymentSelection, order, router, selectedPaymentCode]
  );

  useEffect(() => {
    if (initialRefreshing) return;
    if (selectedPaymentCode) return;
    if (isLoading || !order) return;
    if (!paymentMethods.length) return;
    const preset = order?.payments?.[0]?.method ?? null;
    const stripeOption = paymentMethods.find((method: any) => method?.code === 'stripe')?.code ?? null;
    const fallback = paymentMethods[0]?.code ?? null;
    const next = preset || stripeOption || fallback;
    if (!next) return;
    void handlePaymentMethodChange(next);
  }, [handlePaymentMethodChange, initialRefreshing, isLoading, order, order?.payments, paymentMethods, selectedPaymentCode]);

  const orderLines = order?.lines ?? [];

  const subtotal = useMemo(() => {
    if (typeof order?.subTotalWithTax === 'number') {
      return order.subTotalWithTax / 100;
    }
    return orderLines.reduce((sum: number, line: any) => {
      const amount = typeof line?.discountedLinePriceWithTax === 'number' ? line.discountedLinePriceWithTax : 0;
      return sum + amount;
    }, 0) / 100;
  }, [order?.subTotalWithTax, orderLines]);

  const shippingTotal = useMemo(() => {
    return (order?.shippingWithTax ?? 0) / 100;
  }, [order?.shippingWithTax]);

  const discountTotal = useMemo(() => {
    if (!order?.discounts?.length) return 0;
    return (order.discounts as { amountWithTax?: number | null }[]).reduce((sum: number, disc) => {
      const amount = typeof disc?.amountWithTax === 'number' ? disc.amountWithTax : 0;
      return sum + amount;
    }, 0) / 100;
  }, [order?.discounts]);

  const orderTotal = useMemo(() => {
    if (typeof order?.totalWithTax === 'number') {
      return order.totalWithTax / 100;
    }
    return subtotal + shippingTotal;
  }, [order?.totalWithTax, shippingTotal, subtotal]);

  const handleCompleteOrder = useCallback(async () => {
    if (!order) {
      toast.error('Order not ready.');
      return;
    }
    if (!selectedPaymentCode) {
      toast.error('Please choose a payment method first.');
      return;
    }

    if (selectedPaymentCode === 'stripe') {
      try {
        await confirmPayment();
      } catch (error: any) {
        toast.error(error?.message || 'Stripe payment could not be processed.');
      }
      return;
    }

    try {
      const { data } = await addPaymentToOrder({ variables: { input: { method: selectedPaymentCode, metadata: {} } } });
      const result = (data as any)?.addPaymentToOrder;
      if (result?.__typename && result.__typename !== 'Order') {
        toast.error(result?.message || 'Payment could not be added.');
        return;
      }
      if (!result) {
        toast.error('Payment could not be added.');
        return;
      }
      toast.success('Payment added successfully.');
      await refetch();
      router.push('/checkout/confirmation/' + order.code);
    } catch (error: any) {
      toast.error(error?.message || 'Payment could not be added.');
    }
  }, [addPaymentToOrder, confirmPayment, order, refetch, router, selectedPaymentCode]);

  if (initialRefreshing) {
    return (
      <div className="page-content pt-7 pb-10 mb-10">
        <div className="container text-center">
          <p>Refreshing your cart…</p>
        </div>
      </div>
    );
  }

  if (isLoading && !order) {
    return (
      <div className="page-content pt-7 pb-10 mb-10">
        <div className="container text-center">
          <p>Loading your order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-content pt-7 pb-10 mb-10">
        <div className="container text-center">
          <p>No active order found. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content pt-7 pb-10 mb-10">
      <div className="container">
        <div className="step-by pr-4 pl-4 mb-6">
          <h3 className="title title-simple title-step"><ALink href="/cart">1. Shopping Cart</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/checkout">2. Checkout</ALink></h3>
          <h3 className="title title-simple title-step active"><ALink href="#">3. Payment</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/order">4. Order Complete</ALink></h3>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card card-dashboard">
              <div className="card-body">
                <h3 className="title title-simple text-left text-uppercase">Select Payment Method</h3>

                {paymentLoading ? (
                  <p className="text-grey">Loading payment methods…</p>
                ) : paymentMethods.length > 0 ? (
                  <ul className="list-unstyled mb-4">
                    {paymentMethods.map((method: any) => {
                      const checked = selectedPaymentCode === method.code;
                      return (
                        <li key={method.code} className="mb-3">
                          <div className="custom-radio">
                            <input
                              type="radio"
                              id={`payment-${method.code}`}
                              name="payment-method"
                              className="custom-control-input"
                              checked={checked}
                              onChange={() => void handlePaymentMethodChange(method.code)}
                              disabled={addingPayment}
                            />
                            <label className="custom-control-label" htmlFor={`payment-${method.code}`}>
                              {method.name || method.code}
                            </label>
                          </div>
                          {method.description && <p className="text-body ml-4 mb-0">{method.description}</p>}
                          {method.eligibilityMessage && <p className="text-danger ml-4 mb-0">{method.eligibilityMessage}</p>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-grey">No payment methods available.</p>
                )}

                {selectedPaymentCode === 'stripe' ? (
                  stripePromise ? (
                    stripeClientSecret ? (
                      <div className="mt-4">
                        <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                          <StripePaymentSection orderCode={order?.code ?? ''} registerConfirmHandler={registerConfirmHandler} />
                        </Elements>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className={`mb-2 ${stripeStatusMessage ? 'text-danger' : 'text-grey'}`}>
                          {stripeStatusMessage ?? 'Preparing Stripe payment…'}
                        </p>
                        {stripeStatusMessage && (
                          <button
                            type="button"
                            className="btn btn-outline btn-dark btn-sm btn-rounded"
                            onClick={handleStripeRetry}
                            disabled={stripeLoading || creatingStripeIntent}
                          >
                            Try again
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-danger mt-3 mb-0">Stripe publishable key is not configured.</p>
                  )
                ) : null}
              </div>
            </div>
          </div>

          <aside className="col-lg-4 sticky-sidebar-wrapper">
            <div className="sticky-sidebar" data-sticky-options={'{"bottom": 50}'}>
              <div className="summary pt-5">
                <h3 className="title title-simple text-left text-uppercase">Your Order</h3>
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderLines.map((line: any) => {
                      const linePriceRaw = typeof line?.discountedLinePriceWithTax === 'number' ? line.discountedLinePriceWithTax : 0;
                      const linePrice = linePriceRaw / 100;
                      return (
                        <tr key={line.id}>
                          <td className="product-name">
                            {line?.productVariant?.name ?? 'Item'}
                            <span className="product-quantity">×&nbsp;{line?.quantity ?? 0}</span>
                          </td>
                          <td className="product-total text-body">${toDecimal(linePrice)}</td>
                        </tr>
                      );
                    })}

                    {!!discountTotal && (
                      <tr className="checkout-discount">
                        <td>
                          <h4 className="summary-subtitle">Discount</h4>
                        </td>
                        <td className="summary-discount-price text-danger">${toDecimal(discountTotal * -1)}</td>
                      </tr>
                    )}

                    <tr className="summary-subtotal">
                      <td>
                        <h4 className="summary-subtitle">Subtotal</h4>
                      </td>
                      <td className="summary-subtotal-price pb-0 pt-0">${toDecimal(subtotal)}</td>
                    </tr>

                    <tr className="sumnary-shipping shipping-row-last">
                      <td colSpan={2}>
                        <h4 className="summary-subtitle">Shipping Method</h4>
                        <ul>
                          {order?.shippingLines?.length ? (
                            order.shippingLines.map((line: any) => {
                              const priceValue = (line?.priceWithTax ?? 0) / 100;
                              return (
                                <li key={line.id}>
                                  {line?.shippingMethod?.name ?? 'Shipping'}
                                  <span className="ml-2 text-grey">
                                    ({priceValue === 0 ? 'Free' : `$${toDecimal(priceValue)}`})
                                  </span>
                                </li>
                              );
                            })
                          ) : (
                            <li className="text-grey">No shipping method selected.</li>
                          )}
                        </ul>
                      </td>
                    </tr>

                    <tr className="summary-total">
                      <td className="pb-0">
                        <h4 className="summary-subtitle">Total</h4>
                      </td>
                      <td className=" pt-0 pb-0">
                        <p className="summary-total-price ls-s text-primary">${toDecimal(orderTotal)}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-grey mt-4 mb-4">Confirm your payment method to complete the order.</p>

                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-dark btn-rounded"
                    onClick={() => void handleCompleteOrder()}
                    disabled={
                      addingPayment ||
                      (selectedPaymentCode === 'stripe' && (!stripeClientSecret || !stripeReady || stripeLoading))
                    }
                  >
                    {(() => {
                      if (addingPayment || stripeLoading) {
                        return 'Processing…';
                      }
                      return selectedPaymentCode === 'stripe' ? 'Pay with Stripe' : 'Complete Order';
                    })()}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-dark btn-rounded"
                    onClick={() => router.push('/checkout')}
                  >
                    Back to Checkout
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PaymentPageClient;
