'use client'

import { FormEvent, useMemo, useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';

import { ORDER_TRACKING } from '@/graphql/cart';
import ALink from '~/components/features/custom-link';
import { toDecimal } from '~/utils';

const ORDER_CODE_PATTERN = /^[A-Za-z0-9_-]{3,}$/;

type OrderTrackingResponse = {
  orderByCode: any;
};

type FormErrors = {
  code?: string;
  email?: string;
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function Page() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const [trackOrder, { data, loading, error, called }] = useLazyQuery<OrderTrackingResponse>(ORDER_TRACKING, {
    fetchPolicy: 'network-only',
  });

  const order = data?.orderByCode ?? null;
  const customerEmail = order?.customer?.emailAddress ? normalizeEmail(order.customer.emailAddress) : null;
  const emailMatches = submittedEmail && customerEmail ? normalizeEmail(submittedEmail) === customerEmail : null;
  const totalLines = (order?.lines ?? []).reduce((sum: number, line: any) => sum + Number(line.quantity ?? 0), 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!code.trim()) {
      nextErrors.code = 'Please enter your order number.';
    } else if (!ORDER_CODE_PATTERN.test(code.trim())) {
      nextErrors.code = 'Order number must contain only letters, numbers, dashes or underscores.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Please enter the email used at checkout.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmittedEmail(email.trim());
    trackOrder({ variables: { code: code.trim() } });
  };

  const orderStateLabel = useMemo(() => {
    if (!order?.state) return 'Unknown';
    switch (order.state) {
      case 'PaymentAuthorized':
        return 'Payment Authorized';
      case 'PaymentSettled':
        return 'Payment Settled';
      case 'Fulfilled':
        return 'Fulfilled';
      case 'PartiallyFulfilled':
        return 'Partially Fulfilled';
      case 'Shipped':
        return 'Shipped';
      case 'Delivered':
        return 'Delivered';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return order.state.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
  }, [order?.state]);

  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li>
              <ALink href="/">
                <i className="d-icon-home"></i>
              </ALink>
            </li>
            <li>Track My Order</li>
          </ul>
        </div>
      </nav>

      <div className="page-header pl-4 pr-4" style={{ backgroundColor: '#3C63A4' }}>
        <div className="container">
          <h1 className="page-title font-weight-bold lh-1 text-white text-capitalize">Track My Order</h1>
          <p className="page-desc text-white mb-0">Enter your order number and email to see the latest status.</p>
        </div>
      </div>

      <div className="page-content mt-10 pt-10 pb-10">
        <div className="container">
          <section>
            <h2 className="mb-4">Order Lookup</h2>
            <form className="row cols-md-2" onSubmit={handleSubmit} noValidate>
              <div className="col-md-6 mb-4">
                <label htmlFor="order-code" className="form-label">
                  Order Number
                </label>
                <input
                  id="order-code"
                  className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                  name="order"
                  placeholder="e.g. TZ123456"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  autoComplete="off"
                  required
                />
                {errors.code ? <div className="invalid-feedback">{errors.code}</div> : null}
              </div>
              <div className="col-md-6 mb-4">
                <label htmlFor="order-email" className="form-label">
                  Email
                </label>
                <input
                  id="order-email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
                {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
              </div>
              <div className="col-12">
                <button className="btn btn-dark btn-rounded" type="submit" disabled={loading}>
                  {loading ? 'Checking…' : 'Track Order'}
                </button>
              </div>
            </form>
            <p className="mt-4 text-grey">
              For carrier tracking, please allow up to 24–48 hours after shipment for updates to appear.
            </p>
          </section>

          <section className="mt-8">
            {error ? (
              <div className="alert alert-danger">
                We could not look up that order right now. Please double-check the details and try again.
              </div>
            ) : null}

            {called && !loading && !error && !order ? (
              <div className="alert alert-warning">
                We couldn&apos;t find an order with code <strong>{code}</strong>. Please verify the details.
              </div>
            ) : null}

            {order && emailMatches === false ? (
              <div className="alert alert-danger text-white">
                The email you entered does not match the customer email on this order.
              </div>
            ) : null}

            {order && emailMatches && (
              <div className="row gutter-lg">
                <div className="col-lg-5 mb-6">
                  <div className="card">
                    <div className="card-body">
                      <h3 className="card-title mb-3">Order Summary</h3>
                      <ul className="list-style-none font-primary">
                        <li className="mb-2">
                          <strong>Order Code:</strong> <span className="ml-1">{order.code}</span>
                        </li>
                        <li className="mb-2">
                          <strong>Status:</strong> <span className="ml-1 text-uppercase">{orderStateLabel}</span>
                        </li>
                        <li className="mb-2">
                          <strong>Placed:</strong> <span className="ml-1">{formatDate(order.orderPlacedAt ?? order.createdAt)}</span>
                        </li>
                        <li className="mb-2">
                          <strong>Updated:</strong> <span className="ml-1">{formatDate(order.updatedAt)}</span>
                        </li>
                        <li className="mb-2">
                          <strong>Total Items:</strong> <span className="ml-1">{totalLines}</span>
                        </li>
                        <li className="mb-2">
                          <strong>Order Total:</strong> <span className="ml-1">{toDecimal(order.totalWithTax)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="card mt-4">
                    <div className="card-body">
                      <h3 className="card-title mb-3">Shipping Information</h3>
                      {order.shippingAddress ? (
                        <address className="mb-0 text-body">
                          {order.shippingAddress.fullName ?? '—'}<br />
                          {order.shippingAddress.company ? <>{order.shippingAddress.company}<br /></> : null}
                          {order.shippingAddress.streetLine1}<br />
                          {order.shippingAddress.streetLine2 ? <>{order.shippingAddress.streetLine2}<br /></> : null}
                          {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                          {order.shippingAddress.postalCode}<br />
                          {order.shippingAddress.countryCode}
                          {order.shippingAddress.phoneNumber ? (
                            <>
                              <br />
                              <strong>Phone:</strong> {order.shippingAddress.phoneNumber}
                            </>
                          ) : null}
                        </address>
                      ) : (
                        <p className="mb-0">Shipping address not set.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-7 mb-6">
                  <div className="card">
                    <div className="card-body">
                      <h3 className="card-title mb-4">Fulfillment &amp; Tracking</h3>
                      {order.fulfillments && order.fulfillments.length > 0 ? (
                        <ul className="timeline">
                          {order.fulfillments.map((fulfillment: any) => (
                            <li key={fulfillment.id} className="timeline-item mb-4">
                              <div className="timeline-point bg-dark"></div>
                              <div className="timeline-content">
                                <h4 className="timeline-title mb-1">{fulfillment.state}</h4>
                                <p className="mb-1 text-grey">
                                  Updated {formatDate(fulfillment.updatedAt)}
                                  {fulfillment.method ? ` · ${fulfillment.method}` : ''}
                                </p>
                                {fulfillment.trackingCode ? (
                                  <p className="mb-1">
                                    <strong>Tracking code:</strong> {fulfillment.trackingCode}
                                  </p>
                                ) : null}
                                {fulfillment.lines && fulfillment.lines.length > 0 ? (
                                  <ul className="list list-circle">
                                    {fulfillment.lines.map((line: any, index: number) => (
                                      <li key={`${fulfillment.id}-${index}`}>
                                        {line.quantity} × {line.orderLine?.productVariant?.name ?? 'Item'}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mb-0">This order has not been fulfilled yet. We&apos;ll update tracking details once available.</p>
                      )}
                    </div>
                  </div>

                  <div className="card mt-4">
                    <div className="card-body">
                      <h3 className="card-title mb-3">Items</h3>
                      <div className="table-responsive">
                        <table className="table table-striped table-order-items mb-0">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th className="text-center">Qty</th>
                              <th className="text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.lines.map((line: any) => (
                              <tr key={line.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {line.productVariant?.featuredAsset?.preview ? (
                                      <figure className="mr-3" style={{ width: 64, height: 64 }}>
                                        <img
                                          src={line.productVariant.featuredAsset.preview}
                                          alt={line.productVariant?.name ?? 'Product image'}
                                          className="w-100 h-100 object-cover rounded"
                                        />
                                      </figure>
                                    ) : null}
                                    <div>
                                      <p className="mb-0 font-weight-semi-bold">{line.productVariant?.name ?? 'Product'}</p>
                                      {line.productVariant?.sku ? (
                                        <span className="text-grey">SKU: {line.productVariant.sku}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">{line.quantity}</td>
                                <td className="text-right">{toDecimal(line.discountedLinePriceWithTax)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="card mt-4">
                    <div className="card-body">
                      <h3 className="card-title mb-3">Payments</h3>
                      {order.payments && order.payments.length > 0 ? (
                        <ul className="list-style-none mb-0">
                          {order.payments.map((payment: any) => (
                            <li key={payment.id} className="mb-2">
                              <strong>{payment.method}</strong> — {payment.state}
                              {payment.transactionId ? ` (Ref: ${payment.transactionId})` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mb-0">No payments recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <p className="mt-6">
            Need assistance? <ALink href="/contact-us">Contact Us</ALink>.
          </p>
        </div>
      </div>
    </main>
  );
}
