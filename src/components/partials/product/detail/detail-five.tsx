"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import ALink from '~/components/features/custom-link';
import Quantity from '~/components/features/quantity';

import ProductNav from '~/components/partials/product/product-nav';

import { useCart } from '@/context/cart/CartContext';
import { useWishlist } from '@/context/wishlist/WishlistContext';

import { toDecimal } from '~/utils';
import limitedOfferStyles from '@/components/features/limited-offer-countdown.module.scss';
import viewerCountStyles from '@/components/features/viewer-count-badge.module.scss';

// ---------- Types ----------
interface VariantOptionGroup {
  id: string;
  name: string;
  code?: string | null;
}

interface VariantOption {
  id: string;
  name: string;
  code?: string | null;
  group?: VariantOptionGroup | null;
}

interface ProductVariant {
  id?: string;
  name?: string;
  priceWithTax?: number;
  stockLevel?: string;
  assets?: { preview?: string | null }[];
  options?: VariantOption[];
  size?: { name: string; size: string } | null;
  color?: { name: string; color: string } | null;
  price?: number;
  sale_price?: number;
  pictures?: { url: string }[];
}

interface ProductCategory {
  name: string;
  slug: string;
}

interface ProductData {
  slug: string;
  name: string;
  sku: string;
  price: [number, number];
  short_description?: string;
  pictures?: { url: string }[];
  categories: ProductCategory[];
  variants: ProductVariant[];
  stock: number;
}

interface ProductWrapper {
  data: ProductData;
}

interface DetailOneProps {
  data: { product: ProductWrapper };
  isSticky?: boolean;
  isDesc?: boolean;
  isProductNav?: boolean;
  isGuide?: boolean;
}

const LimitedOfferCountdown = dynamic(() => import('@/components/features/limited-offer-countdown'), {
    ssr: false,
    loading: () => (
        <div className={limitedOfferStyles.wrapper} aria-live="polite">
            <span className={`${limitedOfferStyles.label} d-block`}>
                Limited-time offer! Sale ends in
            </span>
            <div className={`${limitedOfferStyles.timer} ${limitedOfferStyles.placeholder}`}>
                <span className={limitedOfferStyles.section}>
                    <span className={limitedOfferStyles.amount}>--</span>
                    <span className={limitedOfferStyles.period}>HOURS</span>
                </span>
                <span className={limitedOfferStyles.section}>
                    <span className={limitedOfferStyles.amount}>--</span>
                    <span className={limitedOfferStyles.period}>MINUTES</span>
                </span>
                <span className={limitedOfferStyles.section}>
                    <span className={limitedOfferStyles.amount}>--</span>
                    <span className={limitedOfferStyles.period}>SECONDS</span>
                </span>
            </div>
        </div>
    )
});

const ViewerCountBadge = React.lazy(() => import('@/components/features/viewer-count-badge'));

// Minimal Collapse component
function Collapse({ in: open, children }: { in: boolean; children: React.ReactNode }) {
    return open ? <>{children}</> : null;
}

function DetailOne(props: DetailOneProps) {
    const router = useRouter();
    const { data, isSticky = false, isDesc = false, isProductNav = true, isGuide = false } = props;
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [curColor, setCurColor] = useState<string>('null');
    const [curSize, setCurSize] = useState<string>('null');
    const [curIndex, setCurIndex] = useState<number>(0);
    const [cartActive, setCartActive] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const product: ProductWrapper = data && data.product;

    // decide if the product is wishlisted
    let colors: Array<{ name: string; value: string }> = [], sizes: Array<{ name: string; value: string }> = [];
    const wish = isWishlisted(product.data.slug);

    if (product.data && product.data.variants.length > 0) {
        if (product.data.variants[0].size)
            product.data.variants.forEach((item: ProductVariant) => {
                if (item.size && sizes.findIndex(size => size.name === item.size!.name) === -1) {
                    sizes.push({ name: item.size.name, value: item.size.size });
                }
            });

        if (product.data.variants[0].color) {
            product.data.variants.forEach((item: ProductVariant) => {
                if (item.color && colors.findIndex(color => color.name === item.color!.name) === -1)
                    colors.push({ name: item.color.name, value: item.color.color });
            });
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

    useEffect(() => {
        setCurIndex(-1);
        setCurColor('null');
        setCurSize('null');
    }, [product])

    useEffect(() => {
        if (product.data.variants.length > 0) {
            if ((curSize !== 'null' && curColor !== 'null') || (curSize === 'null' && product.data.variants[0].size === null && curColor !== 'null') || (curColor === 'null' && product.data.variants[0].color === null && curSize !== 'null')) {
                setCartActive(true);
                setCurIndex(product.data.variants.findIndex((item: ProductVariant) => (
                    item.size !== null && item.color !== null && item.color!.name === curColor && item.size!.name === curSize
                ) || (item.size === null && item.color!.name === curColor) || (item.color === null && item.size!.name === curSize)));
            } else {
                setCartActive(false);
            }
        } else {
            setCartActive(true);
        }

        if (product.data.stock === 0) {
            setCartActive(false);
        }
    }, [curColor, curSize, product])

    const wishlistHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (!wish) {
            let currentTarget = e.currentTarget;
            currentTarget.classList.add('load-more-overlay', 'loading');
            toggleWishlist(product.data);

            setTimeout(() => {
                currentTarget.classList.remove('load-more-overlay', 'loading');
            }, 1000);
        } else {
            router.push('/wishlist');
        }
    }

    const toggleColorHandler = (color: { name: string }) => {
        if (!isDisabled(color.name, curSize)) {
            if (curColor === color.name) {
                setCurColor('null');
            } else {
                setCurColor(color.name);
            }
        }
    }

    const toggleSizeHandler = (size: { name: string }) => {
        if (!isDisabled(curColor, size.name)) {
            if (curSize === size.name) {
                setCurSize('null');
            } else {
                setCurSize(size.name);
            }
        }
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
        setCurColor('null');
        setCurSize('null');
    }

    function isDisabled(color: string, size: string) {
        if (color === 'null' || size === 'null') return false;

        if (sizes.length === 0) {
            return product.data.variants.findIndex((item: ProductVariant) => item.color?.name === curColor) === -1;
        }

        if (colors.length === 0) {
            return product.data.variants.findIndex((item: ProductVariant) => item.size?.name === curSize) === -1;
        }

        return product.data.variants.findIndex((item: ProductVariant) => item.color?.name === color && item.size?.name === size) === -1;
    }

    function changeQty(qty: number) {
        setQuantity(qty);
    }

    return (
        <>
            <div className={`product-details ${isSticky ? 'sticky' : ''}`}>
                {
                    isProductNav ?
                        <div className="product-navigation">
                            <ul className="breadcrumb breadcrumb-lg">
                                <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
                                <li><ALink href="/products" className="active">Products</ALink></li>
                                <li>{product.data.name}</li>
                            </ul>

                            <ProductNav product={product} />
                        </div> : ''
                }

                <h2 className="product-name">{product.data.name}</h2>

                <div className='product-meta'>
                    SKU: <span className='product-sku'>{product.data.sku}</span>
                    CATEGORIES: <span className='product-brand'>
                        {
                            product.data.categories.map((item: ProductCategory, index: number) =>
                                <React.Fragment key={item.name + '-' + index}>
                                    <ALink href={`/categories/${item.slug}`}>
                                        {item.name}
                                    </ALink>
                                    {index < product.data.categories.length - 1 ? ', ' : ''}
                                </React.Fragment>
                            )}
                    </span>
                </div>

                <div className="product-price">
                    {
                        product.data.price[0] !== product.data.price[1] ?
                            product.data.variants.length === 0 || (product.data.variants.length > 0 && !product.data.variants[0].price) ?
                                <>
                                    <ins className="new-price">${toDecimal(product.data.price[0])}</ins>
                                    <del className="old-price">${toDecimal(product.data.price[1])}</del>
                                </>
                                :
                                < del className="new-price">${toDecimal(product.data.price[0])} – ${toDecimal(product.data.price[1])}</del>
                            : <ins className="new-price">${toDecimal(product.data.price[0])}</ins>
                    }
                </div>


                {/* <div className="ratings-container">
                <div className="ratings-full">
                    <span className="ratings" style={ { width: 20 * product.data.ratings + '%' } }></span>
                    <span className="tooltiptext tooltip-top">{ toDecimal( product.data.ratings ) }</span>
                </div>

                <ALink href="#" className="rating-reviews">( { product.data.reviews } reviews )</ALink>
            </div> */}

                <p className="product-short-desc">{product.data.short_description}</p>



                {
                    product && product.data.variants.length > 0 ?
                        <>
                            {
                                product.data.variants[0].color ?
                                    <div className='product-form product-color'>
                                        <label>Color:</label>

                                        <div className="product-variations">
                                            {
                                                colors.map((item: { name: string; value: string }) =>
                                                    <ALink href={`#${item.name}`} className={`color ${curColor === item.name ? 'active' : ''} ${isDisabled(item.name, curSize) ? 'disabled' : ''}`} data-color={`${item.value}`.toUpperCase()} key={"color-" + item.name} onClick={() => toggleColorHandler(item)}>
                                                        {item.name}
                                                    </ALink>)
                                            }
                                        </div>
                                    </div> : ''
                            }

                            {
                                product.data.variants[0].size ?
                                    <div className='product-form product-size'>
                                        <label>Size:</label>

                                        <div className="product-form-group">
                                            <div className="product-variations">
                                                {
                                                    sizes.map((item: { name: string; value: string }) =>
                                                        <ALink
                                                            href="#"
                                                            className={`size ${curSize === item.name ? 'active' : ''} ${isDisabled(curColor, item.name) ? 'disabled' : ''}`}
                                                            key={"size-" + item.name}
                                                            onClick={() => toggleSizeHandler(item)}>
                                                            {item.name}
                                                        </ALink>)
                                                }
                                            </div>

                                            <Collapse in={'null' !== curColor || 'null' !== curSize}>
                                                <div className="card-wrapper overflow-hidden reset-value-button w-100 mb-0">
                                                    <ALink href='#' className='product-variation-clean' onClick={() => resetValueHandler()}>Clean All</ALink>
                                                </div>
                                            </Collapse>
                                        </div>
                                    </div> : ''
                            }

                            <div className='product-variation-price'>
                                <Collapse in={cartActive && curIndex > -1}>
                                    <div className="card-wrapper">
                                        {
                                            curIndex > -1 ?
                                                <div className="single-product-price">
                                                    {
                                                        product.data.variants[curIndex].price ?
                                                            product.data.variants[curIndex].sale_price ?
                                                                <div className="product-price mb-0">
                                                                    <ins className="new-price">${toDecimal(product.data.variants[curIndex].sale_price!)}</ins>
                                                                    <del className="old-price">${toDecimal(product.data.variants[curIndex].price!)}</del>
                                                                </div>
                                                                : <div className="product-price mb-0">
                                                                    <ins className="new-price">${toDecimal(product.data.variants[curIndex].price!)}</ins>
                                                                </div>
                                                            : ""
                                                    }
                                                </div> : ''
                                        }
                                    </div>
                                </Collapse>
                            </div>

                        </>
                        : ''
                }

                <hr className="product-divider"></hr>

                {product.data.stock > 0 ? (

                    <div className="product-form product-qty">
                        <label className="d-none">QTY:</label>
                        <div className="product-form-group">
                            <Quantity max={product.data.stock} product={product} onChangeQty={(q: number) => changeQty(q)} />
                            <button className={`btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${cartActive ? '' : 'disabled'}`} onClick={addToCartHandler}><i className='d-icon-bag'></i>Add to Cart</button>
                        </div>
                    </div>
                ) : (
                    <div className="product-form product-qty">
                        <label className="d-none">QTY:</label>
                        <div className="product-form-group" style={{
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: 'red'
                        }}>
                            Out of stock
                        </div>
                    </div>
                )}

                <div className="mt-3">
                    <LimitedOfferCountdown />
                </div>

                <div className="mt-2">
                    <Suspense fallback={<div>Loading...</div>}>
                        <ViewerCountBadge />
                    </Suspense>
                </div>


                <hr className="product-divider mb-3"></hr>

                <div className="product-footer">
                    {/* <div className="social-links mr-4">
                    <ALink href="#" className="social-link social-facebook fab fa-facebook-f"></ALink>
                    <ALink href="#" className="social-link social-twitter fab fa-twitter"></ALink>
                    <ALink href="#" className="social-link social-pinterest fab fa-pinterest-p"></ALink>
                </div>  */}
                    <span className="d-lg-show"></span> <a href="#" className={`btn-product btn-wishlist`} title={wish ? 'Browse wishlist' : 'Add to wishlist'} onClick={wishlistHandler}>
                        <i className={wish ? "d-icon-heart-full" : "d-icon-heart"}></i> {
                            wish ? 'Browse wishlist' : 'Add to Wishlist'
                        }
                    </a>
                </div>
            </div>
        </>
    )
}

export default DetailOne;