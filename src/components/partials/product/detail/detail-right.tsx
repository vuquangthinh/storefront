import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ALink from '~/components/features/custom-link';
import Quantity from '~/components/features/quantity';

import { useCart } from '@/context/cart/CartContext';
import { useWishlist } from '@/context/wishlist/WishlistContext';

import { toDecimal } from '~/utils';

// Minimal Collapse
function Collapse({ in: open, children }: { in: boolean; children: React.ReactNode }) {
  return open ? <>{children}</> : null;
}

function DetailRight ( props: any ) {
    const router = useRouter();
    const { data } = props;
    const { isSticky = false, adClass = '' } = props;
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [ curColor, setCurColor ] = useState( 'null' );
    const [ curSize, setCurSize ] = useState( 'null' );
    const [ curIndex, setCurIndex ] = useState( 0 );
    const [ cartActive, setCartActive ] = useState( false );
    const [ quantity, setQauntity ] = useState( 1 );
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

    useEffect( () => {
        setCurIndex( -1 );
        setCurColor('null');
        setCurSize('null');
    }, [ product ] )

    useEffect( () => {
        if ( product.data.variants.length > 0 ) {
            if ( ( curSize !== 'null' && curColor !== 'null' ) || ( curSize === 'null' && product.data.variants[ 0 ].size === null && curColor !== 'null' ) || ( curColor === 'null' && product.data.variants[ 0 ].color === null && curSize !== 'null' ) ) {
                setCartActive( true );
                setCurIndex( product.data.variants.findIndex( (item: any) => ( item.size !== null && item.color !== null && item.color.name === curColor && item.size.name === curSize ) || ( item.size === null && item.color.name === curColor ) || ( item.color === null && item.size.name === curSize ) ) );
            } else {
                setCartActive( false );
            }
        } else {
            setCartActive( true );
        }

        if ( product.stock === 0 ) {
            setCartActive( false );
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

    function changeQty ( qty: number ) {
        setQauntity( qty );
    }

    return (
        <div className={ `product-details mb-4 ${ isSticky ? 'p-sticky' : '' } ${ adClass }` }>
            {
                product && product.data.variants.length > 0 ?
                    <>
                        {
                            product.data.variants[ 0 ].color ?
                                <div className='product-form product-variations product-color'>
                                    <label>Color:</label>
                                    <div className='select-box'>
                                        <select name='color' className='form-control select-color' onChange={ setColorHandler } value={ curColor }>
                                            <option value="null">Choose an Option</option>
                                            {
                                                colors.map( (item: any) =>
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
                                <div className='product-form product-variations product-size'>
                                    <label>Size:</label>
                                    <div className='product-form-group'>
                                        <div className='select-box'>
                                            <select name='size' className='form-control select-size' onChange={ setSizeHandler } value={ curSize }>
                                                <option value="null">Choose an Option</option>
                                                {
                                                    sizes.map( (item: any) =>
                                                        !isDisabled( curColor, item.name ) ?
                                                            <option value={ item.name } key={ "size-" + item.name }>{ item.name }</option> : ''
                                                    )
                                                }
                                            </select>
                                        </div>

                                        <Collapse in={ 'null' !== curColor || 'null' !== curSize }>
                                            <div className="card-wrapper overflow-hidden reset-value-button w-100 mb-0">
                                                <ALink href='#' className='product-variation-clean' onClick={ () => resetValueHandler() }>Clean All</ALink>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div> : ""
                        }


                        <div className='product-variation-price'>
                            <Collapse in={ cartActive && curIndex > -1 }>
                                <div className="card-wrapper">
                                    {
                                        curIndex > -1 ?
                                            <div className="single-product-price">
                                                {
                                                    product.data.variants[ curIndex ].price ?
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
                                            </div> : ''
                                    }
                                </div>
                            </Collapse>
                        </div>
                    </> : ''
            }

            <hr className="product-divider"></hr>

            <div className="product-form product-qty pb-0">
                <label className="d-none">QTY:</label>
                <div className="product-form-group">
                    <Quantity max={ product.data.stock } product={ product } onChangeQty={ (q: number) => changeQty(q) } />
                    <button className={ `btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${ cartActive ? '' : 'disabled' }` } onClick={ addToCartHandler }><i className='d-icon-bag'></i>Add to Cart</button>
                </div>
            </div>

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

export default DetailRight;