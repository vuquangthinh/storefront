import React from 'react';

import ALink from '~/components/features/custom-link';

import { toDecimal } from '~/utils';

export default function CartPopup({ product }: { product: any }) {
    const slug = product?.slug || product?.productSlug || '';
    const productHref = slug ? `/products/${ slug }` : '#';
    const detailHref = slug ? `/products/${ slug }` : '#';

    const pictureUrl = product?.image || product?.featuredAsset?.preview || product?.pictures?.[0]?.url || '/images/product-placeholder.png';
    const quantity = product?.qty ?? product?.quantity ?? 1;
    const price = typeof product?.price === 'number' ? product.price : 0;

    return (
        <div className="minipopup-area">
            <div className="minipopup-box show" style={{ top: '0' }}>
                <p className="minipopup-title">Successfully added.</p>

                <div className="product product-purchased product-cart mb-0">
                    <figure className="product-media pure-media">
                        <ALink href={ detailHref }>
                            <img
                                src={ pictureUrl }
                                alt={ product?.name || 'product' }
                                width="90"
                                height="90"
                            />
                        </ALink>
                    </figure>
                    <div className="product-detail">
                        <ALink href={ productHref } className="product-name">{ product?.name || 'Product' }</ALink>
                        <span className="price-box">
                            <span className="product-quantity">{ quantity }</span>
                            <span className="product-price">${ toDecimal( price ) }</span>
                        </span>
                    </div>
                </div>

                <div className="action-group d-flex">
                    <ALink href="/cart" className="btn btn-sm btn-outline btn-primary btn-rounded">View Cart</ALink>
                    <ALink href="/checkout" className="btn btn-sm btn-primary btn-rounded">Check Out</ALink>
                </div>
            </div>
        </div>
    );
}