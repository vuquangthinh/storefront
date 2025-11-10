"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ALink from '~/components/features/custom-link';
import Countdown from '~/components/features/countdown';
import Quantity from '~/components/features/quantity';

import ProductNav from '~/components/partials/product/product-nav';
import { useCart } from '@/context/cart/CartContext';
import { useWishlist } from '@/context/wishlist/WishlistContext';

import { toDecimal, scrollTopHandler } from '~/utils';

// Minimal Collapse
function Collapse({ in: open, children }: { in: boolean; children: React.ReactNode }) {
  return open ? <>{children}</> : null;
}

function DetailOne ( props: any ) {
    const router = useRouter();
    const { data, isStickyCart = false, adClass = '', isNav = true } = props;
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [ curColor, setCurColor ] = useState( 'null' );
    const [ curSize, setCurSize ] = useState( 'null' );
    const [ curIndex, setCurIndex ] = useState( 0 );
    const [ cartActive, setCartActive ] = useState( false );
    const [ quantity, setQuantity ] = useState( 1 );
    let product = data && data.product;

    // decide if the product is wishlisted
    let colors: Array<{ name: string; value: any }> = [], sizes: Array<{ name: string; value: any }> = [];
    const wish = isWishlisted(product.data.slug);

    if ( product.data && product.data.variants.length > 0 ) {
        if ( product.data.variants[ 0 ].size )
            product.data.variants.forEach( (item: any) => {
                if ( sizes.findIndex( size => size.name === item.size.name ) === -1 ) {
                    sizes.push( { name: item.size.name, value: item.size.size } );
                }
            } );

        if ( product.data.variants[ 0 ].color ) {
            product.data.variants.forEach( (item: any) => {
                if ( colors.findIndex( color => color.name === item.color.name ) === -1 )
                    colors.push( { name: item.color.name, value: item.color.color } );
            } );
        }
    }

    // Sort sizes in storefront order
    const SIZE_ORDER = ['S','M','L','XL','2XL','3XL','4XL','5XL'];
    const normalizeSize = (s: string) => s.replace(/\s+/g, '').toUpperCase();
    sizes.sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(normalizeSize(a.name));
        const ib = SIZE_ORDER.indexOf(normalizeSize(b.name));
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.name.localeCompare(b.name);
    });

    // Auto-select single option for color/size
    useEffect(() => {
        if (colors.length === 1 && curColor === 'null') {
            setCurColor(colors[0].name);
        }
        if (sizes.length === 1 && curSize === 'null') {
            setCurSize(sizes[0].name);
        }
    }, [product]);

    useEffect( () => {
        return () => {
            setCurColor('null');
            setCurSize('null');
            setCurIndex(0);
            setCartActive(false);
        }
    }, [ product ] )

    useEffect( () => {
        if ( product.data.variants.length > 0 ) {
            const enable = ( ( curSize !== 'null' && curColor !== 'null' )
                || ( curSize === 'null' && product.data.variants[ 0 ].size === null && curColor !== 'null' )
                || ( curColor === 'null' && product.data.variants[ 0 ].color === null && curSize !== 'null' ) );
            setCartActive(enable);
            if (enable) {
                setCurIndex( product.data.variants.findIndex( (item: any) => ( item.size !== null && item.color !== null && item.color.name === curColor && item.size.name === curSize ) || ( item.size === null && item.color.name === curColor ) || ( item.color === null && item.size.name === curSize ) ) );
            }
        } else {
            setCartActive(true);
        }

        if ( product.stock === 0 ) {
            setCartActive(false);
        }
    }, [ curColor, curSize, product ] )

    const wishlistHandler = ( e: React.MouseEvent<HTMLAnchorElement> ) => {
        e.preventDefault();

        if ( !wish ) {
            let currentTarget = e.currentTarget;
            currentTarget.classList.add( 'load-more-overlay', 'loading' );
            toggleWishlist( product.data );

            setTimeout( () => {
                currentTarget.classList.remove( 'load-more-overlay', 'loading' );
            }, 1000 );
        } else {
            scrollTopHandler();
            router.push( '/wishlist' );
        }
    }

    const setColorHandler = ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        setCurColor( e.target.value );
    }

    const setSizeHandler = ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        setCurSize( e.target.value );
    }

    const addToCartHandler = () => {
        if (product.data.stock <= 0 || !cartActive) return;

        const variants = product.data.variants || [];
        const variant = variants.length > 0 ? (curIndex > -1 ? variants[curIndex] : variants[0]) : undefined;
        const variantId = variant?.id;

        let displayName = product.data.name;
        if (curColor !== 'null') displayName += '-' + curColor;
        if (curSize !== 'null') displayName += '-' + curSize;

        const price = variant?.sale_price ?? variant?.price ?? product.data.price[0];
        const image = variant?.pictures?.[0]?.url || product.data.pictures?.[0]?.url || null;

        addToCart({
            productVariantId: variantId,
            quantity,
            product: {
                slug: product.data.slug,
                name: displayName,
                price,
                pictures: product.data.pictures,
                image,
            },
        });
    }

    const resetValueHandler = () => {
        setCurColor( 'null' );
        setCurSize( 'null' );
    }

    function isDisabled ( color: string, size: string ) {
        if ( color === 'null' || size === 'null' ) return false;

        if ( sizes.length === 0 ) {
            return product.data.variants.findIndex( (item: any) => item.color.name === curColor ) === -1;
        }

        if ( colors.length === 0 ) {
            return product.data.variants.findIndex( (item: any) => item.size.name === curSize ) === -1;
        }

        return product.data.variants.findIndex( (item: any) => item.color.name === color && item.size.name === size ) === -1;
    }

    return (
        <div className={ "product-details " + adClass }>
            {
                isNav ?
                    <div className="product-navigation">
                        <ul className="breadcrumb breadcrumb-lg">
                            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
                            <li><ALink href="#" className="active">Products</ALink></li>
                            <li>Detail</li>
                        </ul>

                        <ProductNav product={ product } />
                    </div> : ''
            }

            <h2 className="product-name">{ product.data.name }</h2>

            <div className='product-meta'>
                SKU: <span className='product-sku'>{ product.data.sku }</span>
                CATEGORIES: <span className='product-brand'>
                    {
                        product.data.categories.map( ( item: any, index: number ) =>
                            <React.Fragment key={ item.name + '-' + index }>
                                <ALink href={ { pathname: '/shop', query: { category: item.slug } } }>
                                    { item.name }
                                </ALink>
                                { index < product.data.categories.length - 1 ? ', ' : '' }
                            </React.Fragment>
                        ) }
                </span>
            </div>

            <div className="product-price">
                {
                    product.data.price[ 0 ] !== product.data.price[ 1 ] ?
                        product.data.variants.length === 0 || ( product.data.variants.length > 0 && !product.data.variants[ 0 ].price ) ?
                            <>
                                <ins className="new-price">${ toDecimal( product.data.price[ 0 ] ) }</ins>
                                <del className="old-price">${ toDecimal( product.data.price[ 1 ] ) }</del>
                            </>
                            :
                            < del className="new-price">${ toDecimal( product.data.price[ 0 ] ) } – ${ toDecimal( product.data.price[ 1 ] ) }</del>
                        : <ins className="new-price">${ toDecimal( product.data.price[ 0 ] ) }</ins>
                }
            </div>

            {
                product.data.price[ 0 ] !== product.data.price[ 1 ] && product.data.variants.length === 0 ?
                    <Countdown type={ 2 } /> : ''
            }

            <div className="ratings-container">
                <div className="ratings-full">
                    <span className="ratings" style={ { width: 20 * product.data.ratings + '%' } }></span>
                    <span className="tooltiptext tooltip-top">{ toDecimal( product.data.ratings ) }</span>
                </div>

                <ALink href="#" className="rating-reviews">( { product.data.reviews } reviews )</ALink>
            </div>

            <p className="product-short-desc">{ product.data.short_description }</p>

            {
                product && product.data.variants.length > 0 ?
                    <>
                        {
                            product.data.variants[ 0 ].color ?
                                <div className='product-form product-variations product-color'>
                                    <label>Color:</label>
                                    <div className='select-box'>
                                        <select name='color' className='form-control select-color' onChange={ setColorHandler } value={ curColor }>
                                            <option value="null">Choose an option</option>
                                            {
                                                colors.map( item =>
                                                    !isDisabled( item.name, curSize ) ?
                                                        <option value={ item.name } key={ "color-" + item.name }>{ item.name }</option> : ''
                                                )
                                            }
                                        </select>
                                    </div>
                                </div> : ""
                        }

                        {
                            product.data.variants[ 0 ].size ?
                                <div className='product-form product-variations product-size mb-0 pb-2'>
                                    <label>Size:</label>
                                    <div className='product-form-group'>
                                        <div className='select-box'>
                                            <select name='size' className='form-control select-size' onChange={ setSizeHandler } defaultValue={ curSize }>
                                                <option value="null">Choose an option</option>
                                                {
                                                    sizes.map( item =>
                                                        !isDisabled( curColor, item.name ) ?
                                                            <option value={ item.name } key={ "size-" + item.name }>{ item.name }</option> : ''
                                                    )
                                                }
                                            </select>
                                        </div>

                                        <Collapse in={ curColor !== 'null' || curSize !== 'null' }>
                                            <div className={ `overflow-hidden reset-value-button w-100 mb-0` }>
                                                <ALink href='#' className='product-variation-clean' onClick={ () => resetValueHandler() }>Clean All</ALink>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div> : ""
                        }


                        <div className='product-variation-price'>
                            <Collapse in={ cartActive && curIndex > -1 }>
                                <div className={ `overflow-hidden single-product-price` }>
                                    {
                                        product.data.variants[ curIndex ] && product.data.variants[ curIndex ].price ?
                                            product.data.variants[ curIndex ].sale_price ?
                                                <div className="product-price mb-0">
                                                    <ins className="new-price">${ toDecimal( product.data.variants[ curIndex ].sale_price ) }</ins>
                                                    <del className="old-price">${ toDecimal( product.data.variants[ curIndex ].price ) }</del>
                                                </div>
                                                : <div className="product-price mb-0">
                                                    <ins className="new-price">${ toDecimal( product.data.variants[ curIndex ].price ) }</ins>
                                                </div>
                                            : ""
                                    }
                                </div>
                            </Collapse>
                        </div>
                    </> : ''
            }

            <hr className="product-divider"></hr>

            {
                isStickyCart ?
                    <div className="sticky-content fix-top product-sticky-content">
                        <div className="container">
                            <div className="sticky-product-details">
                                <figure className="product-image">
                                    <ALink href={ '/product/default/' + product.data.slug }>
                                        <img src={ (process.env.NEXT_PUBLIC_ASSET_URI || '') + product.data.pictures[ 0 ].url } width="90" height="90"
                                            alt="Product" />
                                    </ALink>
                                </figure>
                                <div>
                                    <h4 className="product-title"><ALink href={ '/product/default/' + product.data.slug }>{ product.data.name }</ALink></h4>
                                    <div className="product-info">
                                        <div className="product-price mb-0">
                                            {
                                                'null' === curColor || 'null' === curSize ?
                                                    product.data.price[ 0 ] !== product.data.price[ 1 ] ?
                                                        <ins className="new-price mr-0">${ toDecimal( product.data.price[ 0 ] ) } – ${ toDecimal( product.data.price[ 1 ] ) }</ins>
                                                        : product.data.discount > 0 && product.data.variants.length > 0 ?
                                                            <>
                                                                <ins className="new-price">${ toDecimal( product.data.salePrice ) }</ins>
                                                                <del className="old-price">${ toDecimal( product.data.price ) }</del>
                                                            </>
                                                            : <ins className="new-price mr-0">${ toDecimal( product.data.price[ 0 ] ) }</ins>
                                                    : product.data.variants[ curIndex ].price ?
                                                        product.data.variants[ curIndex ].sale_price ?
                                                            <>
                                                                <ins className="new-price">${ toDecimal( product.data.variants[ curIndex ].sale_price ) }</ins>
                                                                <del className="old-price">${ toDecimal( product.data.variants[ curIndex ].price ) }</del>
                                                            </>
                                                            : <>
                                                                <ins className="new-price mr-0">${ toDecimal( product.data.variants[ curIndex ].price ) }</ins>
                                                            </>
                                                        : ""
                                            }
                                        </div>

                                        <div className="ratings-container mb-0">
                                            <div className="ratings-full">
                                                <span className="ratings" style={ { width: 20 * product.data.ratings + '%' } }></span>
                                                <span className="tooltiptext tooltip-top">{ toDecimal( product.data.ratings ) }</span>
                                            </div>

                                            <ALink href="#" className="rating-reviews">( { product.data.reviews } reviews )</ALink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="product-form product-qty pb-0">
                                <label className="d-none">QTY:</label>
                                <div className="product-form-group">
                                    <Quantity max={ product.data.stock } product={ product } onChangeQty={ (q: number) => setQuantity(q) } />
                                    <button className={ `btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${ cartActive ? '' : 'disabled' }` } onClick={ addToCartHandler }><i className='d-icon-bag'></i>Add to Cart</button>

                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="product-form product-qty pb-0">
                        <label className="d-none">QTY:</label>
                        <div className="product-form-group">
                            <Quantity max={ product.data.stock } product={ product } onChangeQty={ (q: number) => setQuantity(q) } />
                            <button className={ `btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${ cartActive ? '' : 'disabled' }` } onClick={ addToCartHandler }><i className='d-icon-bag'></i>Add to Cart</button>

                        </div>
                    </div>
            }

            <hr className="product-divider mb-3"></hr>

            <div className="product-footer">
                <div className="social-links mr-4">
                    <ALink href="#" className="social-link social-facebook fab fa-facebook-f"></ALink>
                    <ALink href="#" className="social-link social-twitter fab fa-twitter"></ALink>
                    <ALink href="#" className="social-link social-pinterest fab fa-pinterest-p"></ALink>
                </div> <span className="divider d-lg-show"></span> <a href="#" className={ `btn-product btn-wishlist` } title={ wish ? 'Browse wishlist' : 'Add to wishlist' } onClick={ wishlistHandler }>
                    <i className={ wish ? "d-icon-heart-full" : "d-icon-heart" }></i> {
                        wish ? 'Browse wishlist' : 'Add to Wishlist'
                    }
                </a>
            </div>
        </div>
    )
}

export default DetailOne;