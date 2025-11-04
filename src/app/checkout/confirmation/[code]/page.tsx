"use client";

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';

import { ACTIVE_ORDER, ORDER_BY_CODE } from '@/graphql/cart';
import { toDecimal } from '~/utils';

type PageProps = {
  params: {
    code: string;
  };
};

export default function OrderConfirmationPage({ params }: PageProps) {
  const { code } = params;
  const searchParams = useSearchParams();
  const { data, loading, error, stopPolling, startPolling } = useQuery(ORDER_BY_CODE, {
    variables: { code },
    fetchPolicy: 'network-only',
    pollInterval: 5000,
  });

  const { data: activeOrderData } = useQuery(ACTIVE_ORDER, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!error) {
      startPolling?.(5000);
      return;
    }
    const forbidden = (error as any)?.graphQLErrors?.some((err: any) => err.extensions?.code === 'FORBIDDEN');
    if (forbidden) {
      stopPolling?.();
    }
  }, [error, startPolling, stopPolling]);

  const order = useMemo(() => {
    const lookup = (data as { orderByCode?: any } | undefined)?.orderByCode ?? null;
    if (lookup) return lookup;
    const active = (activeOrderData as { activeOrder?: any } | undefined)?.activeOrder ?? null;
    if (active?.code === code) return active;
    return null;
  }, [data, activeOrderData, code]);
  const usedFallback = !((data as { orderByCode?: any } | undefined)?.orderByCode) && Boolean(order);
  const payment = order?.payments?.[0] ?? null;
  const paymentState = payment?.state ?? 'Pending';

  let statusLabel = 'Processing your payment…';
  if (order) {
    if (paymentState === 'Settled' || paymentState === 'Authorized') {
      statusLabel = 'Payment successful!';
    } else if (paymentState === 'Declined' || paymentState === 'Failed') {
      statusLabel = 'Payment failed';
    }
  }

  const totalWithTax = typeof order?.totalWithTax === 'number' ? order.totalWithTax / 100 : 0;
  const subTotalWithTax = typeof order?.subTotalWithTax === 'number' ? order.subTotalWithTax / 100 : 0;
  const shippingWithTax = typeof order?.shippingWithTax === 'number' ? order.shippingWithTax / 100 : 0;
  const discountsTotal = (order?.discounts ?? []).reduce((sum: number, d: any) => {
    const amount = typeof d?.amountWithTax === 'number' ? d.amountWithTax : 0;
    return sum + amount / 100;
  }, 0);

  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  return (
    <main className="main checkout-confirmation pt-7 pb-10">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="title title-simple">Order Confirmation</h1>
          <p className="text-grey mb-0">Order code: <strong>{code}</strong></p>
          <p className="text-primary font-weight-semi-bold mt-2">{statusLabel}</p>
          {paymentIntent && (
            <p className="text-muted mb-0">Payment Intent: {paymentIntent}</p>
          )}
          {redirectStatus && (
            <p className="text-muted mb-0 text-capitalize">Stripe status: {redirectStatus}</p>
          )}
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                {loading && !order ? (
                  <p className="text-center mb-0">Fetching latest order status…</p>
                ) : order ? (
                  <>
                    {usedFallback && (
                      <p className="text-warning mb-3">
                        Showing latest active order details because this order could not be retrieved directly.
                      </p>
                    )}
                    <h3 className="title title-simple text-left text-uppercase">Order Summary</h3>
                    <table className="table table-order table-bordered text-left mt-3">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th className="text-right">Quantity</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.lines ?? []).map((line: any) => (
                          <tr key={line.id}>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="font-weight-semi-bold">{line.productVariant?.name}</span>
                                {line.productVariant?.product?.slug && (
                                  <Link href={`/products/${line.productVariant.product.slug}`} className="text-primary">
                                    View product
                                  </Link>
                                )}
                              </div>
                            </td>
                            <td className="text-right">{line.quantity}</td>
                            <td className="text-right">${toDecimal((line.discountedLinePriceWithTax ?? 0) / 100)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="order-totals text-right">
                      <p className="mb-1">Subtotal: <strong>${toDecimal(subTotalWithTax)}</strong></p>
                      <p className="mb-1">Shipping: <strong>${toDecimal(shippingWithTax)}</strong></p>
                      {discountsTotal !== 0 && (
                        <p className="mb-1 text-success">Discounts: <strong>- ${toDecimal(Math.abs(discountsTotal))}</strong></p>
                      )}
                      <h4 className="mt-3">Grand Total: <strong>${toDecimal(totalWithTax)}</strong></h4>
                    </div>

                    <div className="mt-4">
                      <p className="mb-1">Payment method: <strong>{payment?.method || 'Stripe'}</strong></p>
                      <p className="mb-1">Payment state: <strong>{paymentState}</strong></p>
                      {payment?.transactionId && (
                        <p className="mb-1">Transaction ID: <strong>{payment.transactionId}</strong></p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-center mb-0 text-danger">We could not find this order. Please contact support.</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <Link href="/" className="btn btn-primary btn-rounded mr-3">
                Continue Shopping
              </Link>
              {/* <Link href="/order" className="btn btn-outline btn-dark btn-rounded">
                View Orders
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
