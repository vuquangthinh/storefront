"use client";
import { useEffect, useMemo, useState } from "react";
import ALink from "~/components/features/custom-link";
import Quantity from "~/components/features/quantity";
import { toDecimal } from "~/utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";

import { useCart } from "@/context/cart/CartContext";
import { APPLY_COUPON, ELIGIBLE_SHIPPING_METHODS, REMOVE_COUPON, SET_ORDER_SHIPPING_METHOD } from "@/graphql/cart";

export default function CartPage() {
  const { order, items, adjustLine, removeLine, refetch } = useCart();
  const [coupon, setCoupon] = useState("");
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);

  const { data: shippingData, loading: shippingLoading } = useQuery<{ eligibleShippingMethods: any[] }>(ELIGIBLE_SHIPPING_METHODS);
  const shippingMethods = shippingData?.eligibleShippingMethods ?? [];

  const [applyCouponMutation, { loading: applyingCoupon }] = useMutation(APPLY_COUPON);
  const [removeCouponMutation, { loading: removingCoupon }] = useMutation(REMOVE_COUPON);
  const [setShippingMethod, { loading: settingShipping }] = useMutation(SET_ORDER_SHIPPING_METHOD);

  useEffect(() => {
    const current = order?.shippingLines?.[0]?.shippingMethod?.id ?? null;
    const onlyOption = !current && shippingMethods.length === 1 ? shippingMethods[0]?.id ?? null : current;
    setSelectedShippingId(onlyOption);
    if (!current && onlyOption) {
      handleShippingChange(onlyOption);
    }
  }, [order?.shippingLines, shippingMethods]);

  const handleShippingChange = async (shippingMethodId: string) => {
    setSelectedShippingId(shippingMethodId);
    try {
      const { data } = await setShippingMethod({ variables: { shippingMethodId: [shippingMethodId] } });
      const result = (data as any)?.setOrderShippingMethod;
      if (result?.__typename === "Order") {
        await refetch();
        // toast.success("Shipping updated.");
      } else {
        toast.error(result?.message || "Failed to update shipping.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update shipping.");
    }
  };

  const subtotal = useMemo(() => {
    return (order?.subTotalWithTax ?? 0) / 100;
  }, [order?.subTotalWithTax]);

  const total = useMemo(() => {
    return (order?.totalWithTax ?? 0) / 100;
  }, [order]);

  const shippingCost = useMemo(() => {
    return (order?.shippingWithTax ?? 0) / 100;
  }, [order]);

  return (
    <div className="main cart">
      <div className="page-content pt-7 pb-10">
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step active"><ALink href="#">1. Shopping Cart</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/checkout">2. Checkout</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/checkout/payment">3. Payment</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="#">4. Order Complete</ALink></h3>
        </div>

        <div className="container mt-7 mb-2">
          <div className="row">
            {items.length > 0 ? (
              <>
                <div className="col-lg-8 col-md-12 pr-lg-4">
                  <table className="shop-table cart-table">
                    <thead>
                      <tr>
                        <th><span>Product</span></th>
                        <th></th>
                        <th><span>Price</span></th>
                        <th><span>quantity</span></th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((line) => {
                        const href = line.productSlug ? `/product/default/${line.productSlug}` : "#";
                        const unit = line.price;
                        const lineTotal = line.totalWithTax;
                        const img = line.image || "";
                        return (
                          <tr key={line.lineId}>
                            <td className="product-thumbnail">
                              <figure>
                                <ALink href={href}>
                                  <img src={img} width="100" height="100" alt="product" />
                                </ALink>
                              </figure>
                            </td>
                            <td className="product-name">
                              <div className="product-name-section">
                                <ALink href={href}>{line.name}</ALink>
                              </div>
                            </td>
                            <td className="product-subtotal">
                              <span className="amount">${toDecimal(unit)}</span>
                            </td>
                            <td className="product-quantity">
                              <Quantity
                                qty={Number(line.qty) || 0}
                                max={100}
                                onChangeQty={(q: number) => {
                                  adjustLine(line.lineId, q);
                                }}
                              />
                            </td>
                            <td className="product-price">
                              <span className="amount">${toDecimal(lineTotal)}</span>
                            </td>
                            <td className="product-close">
                              <ALink href="#" className="product-remove" title="Remove this product" onClick={() => removeLine(line.lineId)}>
                                <i className="fas fa-times"></i>
                              </ALink>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="cart-actions mb-6 pt-4">
                    <ALink href="/products" className="btn btn-dark btn-md btn-rounded btn-icon-left mr-4 mb-4"><i className="d-icon-arrow-left"></i>Continue Shopping</ALink>
                    <button
                      type="button"
                      className={`btn btn-outline btn-dark btn-md btn-rounded${order ? "" : " btn-disabled"}`}
                      disabled={!order}
                      onClick={async () => {
                        await refetch();
                        toast.info("Cart refreshed.");
                      }}
                    >
                      Update Cart
                    </button>
                  </div>

                  <div className="cart-coupon-box mb-8">
                    <h4 className="title coupon-title text-uppercase ls-m">Coupon Discount</h4>
                    <input
                      type="text"
                      name="coupon_code"
                      className="input-text form-control text-grey ls-m mb-4"
                      id="coupon_code"
                      placeholder="Enter coupon code here..."
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-md btn-dark btn-rounded btn-outline"
                      disabled={!coupon || applyingCoupon}
                      onClick={async () => {
                        if (!coupon) return;
                        try {
                          const { data } = await applyCouponMutation({ variables: { couponCode: coupon } });
                          const result = (data as any)?.applyCouponCode;
                          if (result?.__typename === "Order") {
                            await refetch();
                            toast.success("Coupon applied.");
                            setCoupon("");
                          } else {
                            toast.error(result?.message || "Coupon invalid.");
                          }
                        } catch (error: any) {
                          toast.error(error?.message || "Failed to apply coupon.");
                        }
                      }}
                    >
                      {applyingCoupon ? "Applying..." : "Apply Coupon"}
                    </button>
                    {order?.couponCodes?.length ? (
                      <div className="applied-coupons mt-8">
                        <h5 className="title title-simple text-left mb-2">Applied Coupons</h5>
                        <ul className="list-unstyled mb-0 p-0">
                          {order.couponCodes.map((code: string) => (
                            <li className="btn btn-primary btn-sm btn-rounded mr-2 mb-2" key={code}>
                              <span className="font-weight-semi-bold">{code}</span>
                              <button
                                type="button"
                                className="btn btn-rounded btn-secondary btn-md text-danger ml-2"
                                disabled={removingCoupon}
                                style={{
                                  paddingTop: 3,
                                  paddingBottom: 3,
                                  paddingLeft: 6,
                                  paddingRight: 6
                                }}
                                onClick={async () => {
                                  try {
                                    const { data } = await removeCouponMutation({ variables: { couponCode: code } });
                                    const result = (data as any)?.removeCouponCode;
                                    if (result?.__typename === "Order") {
                                      await refetch();
                                      toast.info(`Coupon '${code}' removed.`);
                                    } else {
                                      toast.error(result?.message || "Unable to remove coupon.");
                                    }
                                  } catch (error: any) {
                                    toast.error(error?.message || "Unable to remove coupon.");
                                  }
                                }}
                              >
                                {removingCoupon ? "..." : "×"}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>

                <aside className="col-lg-4 sticky-sidebar-wrapper">
                  <div className="sticky-sidebar" data-sticky-options="{'bottom': 20}">
                    <div className="summary mb-4">
                      <h3 className="summary-title text-left">Cart Totals</h3>
                      <table className="shipping">
                        <tbody>
                          <tr className="summary-subtotal">
                            <td><h4 className="summary-subtitle">Subtotal</h4></td>
                            <td><p className="summary-subtotal-price">${toDecimal(subtotal)}</p></td>
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
                                    const inputId = `shipping-${methodId}`;
                                    const checked = selectedShippingId ? selectedShippingId === methodId : false;
                                    return (
                                      <li key={methodId}>
                                        <div className="custom-radio">
                                          <input
                                            type="radio"
                                            id={inputId}
                                            name="shipping"
                                            className="custom-control-input"
                                            checked={checked}
                                            onChange={() => handleShippingChange(methodId)}
                                            disabled={settingShipping}
                                          />
                                          <label className="custom-control-label" htmlFor={inputId}>
                                            {method.name}
                                            <span className="ml-2 text-grey">
                                              ({priceValue === 0 ? "Free" : `$${toDecimal(priceValue)}`})
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
                        </tbody>
                      </table>

                      {/* <div className="shipping-address">
                        <label>Shipping to <strong>CA.</strong></label>
                        <div className="select-box">
                          <select name="country" className="form-control" defaultValue="us">
                            <option value="us">United States (US)</option>
                            <option value="uk">United Kingdom</option>
                            <option value="fr">France</option>
                            <option value="aus">Austria</option>
                          </select>
                        </div>
                        <div className="select-box">
                          <select name="state" className="form-control" defaultValue="ca">
                            <option value="ca">California</option>
                            <option value="ak">Alaska</option>
                            <option value="de">Delaware</option>
                            <option value="hi">Hawaii</option>
                          </select>
                        </div>
                        <input type="text" className="form-control" name="city" placeholder="Town / City" />
                        <input type="text" className="form-control" name="zip" placeholder="ZIP" />
                        <ALink href="#" className="btn btn-md btn-dark btn-rounded btn-outline">Update totals</ALink>
                      </div> */}

                      <table className="total">
                        <tbody>
                          <tr className="summary-shipping-total">
                            <td><h4 className="summary-subtitle">Shipping</h4></td>
                            <td><p className="summary-subtotal-price">${toDecimal(shippingCost)}</p></td>
                          </tr>
                          <tr className="summary-subtotal">
                            <td><h4 className="summary-subtitle">Total</h4></td>
                            <td><p className="summary-total-price ls-s">${toDecimal(total)}</p></td>
                          </tr>
                        </tbody>
                      </table>

                      <ALink href="/checkout" className="btn btn-dark btn-rounded btn-checkout">Proceed to checkout</ALink>
                    </div>
                  </div>
                </aside>
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
      </div>
    </div>
  );
}
