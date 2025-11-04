"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ALink from '~/components/features/custom-link';
import { useCart } from '@/context/cart/CartContext';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';

import { ELIGIBLE_COUNTRIES, ELIGIBLE_SHIPPING_METHODS, SET_CUSTOMER_FOR_ORDER, SET_ORDER_SHIPPING_ADDRESS, SET_ORDER_SHIPPING_METHOD } from '@/graphql/cart';
import { toDecimal } from '~/utils';
import { AddressForm, AddressFormValues } from '@/components/checkout/AddressForm';

function CheckoutPageClient() {
  const router = useRouter();
  const { order, items, refetch } = useCart();
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);

  useEffect(() => {
    const lineCount = order?.lines?.length ?? items.length;
    if (!lineCount) {
      router.push('/cart');
    }
  }, [items.length, order?.lines?.length, router]);

  const defaultAddress: AddressFormValues = {
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

  const [billingAddress, setBillingAddress] = useState<AddressFormValues>({ ...defaultAddress });
  const [shippingAddressOverride, setShippingAddressOverride] = useState<AddressFormValues>({ ...defaultAddress });

  const { data: countriesData } = useQuery<{ availableCountries: { code: string; name: string }[] }>(ELIGIBLE_COUNTRIES);
  const { data: shippingData, loading: shippingLoading } = useQuery<{ eligibleShippingMethods: any[] }>(ELIGIBLE_SHIPPING_METHODS);
  const shippingMethods = shippingData?.eligibleShippingMethods ?? [];
  const [setShippingAddress, { loading: savingAddress }] = useMutation(SET_ORDER_SHIPPING_ADDRESS);
  const [setShippingMethod, { loading: settingShipping }] = useMutation(SET_ORDER_SHIPPING_METHOD);
  const [setCustomerForOrderMutation] = useMutation(SET_CUSTOMER_FOR_ORDER);

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
  }, [order?.shippingAddress, useDifferentAddress]);

  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState('');

  useEffect(() => {
    if (!order?.id) {
      setEmailAddress('');
      return;
    }
    const savedEmail = order?.customer?.emailAddress ?? '';
    setEmailAddress(savedEmail);
  }, [order?.id, order?.customer?.emailAddress]);

  const handleEmailChange = (value: string) => {
    setEmailAddress(value);
  };

  const billingComplete =
    billingAddress.firstName &&
    billingAddress.lastName &&
    billingAddress.address1 &&
    billingAddress.city &&
    billingAddress.countryCode &&
    emailAddress.trim();
  const shippingForm = useDifferentAddress ? shippingAddressOverride : billingAddress;
  const shippingComplete = shippingForm.firstName && shippingForm.lastName && shippingForm.address1 && shippingForm.city && shippingForm.countryCode;

  useEffect(() => {
    const current = order?.shippingLines?.[0]?.shippingMethod?.id ?? null;
    setSelectedShippingId(current);
  }, [order?.shippingLines]);

  // Auto-select shipping effect moved below to access saveCheckoutDetails


  // const clearCartIfOrderCompleted = useCallback(async () => {
  //   try {
  //     const result = await refetch();
  //     const active = (result?.data as { activeOrder?: any } | undefined)?.activeOrder;
  //     if (!active) {
  //       await clearCart();
  //     }
  //   } catch (error) {
  //     console.warn('Unable to verify order completion before clearing cart', error);
  //   }
  // }, [refetch, clearCart]);

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

  const lastSavedKeyRef = useRef<string | null>(null);

  const updateAddressField = (
    setter: React.Dispatch<React.SetStateAction<AddressFormValues>>,
    field: keyof AddressFormValues,
    value: string
  ) => {
    setter((prev) => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  };

  const saveCheckoutDetails = async (options?: { silent?: boolean }) => {
    const { silent = false } = options ?? {};

    if (!order) {
      toast.error('No active order found. Please add items to your cart and try again.');
      await refetch();
      return { success: false as const };
    }

    const targetAddress = useDifferentAddress ? shippingAddressOverride : billingAddress;

    const trimmedEmail = emailAddress.trim();
    const emailChanged = trimmedEmail !== (order?.customer?.emailAddress ?? '').trim();

    const addressKey = JSON.stringify({
      billing: billingAddress,
      shipping: shippingAddressOverride,
      shippingId: selectedShippingId,
      useDifferentAddress,
      email: trimmedEmail,
    });

    if (lastSavedKeyRef.current === addressKey) {
      if (!silent) {
        toast.success('Checkout details already saved.');
      }
      return { success: true as const, order };
    }

    if (!trimmedEmail) {
      toast.error('Please enter a valid email address.');
      return { success: false as const };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return { success: false as const };
    }

    const shippingFullName = `${targetAddress.firstName} ${targetAddress.lastName}`.trim();

    try {
      if (emailChanged || !order?.customer?.id) {
        const { data } = await setCustomerForOrderMutation({
          variables: {
            input: {
              emailAddress: trimmedEmail,
              firstName: billingAddress.firstName,
              lastName: billingAddress.lastName,
            },
          },
        });
        const customerResult = (data as { setCustomerForOrder?: any } | undefined)?.setCustomerForOrder;
        if (!customerResult || customerResult.__typename !== 'Order') {
          const message = customerResult?.message || 'Unable to save customer details. Please check the email address.';
          toast.error(message);
          return { success: false as const };
        }
      }

      await setShippingAddress({
        variables: {
          input: {
            fullName: shippingFullName,
            company: targetAddress.company || null,
            streetLine1: targetAddress.address1,
            streetLine2: targetAddress.address2 || null,
            city: targetAddress.city,
            province: targetAddress.state || null,
            postalCode: targetAddress.postalCode,
            countryCode: targetAddress.countryCode,
            phoneNumber: targetAddress.phone || null,
          },
        },
      });

      const currentShippingMethodId = order?.shippingLines?.[0]?.shippingMethod?.id ?? null;
      if (selectedShippingId && selectedShippingId !== currentShippingMethodId) {
        await setShippingMethod({ variables: { shippingMethodId: [selectedShippingId] } });
      }

      if (!silent) {
        toast.success('Checkout details saved.');
      }

      lastSavedKeyRef.current = addressKey;
      let refreshedOrder: any | null = order;
      try {
        const result = await refetch();
        const latestOrder = (result?.data as { activeOrder?: any } | undefined)?.activeOrder;
        if (latestOrder) {
          refreshedOrder = latestOrder;
        }
      } catch (error) {
        console.warn('Unable to refresh order after saving checkout details', error);
      }

      return { success: true as const, order: refreshedOrder };
    } catch (error: any) {
      toast.error(error?.message || 'Unable to save checkout details. Please review and try again.');
      return { success: false as const };
    }
  };

  useEffect(() => {
    // Auto select default shipping only AFTER checkout details are saved
    if (!order) return;
    if (selectedShippingId) return;
    if (shippingLoading) return;
    if (!shippingMethods.length) return;
    // Require complete address info before auto-selecting shipping
    if (!billingComplete || !shippingComplete) return;
    const defaultMethodId = shippingMethods[0]?.id;
    if (!defaultMethodId) return;
    (async () => {
      try {
        const saveResult = await saveCheckoutDetails({ silent: true });
        if (!saveResult.success) return;
        const latestOrder = saveResult.order ?? order;
        const currentShippingMethodId = latestOrder?.shippingLines?.[0]?.shippingMethod?.id ?? null;
        if (defaultMethodId !== currentShippingMethodId) {
          await setShippingMethod({ variables: { shippingMethodId: [defaultMethodId] } });
          setSelectedShippingId(defaultMethodId);
          await refetch();
        }
      } catch (error) {
        console.warn('Auto-select shipping method failed', error);
      }
      return;
    })();
  }, [order?.id, selectedShippingId, shippingLoading, shippingMethods, setShippingMethod, billingComplete, shippingComplete, saveCheckoutDetails]);

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
      await refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update shipping.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const saveResult = await saveCheckoutDetails();
    if (!saveResult.success) {
      return;
    }
    router.push('/checkout/payment');
  };

  // useEffect(() => {
  //   if (stripeStatusMessage && stripeStatusMessage.includes('completed')) {
  //     void (async () => {
  //       await clearCartIfOrderCompleted();
  //     })();
  //   }
  // }, [stripeStatusMessage, clearCartIfOrderCompleted]);

  return (
    <main className="main checkout">
      <div className={`page-content pt-7 pb-10 ${items.length > 0 ? 'mb-10' : 'mb-2'}`}>
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step"><ALink href="/cart">1. Shopping Cart</ALink></h3>
          <h3 className="title title-simple title-step active"><ALink href="#">2. Checkout</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/checkout/payment">3. Payment</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/order">4. Order Complete</ALink></h3>
        </div>
        <div className="container mt-7">
          {items.length > 0 ? (
            <>
              <form className="form" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-7 mb-6 mb-lg-0 pr-lg-4">
                    <h3 className="title title-simple text-left text-uppercase">Billing Details</h3>
                    <AddressForm
                      idPrefix="billing"
                      address={billingAddress}
                      countries={countries}
                      onFieldChange={(field, value) => updateAddressField(setBillingAddress, field, value)}
                    />
                    <label htmlFor="billing-email">Email Address *</label>
                    <input
                      id="billing-email"
                      type="email"
                      className="form-control"
                      name="email-address"
                      value={emailAddress}
                      onChange={(event) => handleEmailChange(event.target.value)}
                      required
                    />

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
                        <AddressForm
                          idPrefix="shipping"
                          address={shippingAddressOverride}
                          countries={countries}
                          onFieldChange={(field, value) => updateAddressField(setShippingAddressOverride, field, value)}
                        />
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


                        <p className="text-grey mt-4 mb-4">
                          Payment method selection will be available on the next step.
                        </p>
                        <button
                          type="submit"
                          className="btn btn-dark btn-rounded btn-order"
                          disabled={
                            !order ||
                            savingAddress ||
                            settingShipping
                          }
                        >
                          {savingAddress || settingShipping ? 'Processing…' : 'Save & Continue to Payment'}
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

export default CheckoutPageClient;