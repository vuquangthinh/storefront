"use client";
import { useState } from 'react';
import ALink from '~/components/features/custom-link';
import { useCart } from '@/context/cart/CartContext';
import { toDecimal } from '~/utils';

export default function CheckoutPageClient() {
  const { items } = useCart();
  const [isFirst, setFirst] = useState(false);

  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * Number(it.qty || 0), 0);

  return (
    <main className="main checkout">
      <div className={`page-content pt-7 pb-10 ${items.length > 0 ? 'mb-10' : 'mb-2'}`}>
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step"><ALink href="/cart">1. Shopping Cart</ALink></h3>
          <h3 className="title title-simple title-step active"><ALink href="#">2. Checkout</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/pages/order">3. Order Complete</ALink></h3>
        </div>
        <div className="container mt-7">
          {items.length > 0 ? (
            <>
              <form action="#" className="form">
                <div className="row">
                  <div className="col-lg-7 mb-6 mb-lg-0 pr-lg-4">
                    <h3 className="title title-simple text-left text-uppercase">Billing Details</h3>
                    <div className="row">
                      <div className="col-xs-6">
                        <label>First Name *</label>
                        <input type="text" className="form-control" name="first-name" required />
                      </div>
                      <div className="col-xs-6">
                        <label>Last Name *</label>
                        <input type="text" className="form-control" name="last-name" required />
                      </div>
                    </div>
                    <label>Company Name (Optional)</label>
                    <input type="text" className="form-control" name="company-name" />
                    <label>Country / Region *</label>
                    <div className="select-box">
                      <select name="country" className="form-control" defaultValue="us">
                        <option value="us">United States (US)</option>
                        <option value="uk">United Kingdom</option>
                        <option value="fr">France</option>
                        <option value="aus">Austria</option>
                      </select>
                    </div>
                    <label>Street Address *</label>
                    <input type="text" className="form-control" name="address1" placeholder="House number and street name" />
                    <input type="text" className="form-control" name="address2" placeholder="Apartment, suite, unit, etc. (optional)" />
                    <div className="row">
                      <div className="col-xs-6">
                        <label>Town / City *</label>
                        <input type="text" className="form-control" name="city" />
                      </div>
                      <div className="col-xs-6">
                        <label>State *</label>
                        <input type="text" className="form-control" name="state" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-6">
                        <label>ZIP *</label>
                        <input type="text" className="form-control" name="zip" />
                      </div>
                      <div className="col-xs-6">
                        <label>Phone *</label>
                        <input type="text" className="form-control" name="phone" />
                      </div>
                    </div>
                    <label>Email Address *</label>
                    <input type="text" className="form-control" name="email-address" />

                    <div className="form-checkbox mb-0 pt-0">
                      <input type="checkbox" className="custom-checkbox" id="create-account" name="create-account" />
                      <label className='form-control-label ls-s' htmlFor='create-account'>Create an account?</label>
                    </div>

                    <div className="form-checkbox mb-6">
                      <input type="checkbox" className="custom-checkbox" id="different-address" name="different-address" />
                      <label className='form-control-label ls-s' htmlFor='different-address'>Ship to a different address?</label>
                    </div>

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
                            <tr className="summary-subtotal">
                              <td>
                                <h4 className="summary-subtitle">Subtotal</h4>
                              </td>
                              <td className="summary-subtotal-price pb-0 pt-0">${toDecimal(subtotal)}</td>
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
                            <tr className="summary-total">
                              <td className="pb-0">
                                <h4 className="summary-subtitle">Total</h4>
                              </td>
                              <td className=" pt-0 pb-0">
                                <p className="summary-total-price ls-s text-primary">${toDecimal(subtotal)}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="payment accordion radio-type">
                          <h4 className="summary-subtitle ls-m pb-3">Payment Methods</h4>
                          <div className="checkbox-group">
                            <div className="card-header">
                              <ALink href="#" className={`text-body text-normal ls-m ${isFirst ? 'collapse' : ''}`} onClick={() => setFirst(true)}>Check payments</ALink>
                            </div>
                            {isFirst && (
                              <div className="card-wrapper">
                                <div className="card-body ls-m overflow-hidden">
                                  Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.
                                </div>
                              </div>
                            )}

                            <div className="card-header">
                              <ALink href="#" className={`text-body text-normal ls-m ${!isFirst ? 'collapse' : ''}`} onClick={() => setFirst(false)}>Cash on delivery</ALink>
                            </div>
                            {!isFirst && (
                              <div className="card-wrapper">
                                <div className="card-body ls-m overflow-hidden">
                                  Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="form-checkbox mt-4 mb-5">
                          <input type="checkbox" className="custom-checkbox" id="terms-condition" name="terms-condition" />
                          <label className="form-control-label" htmlFor="terms-condition">
                            I have read and agree to the website <ALink href="#">terms and conditions </ALink>*
                          </label>
                        </div>
                        <button type="submit" className="btn btn-dark btn-rounded btn-order">Place Order</button>
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
