import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useCart } from '@/context/cart/CartContext';
import { useWishlist } from '@/context/wishlist/WishlistContext';

import { toDecimal } from '~/utils';

import ALink from '~/components/features/custom-link';
import Quantity from '~/components/features/quantity';

interface ProductSevenProps {
    product: any;
    adClass?: string;
    openQuickview?: (slug: string) => void;
}

function ProductSeven ( props: ProductSevenProps ) {
    const { product, adClass = 'text-center', openQuickview } = props;
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
        if ( product.stock > 0 ) {
            const root = e.currentTarget.closest( '.product-with-qty' ) as HTMLElement | null;
            const input = root?.querySelector<HTMLInputElement>( '.product-quantity .quantity' );
            const qty = input ? parseInt( input.value, 10 ) || 1 : 1;
            addToCart( { ...product, qty, price: product.price[ 0 ] } );
        }
    }

    return (
        <div className={ `product ${ product.variants.length > 0 ? 'product-variable' : '' } text-center shadow-media product-with-qty ${ adClass }` }>
            <figure className="product-media">
                <ALink href={ `/product/default/${ product.slug }` }>
                    <LazyLoadImage
                        alt="product"
                        src={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ 0 ].url }
                        threshold={ 500 }
                        effect="opacity"
                        width="300"
                        height="338"
                    />

                    {
                        product.pictures.length >= 2 ?
                            <LazyLoadImage
                                alt="product"
                                src={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ 1 ].url }
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
                    <a href="#" className="btn-product-icon btn-wishlist" title={ wish ? 'Remove from wishlist' : 'Add to wishlist' } onClick={ wishlistHandler }>
                        <i className={ wish ? "d-icon-heart-full" : "d-icon-heart" }></i>
                    </a>
                </div>

                <div className="product-action">
                    <ALink href="#" className="btn-product btn-quickview" title="Quick View" onClick={ showQuickviewHandler }>Quick View</ALink>
                </div>
            </figure>

            <div className="product-details">
                <h3 className="product-name">
                    <ALink href={ `/product/default/${ product.slug }` }>{ product.name }</ALink>
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

                <div className="product-action">
                    {
                        product.variants.length > 0 ?
                            <ALink href={ `/product/default/${ product.slug }` } className="btn-product btn-cart" title="Go to product">
                                <span>Select Options</span>
                            </ALink> :
                            <>
                                <Quantity max={ product.stock } product={ product } adClass="product-quantity" />
                                <a href="#" className="btn-product btn-cart" title="Add to cart" onClick={ addToCartHandler }>
                                    <i className="d-icon-bag"></i><span>Add to cart</span>
                                </a>
                            </>
                    }
                </div>            </div>
        </div >
    )
}


export default connect( mapStateToProps, { toggleWishlist: wishlistActions.toggleWishlist, addToCart: cartActions.addToCart, ...modalActions } )( ProductSeven );