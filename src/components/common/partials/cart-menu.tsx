import ALink from '~/components/features/custom-link';
import { useCart } from '@/context/cart/CartContext';

import { getTotalPrice, getCartCount, toDecimal } from '~/utils';

function CartMenu() {
    const { items: cartList, removeLine } = useCart();

    const showCartMenu = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.currentTarget.closest('.cart-dropdown')?.classList.add('opened');
    }

    const hideCartMenu = () => {
        const dd = document.querySelector('.cart-dropdown');
        if (dd && dd.classList.contains('opened')) dd.classList.remove('opened');
    }

    const removeCart = (item: any) => {
        if (item?.lineId) {
            removeLine(item.lineId);
        }
    }

    return (
        <div className="dropdown cart-dropdown type2 cart-offcanvas mr-0 mr-lg-2">
            <a href="#" className="cart-toggle label-block link" onClick={showCartMenu}>
                <span className="cart-label d-lg-show">
                    <span className="cart-name">Shopping Cart:</span>
                    <span className="cart-price">${toDecimal(getTotalPrice(cartList))}</span>
                </span>
                <i className="d-icon-bag"><span className="cart-count">{getCartCount(cartList)}</span></i>
            </a>
            <div className="cart-overlay" onClick={hideCartMenu}></div>
            <div className="dropdown-box">
                <div className="cart-header">
                    <h4 className="cart-title">Shopping Cart</h4>
                    <ALink href="#" className="btn btn-dark btn-link btn-icon-right btn-close" onClick={hideCartMenu}>close<i
                        className="d-icon-arrow-right"></i><span className="sr-only">Cart</span></ALink>
                </div>
                {
                    cartList.length > 0 ?
                        <>
                            <div className="products scrollable">
                                {
                                    cartList.map((item: any, index: number) =>
                                        <div className="product product-cart" key={'cart-menu-product-' + index}>
                                            <figure className="product-media pure-media">
                                                <ALink href={'/products/' + (item.productSlug || '')} onClick={hideCartMenu}>
                                                    <img src={item.image || '/images/product-placeholder.png'} alt="product" width="80"
                                                        height="88" />
                                                </ALink>
                                                <button className="btn btn-link btn-close" onClick={() => { removeCart(item) }}>
                                                    <i className="fas fa-times"></i><span className="sr-only">Close</span>
                                                </button>
                                            </figure>
                                            <div className="product-detail">
                                                <ALink href={'/products/' + (item.productSlug || '')} className="product-name" onClick={hideCartMenu}>{item.name}</ALink>
                                                <div className="price-box">
                                                    <span className="product-quantity">{item.qty}</span>
                                                    <span className="product-price">${toDecimal(item.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="cart-total">
                                <label>Subtotal:</label>
                                <span className="price">${toDecimal(getTotalPrice(cartList))}</span>
                            </div>

                            <div className="cart-action">
                                <ALink href="/cart" className="btn btn-dark btn-link" onClick={hideCartMenu}>View Cart</ALink>
                                <ALink href="/checkout" className="btn btn-dark" onClick={hideCartMenu}><span>Go To Checkout</span></ALink>
                            </div>
                        </> :
                        <p className="mt-4 text-center font-weight-semi-bold ls-normal text-body">No products in the cart.</p>
                }
            </div>
        </div>
    )
}

export default CartMenu;