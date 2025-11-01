"use client";
import { useEffect, useMemo, useState } from 'react';
import ALink from '~/components/features/custom-link';
import { useCart } from '@/context/cart/CartContext';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';

import {
  ADD_PAYMENT_TO_ORDER,
  ELIGIBLE_COUNTRIES,
  ELIGIBLE_PAYMENT_METHODS,
  ELIGIBLE_SHIPPING_METHODS,
  SET_ORDER_SHIPPING_ADDRESS,
  SET_ORDER_SHIPPING_METHOD,
} from '@/graphql/cart';
import { toDecimal } from '~/utils';

export default function CheckoutPageClient() {
  const { order, items, refetch } = useCart();
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);

  const defaultAddress = {
    firstName: '',
    lastName: '',
    company: '',
    countryCode: 'US',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  };

  const [billingAddress, setBillingAddress] = useState(defaultAddress);
  const [shippingAddressOverride, setShippingAddressOverride] = useState(defaultAddress);

  const { data: countriesData } = useQuery<{ availableCountries: { code: string; name: string }[] }>(ELIGIBLE_COUNTRIES);
  const { data: shippingData, loading: shippingLoading } = useQuery<{ eligibleShippingMethods: any[] }>(ELIGIBLE_SHIPPING_METHODS);
  const shippingMethods = shippingData?.eligibleShippingMethods ?? [];
  const { data: paymentData, loading: paymentLoading } = useQuery<{ eligiblePaymentMethods: any[] }>(ELIGIBLE_PAYMENT_METHODS);
  const paymentMethods = (paymentData?.eligiblePaymentMethods ?? []).filter((method: any) => method?.isEligible !== false);

  const [setShippingAddress, { loading: savingAddress }] = useMutation(SET_ORDER_SHIPPING_ADDRESS, {
    onCompleted: () => refetch(),
  });
  const [setShippingMethod, { loading: settingShipping }] = useMutation(SET_ORDER_SHIPPING_METHOD, {
    onCompleted: () => refetch(),
  });
  const [addPaymentToOrder, { loading: addingPayment }] = useMutation(ADD_PAYMENT_TO_ORDER, {
    onCompleted: () => refetch(),
  });

  useEffect(() => {
    const shippingAddress = order?.shippingAddress;
    if (!shippingAddress) return;

    const fullNameParts = (shippingAddress.fullName || '').trim().split(' ');
    const firstName = fullNameParts.shift() || '';
    const lastName = fullNameParts.join(' ');

    const formatted = {
      firstName,
      lastName,
      company: shippingAddress.company || '',
      countryCode: shippingAddress.countryCode || '',
      address1: shippingAddress.streetLine1 || '',
      address2: shippingAddress.streetLine2 || '',
      city: shippingAddress.city || '',
      state: shippingAddress.province || '',
      postalCode: shippingAddress.postalCode || '',
      phone: shippingAddress.phoneNumber || '',
    };

    setBillingAddress(formatted);
    if (!useDifferentAddress) {
      setShippingAddressOverride(formatted);
    }
  }, [order?.shippingAddress]);

  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string | null>(null);

  useEffect(() => {
    const current = order?.shippingLines?.[0]?.shippingMethod?.id ?? null;
    setSelectedShippingId(current);
  }, [order?.shippingLines]);

  useEffect(() => {
    if (selectedPaymentCode) return;
    const preset = order?.payments?.[0]?.method ?? null;
    if (preset) {
      setSelectedPaymentCode(preset);
      return;
    }
    if (paymentMethods.length > 0) {
      setSelectedPaymentCode(paymentMethods[0]?.code ?? null);
    }
  }, [order?.payments, paymentMethods, selectedPaymentCode]);

  const subtotal = useMemo(() => {
    if (typeof order?.subTotalWithTax === 'number') {
      return order.subTotalWithTax / 100;
    }
    return items.reduce((sum, it) => sum + (Number(it.price) || 0) * Number(it.qty || 0), 0);
  }, [items, order?.subTotalWithTax]);

  const shippingTotal = useMemo(() => {
    return (order?.shippingWithTax ?? 0) / 100;
  }, [order?.shippingWithTax]);

  const discountTotal = useMemo(() => {
    if (!order?.discounts?.length) return 0;
    return (order.discounts as { amountWithTax?: number | null }[]).reduce((sum, disc) => {
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

  const countries = countriesData?.availableCountries ?? [];

  const updateAddressField = (
    setter: React.Dispatch<React.SetStateAction<typeof defaultAddress>>,
    field: keyof typeof defaultAddress,
    value: string
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = async (shippingMethodId: string) => {
    if (!order) {
      toast.error('No active order. Please review your cart.');
      await refetch();
      return;
    }
    setSelectedShippingId(shippingMethodId);
    try {
      await setShippingMethod({ variables: { shippingMethodId: [shippingMethodId] } });
      toast.success('Shipping method updated.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update shipping.');
    }
  };

  const handlePaymentChange = (code: string) => {
    setSelectedPaymentCode(code);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order) {
      toast.error('No active order found. Please add items to your cart and try again.');
      await refetch();
      return;
    }
    const billingFullName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();
    const shippingForm = useDifferentAddress ? shippingAddressOverride : billingAddress;
    const shippingFullName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
    try {
      await setShippingAddress({
        variables: {
          input: {
            fullName: shippingFullName,
            company: shippingForm.company || null,
            streetLine1: shippingForm.address1,
            streetLine2: shippingForm.address2 || null,
            city: shippingForm.city,
            province: shippingForm.state || null,
            postalCode: shippingForm.postalCode,
            countryCode: shippingForm.countryCode,
            phoneNumber: shippingForm.phone || null,
          },
        },
      });
      if (selectedShippingId) {
        await setShippingMethod({ variables: { shippingMethodId: [selectedShippingId] } });
      }
      if (selectedPaymentCode) {
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
      }
      toast.success('Checkout details saved.');
    } catch {
      /* Keep form visible for retry */
      toast.error('Unable to save checkout details. Please review and try again.');
    }
  };

  return (
    <main className="main checkout">
      <div className={`page-content pt-7 pb-10 ${items.length > 0 ? 'mb-10' : 'mb-2'}`}>
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step"><ALink href="/cart">1. Shopping Cart</ALink></h3>
          <h3 className="title title-simple title-step active"><ALink href="#">2. Checkout</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/order">3. Order Complete</ALink></h3>
        </div>
        <div className="container mt-7">
          {items.length > 0 ? (
            <>
              <form className="form" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-7 mb-6 mb-lg-0 pr-lg-4">
                    <h3 className="title title-simple text-left text-uppercase">Billing Details</h3>
                    <div className="row">
                      <div className="col-xs-6">
                        <label>First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="first-name"
                          required
                          value={billingAddress.firstName}
                          onChange={(event) => updateAddressField(setBillingAddress, 'firstName', event.target.value)}
                        />
                      </div>
                      <div className="col-xs-6">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="last-name"
                          required
                          value={billingAddress.lastName}
                          onChange={(event) => updateAddressField(setBillingAddress, 'lastName', event.target.value)}
                        />
                      </div>
                    </div>
                    <label>Company Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="company-name"
                      value={billingAddress.company}
                      onChange={(event) => updateAddressField(setBillingAddress, 'company', event.target.value)}
                    />
                    <label>Country / Region *</label>
                    <div className="select-box">
                      <select
                        name="country"
                        className="form-control"
                        value={billingAddress.countryCode || ''}
                        onChange={(event) => updateAddressField(setBillingAddress, 'countryCode', event.target.value)}
                        required
                      >
                        <option value="" disabled>Select country</option>
                        {countries.map((c) => (
                          <option key={`country-${c.code}`} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label>Street Address *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address1"
                      placeholder="House number and street name"
                      value={billingAddress.address1}
                      onChange={(event) => updateAddressField(setBillingAddress, 'address1', event.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      name="address2"
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      value={billingAddress.address2}
                      onChange={(event) => updateAddressField(setBillingAddress, 'address2', event.target.value)}
                    />
                    <div className="row">
                      <div className="col-xs-6">
                        <label>Town / City *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={billingAddress.city}
                          onChange={(event) => updateAddressField(setBillingAddress, 'city', event.target.value)}
                          required
                        />
                      </div>
                      <div className="col-xs-6">
                        <label>State *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={billingAddress.state}
                          onChange={(event) => updateAddressField(setBillingAddress, 'state', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-6">
                        <label>ZIP *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zip"
                          value={billingAddress.postalCode}
                          onChange={(event) => updateAddressField(setBillingAddress, 'postalCode', event.target.value)}
                          required
                        />
                      </div>
                      <div className="col-xs-6">
                        <label>Phone *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={billingAddress.phone}
                          onChange={(event) => updateAddressField(setBillingAddress, 'phone', event.target.value)}
                        />
                      </div>
                    </div>
                    <label>Email Address *</label>
                    <input type="text" className="form-control" name="email-address" />

                    {/* <div className="form-checkbox mb-0 pt-0">
                      <input type="checkbox" className="custom-checkbox" id="create-account" name="create-account" />
                      <label className='form-control-label ls-s' htmlFor='create-account'>Create an account?</label>
                    </div> */}

                    <div className="form-checkbox mb-6">
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        id="different-address"
                        name="different-address"
                        checked={useDifferentAddress}
                        onChange={(event) => {
                          const next = event.target.checked;
                          setUseDifferentAddress(next);
                          if (!next) {
                            setShippingAddressOverride(billingAddress);
                          }
                        }}
                      />
                      <label className='form-control-label ls-s' htmlFor='different-address'>Ship to a different address?</label>
                    </div>

                    {useDifferentAddress && (
                      <div className="mt-4">
                        <h3 className="title title-simple text-left text-uppercase">Shipping Address</h3>
                        <div className="row">
                          <div className="col-xs-6">
                            <label>First Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-first-name"
                              required
                              value={shippingAddressOverride.firstName}
                              onChange={(event) => updateAddressField(setShippingAddressOverride, 'firstName', event.target.value)}
                            />
                          </div>
                          <div className="col-xs-6">
                            <label>Last Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-last-name"
                              required
                              value={shippingAddressOverride.lastName}
                              onChange={(event) => updateAddressField(setShippingAddressOverride, 'lastName', event.target.value)}
                            />
                          </div>
                        </div>
                        <label>Company Name (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="shipping-company-name"
                          value={shippingAddressOverride.company}
                          onChange={(event) => updateAddressField(setShippingAddressOverride, 'company', event.target.value)}
                        />
                        <label>Country / Region *</label>
                        <div className="select-box">
                          <select
                            name="shipping-country"
                            className="form-control"
                            value={shippingAddressOverride.countryCode || ''}
                            onChange={(event) => updateAddressField(setShippingAddressOverride, 'countryCode', event.target.value)}
                            required
                          >
                            <option value="" disabled>Select country</option>
                            {countries.map((c) => (
                              <option key={`shipping-country-${c.code}`} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label>Street Address *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="shipping-address1"
                          placeholder="House number and street name"
                          value={shippingAddressOverride.address1}
                          onChange={(event) => updateAddressField(setShippingAddressOverride, 'address1', event.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="form-control"
                          name="shipping-address2"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                          value={shippingAddressOverride.address2}
                          onChange={(event) => updateAddressField(setShippingAddressOverride, 'address2', event.target.value)}
                        />
                        <div className="row">
                          <div className="col-xs-6">
                            <label>Town / City *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-city"
                              value={shippingAddressOverride.city}
                              onChange={(event) => updateAddressField(setShippingAddressOverride, 'city', event.target.value)}
                              required
                            />
                          </div>
                          <div className="col-xs-6">
                            <label>State *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-state"
                              value={shippingAddressOverride.state}
                              onChange={(event) => updateAddressField(setShippingAddressOverride, 'state', event.target.value)}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-xs-6">
                            <label>ZIP *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-zip"
                              value={shippingAddressOverride.postalCode}
                              onChange={(event) => updateAddressField(setShippingAddressOverride, 'postalCode', event.target.value)}
                              required
                            />
                          </div>
                          <div className="col-xs-6">
                            <label>Phone *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-phone"
                              value={shippingAddressOverride.phone}
                              onChange={(event) => updateAddressField(setShippingAddressOverride, 'phone', event.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <h2 className="title title-simple text-uppercase text-left mt-6">Additional Information</h2>
                    <label>Order Notes (Optional)</label>
                    <textarea className="form-control pb-2 pt-2 mb-0" cols={30} rows={5}
                      placeholder="Notes about your order, e.g. special notes for delivery"></textarea>
                  </div>

                  <aside className="col-lg-5 sticky-sidebar-wrapper">
                    <div className="sticky-sidebar mt-1" data-sticky-options="{'bottom': 50}">
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
                            {items.map((item) => (
                              <tr key={"checkout-" + item.name}>
                                <td className="product-name">{item.name} <span className="product-quantity">×&nbsp;{item.qty}</span></td>
                                <td className="product-total text-body">${toDecimal((Number(item.price) || 0) * Number(item.qty || 0))}</td>
                              </tr>
                            ))}

                            {discountTotal && (
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
                                  {shippingLoading ? (
                                    <li className="text-grey">Loading shipping methods…</li>
                                  ) : shippingMethods.length > 0 ? (
                                    shippingMethods.map((method: any) => {
                                      const methodId = method.id;
                                      const priceValue = (method.priceWithTax ?? method.price ?? 0) / 100;
                                      const inputId = `checkout-shipping-${methodId}`;
                                      const checked = selectedShippingId ? selectedShippingId === methodId : false;
                                      return (
                                        <li key={methodId}>
                                          <div className="custom-radio">
                                            <input
                                              type="radio"
                                              id={inputId}
                                              name="checkout-shipping"
                                              className="custom-control-input"
                                              checked={checked}
                                              onChange={() => handleShippingChange(methodId)}
                                              disabled={settingShipping}
                                            />
                                            <label className="custom-control-label" htmlFor={inputId}>
                                              {method.name}
                                              <span className="ml-2 text-grey">
                                                ({priceValue === 0 ? 'Free' : `$${toDecimal(priceValue)}`})
                                              </span>
                                            </label>
                                          </div>
                                        </li>
                                      );
                                    })
                                  ) : (
                                    <li className="text-grey">No shipping methods available.</li>
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

                        <div className="payment accordion radio-type">
                          <h4 className="summary-subtitle ls-m pb-3">Payment Methods</h4>
                          {paymentLoading ? (
                            <p className="text-grey mb-0">Loading payment methods…</p>
                          ) : paymentMethods.length > 0 ? (
                            <ul className="list-unstyled mb-0">
                              {paymentMethods.map((method: any) => {
                                const checked = selectedPaymentCode === method.code;
                                return (
                                  <li key={method.code} className="mb-2">
                                    <div className="custom-radio">
                                      <input
                                        type="radio"
                                        id={`payment-${method.code}`}
                                        name="payment-method"
                                        className="custom-control-input"
                                        checked={checked}
                                        onChange={() => handlePaymentChange(method.code)}
                                        disabled={addingPayment}
                                      />
                                      <label className="custom-control-label" htmlFor={`payment-${method.code}`}>
                                        {method.name || method.code}
                                      </label>
                                    </div>
                                    {method.description && (
                                      <p className="text-body lh-base mb-0 ml-4">{method.description}</p>
                                    )}
                                    {method.eligibilityMessage && (
                                      <p className="text-danger mb-0 ml-4">{method.eligibilityMessage}</p>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-grey mb-0">No payment methods available.</p>
                          )}
                        </div>

                        <div className="form-checkbox mt-4 mb-5">
                          <input type="checkbox" className="custom-checkbox" id="terms-condition" name="terms-condition" />
                          <label className="form-control-label" htmlFor="terms-condition">
                            I have read and agree to the website <ALink href="/terms-of-service">terms and conditions </ALink>*
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-dark btn-rounded btn-order"
                          disabled={!order || savingAddress || settingShipping || addingPayment || (paymentMethods.length > 0 && !selectedPaymentCode)}
                        >
                          {savingAddress || settingShipping || addingPayment ? 'Saving...' : 'Save & Continue'}
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              </form>
            </>
          ) : (
            <div className="empty-cart text-center">
              <p>Your cart is currently empty.</p>
              <i className="cart-empty d-icon-bag"></i>
              <p className="return-to-shop mb-0">
                <ALink className="button wc-backward btn btn-dark btn-md" href="/products">Return to shop</ALink>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
