"use client";
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import ALink from '~/components/features/custom-link';

import { useCart } from '@/context/cart/CartContext';
import { useWishlist } from '@/context/wishlist/WishlistContext';

import { toDecimal } from '~/utils';

interface ProductTwoProps {
    product: any;
    adClass?: string;
    openQuickview?: (slug: string) => void;
    isCat?: boolean;
    isRatingText?: boolean;
}

function ProductTwo ( props: ProductTwoProps ) {
    const { product, adClass = 'text-center', openQuickview, isCat = true, isRatingText = true } = props;
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();

    // decide if the product is wishlisted
    const wish = isWishlisted( product.slug );

    const showQuickviewHandler = () => {
        if ( openQuickview ) openQuickview( product.slug );
    }

    const wishlistHandler = ( e: React.MouseEvent<HTMLAnchorElement> ) => {
        toggleWishlist( product );

        e.preventDefault();
        let currentTarget = e.currentTarget;
        currentTarget.classList.add( 'load-more-overlay', 'loading' );

        setTimeout( () => {
            currentTarget.classList.remove( 'load-more-overlay', 'loading' );
        }, 1000 );
    }

    const addToCartHandler = ( e: React.MouseEvent<HTMLAnchorElement> ) => {
        e.preventDefault();
        const variantId = product?.productVariantId
            || product?.defaultVariant?.id
            || product?.variant?.id
            || (Array.isArray(product?.variants) ? product.variants[0]?.id : undefined);
        const basePrice = Array.isArray(product.price) ? product.price[0] : product.price;
        const image = product.pictures?.[0]?.url || product.featuredAsset?.preview || null;

        addToCart({
            productVariantId: variantId,
            quantity: 1,
            product: {
                slug: product.slug,
                name: product.name,
                price: basePrice,
                pictures: product.pictures,
                image,
            },
        });
    }

    return (
        <div className={ `product ${ adClass }` }>
            <figure className="product-media">
                <ALink className='overflow' href={ `/products/${ product.slug }` }>
                    <LazyLoadImage
                        alt="product"
                        src={ product.pictures[ 0 ].url }
                        threshold={ 500 }
                        effect="opacity"
                        width="300"
                        height="338"
                    />

                    {
                        product.pictures.length >= 2 ?
                            <LazyLoadImage
                                alt="product"
                                src={ product.pictures[ 1 ].url }
                                threshold={ 500 }
                                width="300"
                                height="338"
                                effect="opacity"
                                wrapperClassName="product-image-hover"
                            />
                            : ""
                    }
                </ALink>

                <div className="product-label-group">
                    { product.is_new ? <label className="product-label label-new">New</label> : '' }
                    { product.is_top ? <label className="product-label label-top">Top</label> : '' }
                    {
                        product.discount > 0 ?
                            product.variants.length === 0 ?
                                <label className="product-label label-sale">{ product.discount }% OFF</label>
                                : <label className="product-label label-sale">Sale</label>
                            : ''
                    }
                </div>

                <div className="product-action-vertical">
                    {
                        product.variants.length > 0 ?
                            <ALink href={ `/products/${ product.slug }` } className="btn-product-icon btn-cart" title="Go to product">
                                <i className="d-icon-arrow-right"></i>
                            </ALink> :
                            <a href="#" className="btn-product-icon btn-cart" title="Add to cart" onClick={ addToCartHandler }>
                                <i className="d-icon-bag"></i>
                            </a>
                    }
                    <a href="#" className="btn-product-icon btn-wishlist" title={ wish ? 'Remove from wishlist' : 'Add to wishlist' } onClick={ wishlistHandler }>
                        <i className={ wish ? "d-icon-heart-full" : "d-icon-heart" }></i>
                    </a>
                </div>

                {/* <div className="product-action">
                    <ALink href="#" className="btn-product btn-quickview" title="Quick View" onClick={ showQuickviewHandler }>Quick View</ALink>
                </div> */}
            </figure>

            <div className="product-details">
                {
                    isCat ?
                        <div className="product-cat">
                            {
                                product.categories ?
                                    product.categories.map( ( item, index ) => (
                                        <React.Fragment key={ item.name + '-' + index }>
                                            <ALink href={ { pathname: '/shop', query: { category: item.slug } } }>
                                                { item.name }
                                                { index < product.categories.length - 1 ? ', ' : "" }
                                            </ALink>
                                        </React.Fragment>
                                    ) ) : ""
                            }
                        </div> : ''
                }

                <h3 className="product-name">
                    <ALink href={ `/products/${ product.slug }` }>{ product.name }</ALink>
                </h3>

                <div className="product-price">
                    {
                        product.price[ 0 ] !== product.price[ 1 ] ?
                            product.variants.length === 0 || ( product.variants.length > 0 && !product.variants[ 0 ].price ) ?
                                <>
                                    <ins className="new-price">${ toDecimal( product.price[ 0 ] ) }</ins>
                                    <del className="old-price">${ toDecimal( product.price[ 1 ] ) }</del>
                                </>
                                :
                                < del className="new-price">${ toDecimal( product.price[ 0 ] ) } – ${ toDecimal( product.price[ 1 ] ) }</del>
                            : <ins className="new-price">${ toDecimal( product.price[ 0 ] ) }</ins>
                    }
                </div>

                {/* <div className="ratings-container">
                    <div className="ratings-full">
                        <span className="ratings" style={ { width: 20 * product.ratings + '%' } }></span>
                        <span className="tooltiptext tooltip-top">{ toDecimal( product.ratings ) }</span>
                    </div>

                    <ALink href={ `/products/${ product.slug }` } className="rating-reviews">
                        {
                            isRatingText ? <>( { product.reviews } reviews )</> : <>( { product.reviews } )</>
                        }
                    </ALink>
                </div> */}
            </div>
        </div>
    )
}

export default ProductTwo;