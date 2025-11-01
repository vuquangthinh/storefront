"use client";
import { useMemo, useState } from "react";
import ALink from "~/components/features/custom-link";
import Quantity from "~/components/features/quantity";
import { toDecimal } from "~/utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const ACTIVE_ORDER = gql`
  query ACTIVE_ORDER {
    activeOrder {
      id
      code
      currencyCode
      subTotalWithTax
      totalWithTax
      shippingWithTax 
      discounts {
        amountWithTax
        description
      }
      couponCodes
      lines {
        id
        quantity
        discountedLinePriceWithTax
        productVariant {
          id
          name
          priceWithTax
          featuredAsset { preview }
          product { slug }
        }
      }
    }
  }
`;

const ADJUST_ORDER_LINE = gql`
  mutation ADJUST_ORDER_LINE($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      __typename
      ... on Order { id }
      ... on ErrorResult { message }
    }
  }
`;

const REMOVE_ORDER_LINE = gql`
  mutation REMOVE_ORDER_LINE($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      __typename
      ... on Order { id }
      ... on ErrorResult { message }
    }
  }
`;

const APPLY_COUPON = gql`
  mutation APPLY_COUPON($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      __typename
      ... on Order { id }
      ... on ErrorResult { message }
    }
  }
`;

export default function CartPage() {
  const { data, refetch } = useQuery<{ activeOrder: any }>(ACTIVE_ORDER);
  const order = data?.activeOrder;

  const [coupon, setCoupon] = useState("");
  const [adjustLine] = useMutation(ADJUST_ORDER_LINE, { onCompleted: () => refetch() });
  const [removeLine] = useMutation(REMOVE_ORDER_LINE, { onCompleted: () => refetch() });
  const [applyCoupon] = useMutation(APPLY_COUPON, { onCompleted: () => refetch() });

  const lines = order?.lines ?? [];

  const subtotal = useMemo(() => {
    return lines.reduce((sum: number, l: any) => sum + (l.discountedLinePriceWithTax || 0), 0) / 100;
  }, [lines]);

  const total = useMemo(() => {
    return (order?.totalWithTax || 0) / 100;
  }, [order]);

  return (
    <div className="main cart">
      <div className="page-content pt-7 pb-10">
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step active"><ALink href="#">1. Shopping Cart</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/pages/checkout">2. Checkout</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="#">3. Order Complete</ALink></h3>
        </div>

        <div className="container mt-7 mb-2">
          <div className="row">
            {lines.length > 0 ? (
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
                      {lines.map((line: any) => {
                        const pv = line.productVariant;
                        const unit = (pv?.priceWithTax || 0) / 100;
                        const lineTotal = (line.discountedLinePriceWithTax || 0) / 100;
                        const href = pv?.product?.slug ? `/product/default/${pv.product.slug}` : "#";
                        const img = pv?.featuredAsset?.preview || "";
                        return (
                          <tr key={line.id}>
                            <td className="product-thumbnail">
                              <figure>
                                <ALink href={href}>
                                  <img src={img} width="100" height="100" alt="product" />
                                </ALink>
                              </figure>
                            </td>
                            <td className="product-name">
                              <div className="product-name-section">
                                <ALink href={href}>{pv?.name}</ALink>
                              </div>
                            </td>
                            <td className="product-subtotal">
                              <span className="amount">${toDecimal(unit)}</span>
                            </td>
                            <td className="product-quantity">
                              <Quantity
                                qty={Number(line.quantity) || 0}
                                max={100}
                                onChangeQty={(q: number) => {
                                  adjustLine({ variables: { orderLineId: line.id, quantity: q } });
                                }}
                              />
                            </td>
                            <td className="product-price">
                              <span className="amount">${toDecimal(lineTotal)}</span>
                            </td>
                            <td className="product-close">
                              <ALink href="#" className="product-remove" title="Remove this product" onClick={() => removeLine({ variables: { orderLineId: line.id } })}>
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
                    <button type="button" className={"btn btn-outline btn-dark btn-md btn-rounded btn-disabled"}>
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
                    <button type="button" className="btn btn-md btn-dark btn-rounded btn-outline" onClick={() => coupon && applyCoupon({ variables: { couponCode: coupon } })}>Apply Coupon</button>
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
                              <h4 className="summary-subtitle">Calculate Shipping</h4>
                              <ul>
                                <li>
                                  <div className="custom-radio">
                                    <input type="radio" id="flat_rate" name="shipping" className="custom-control-input" defaultChecked />
                                    <label className="custom-control-label" htmlFor="flat_rate">Flat rate</label>
                                  </div>
                                </li>
                                <li>
                                  <div className="custom-radio">
                                    <input type="radio" id="free-shipping" name="shipping" className="custom-control-input" />
                                    <label className="custom-control-label" htmlFor="free-shipping">Free shipping</label>
                                  </div>
                                </li>
                                <li>
                                  <div className="custom-radio">
                                    <input type="radio" id="local_pickup" name="shipping" className="custom-control-input" />
                                    <label className="custom-control-label" htmlFor="local_pickup">Local pickup</label>
                                  </div>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="shipping-address">
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
                      </div>

                      <table className="total">
                        <tbody>
                          <tr className="summary-subtotal">
                            <td><h4 className="summary-subtitle">Total</h4></td>
                            <td><p className="summary-total-price ls-s">${toDecimal(total)}</p></td>
                          </tr>
                        </tbody>
                      </table>

                      <ALink href="/pages/checkout" className="btn btn-dark btn-rounded btn-checkout">Proceed to checkout</ALink>
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
