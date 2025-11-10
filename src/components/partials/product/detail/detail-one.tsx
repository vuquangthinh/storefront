'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ALink from '~/components/features/custom-link';
import Countdown from '~/components/features/countdown';
import Quantity from '~/components/features/quantity';
import ProductNav from '~/components/partials/product/product-nav';
import { useCart } from '@/context/cart/CartContext';
import { useWishlist } from '@/context/wishlist/WishlistContext';
import { toDecimal } from '~/utils';
import { useQuickview } from '@/context/quickview/QuickviewContext';
import { toast } from 'react-toastify';

// ---------- Types ----------
interface ProductVariant {
  id?: string;
  name?: string;
  priceWithTax?: number;
  stockLevel?: string;
  assets?: { preview?: string | null }[];
  options?: Array<{
    id: string;
    name: string;
    code?: string | null;
    group?: { id: string; name: string; code?: string | null } | null;
  }>;
  size?: { name: string; size: string } | null;
  color?: { name: string; color: string } | null;
  price?: number;
  sale_price?: number;
}

interface Category {
  name: string;
  slug: string;
}

interface ProductData {
  name: string;
  sku: string;
  slug: string;
  price: [number, number];
  discount: number;
  reviews: number;
  ratings: number;
  stock: number;
  short_description: string;
  categories: Category[];
  pictures: { url: string }[];
  variants: ProductVariant[];
}

interface ProductProp {
  data: ProductData;
}

interface DetailOneProps {
  data: any;
  isStickyCart?: boolean;
  adClass?: string;
  isNav?: boolean;
}

// ---------- Collapse ----------
function Collapse({ in: open, children }: { in: boolean; children: React.ReactNode }) {
  return open ? <>{children}</> : null;
}

// ---------- Component ----------
const DetailOne: React.FC<DetailOneProps> = ({
  data,
  isStickyCart = false,
  adClass = '',
  isNav = true,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isOpen: quickviewOpen, closeQuickview } = useQuickview();

  const [curColor, setCurColor] = useState<string>('null');
  const [curSize, setCurSize] = useState<string>('null');
  const [curIndex, setCurIndex] = useState<number>(-1);
  const [cartActive, setCartActive] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  const product = data?.product ?? data; // compatibility fallback
  const productData = product?.data ?? product;
  // Add safe categories fallback: use Vendure collections if categories missing
  const categories: Category[] =
    Array.isArray(productData?.categories) && productData.categories.length
      ? productData.categories
      : Array.isArray((productData as any)?.collections)
        ? (productData as any).collections.map((c: any) => ({ name: c.name, slug: c.slug }))
        : [];

  const colors: Array<{ id: string; name: string }> = [];
  const sizes: Array<{ id: string; name: string }> = [];
  const colorKeys = new Set<string>();
  const sizeKeys = new Set<string>();

  const wish = productData?.slug ? isWishlisted(productData.slug) : false;

  // Safe price values to avoid undefined access
  const price0 = Array.isArray(productData?.price)
    ? productData.price[0]
    : (Array.isArray(productData?.variants) && productData.variants.length > 0
      ? (productData.variants[0].price ?? productData.variants[0].priceWithTax ?? 0)
      : 0);
  const price1 = Array.isArray(productData?.price)
    ? productData.price[1]
    : price0;

  // extract unique sizes and colors
  if (productData?.variants?.length > 0) {
    productData.variants.forEach((variant: ProductVariant) => {
      if (variant.options?.length) {
        variant.options.forEach((opt: NonNullable<ProductVariant['options']>[number]) => {
          const groupCode = opt.group?.code || opt.group?.name || "";
          const key = (opt.code || opt.name || '').trim().toLowerCase();
          if (/color/i.test(groupCode)) {
            if (key && !colorKeys.has(key)) {
              colors.push({ id: opt.id, name: opt.name });
              colorKeys.add(key);
            }
          } else if (/size/i.test(groupCode)) {
            if (key && !sizeKeys.has(key)) {
              sizes.push({ id: opt.id, name: opt.name });
              sizeKeys.add(key);
            }
          }
        });
      }

      if (!variant.options?.length) {
        const ckey = (variant.color?.name || '').trim().toLowerCase();
        const skey = (variant.size?.name || '').trim().toLowerCase();
        if (variant.color && ckey && !colorKeys.has(ckey)) {
          colors.push({ id: variant.color.name, name: variant.color.name });
          colorKeys.add(ckey);
        }
        if (variant.size && skey && !sizeKeys.has(skey)) {
          sizes.push({ id: variant.size.name, name: variant.size.name });
          sizeKeys.add(skey);
        }
      }
    });
  }

  // Sort sizes in a consistent order for storefront
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
  }, [productData]);

  // reset states when product changes
  useEffect(() => {
    return () => {
      setCurIndex(-1);
      resetValueHandler();
    };
  }, [productData]);

  // helper: get color/size names from variant options or legacy fields
  const getVariantNames = (item: ProductVariant): { colorName: string | null; sizeName: string | null } => {
    let colorName: string | null = item.color?.name ?? null;
    let sizeName: string | null = item.size?.name ?? null;
    if ((!colorName || !sizeName) && Array.isArray(item.options)) {
      for (const opt of item.options) {
        const groupCode = opt.group?.code || opt.group?.name || '';
        if (/color/i.test(groupCode)) colorName = opt.name;
        else if (/size/i.test(groupCode)) sizeName = opt.name;
      }
    }
    return { colorName, sizeName };
  };

  // determine active variant (match by color/size name like detail-five)
  useEffect(() => {
    if (!Array.isArray(productData?.variants) || productData.variants.length === 0) {
      setCartActive((productData as any).stock > 0);
      return;
    }

    const variants = productData.variants;
    const first = getVariantNames(variants[0]);
    const isValidSelection =
      (curColor !== 'null' && curSize !== 'null') ||
      (curColor !== 'null' && first.sizeName === null) ||
      (curSize !== 'null' && first.colorName === null);

    if (isValidSelection) {
      const foundIndex = variants.findIndex((item: ProductVariant) => {
        const { colorName: c, sizeName: s } = getVariantNames(item);
        return (
          (s !== null && c !== null && c === curColor && s === curSize) ||
          (s === null && c !== null && c === curColor) ||
          (c === null && s !== null && s === curSize)
        );
      });

      if (foundIndex > -1) {
        setCartActive(true);
        setCurIndex(foundIndex);
      } else {
        setCartActive(false);
        setCurIndex(-1);
      }
    } else {
      setCartActive(false);
      setCurIndex(-1);
    }

    if ((productData as any).stock === 0) {
      setCartActive(false);
    }
  }, [curColor, curSize, productData]);

  // change current color (toggle behavior like detail-five)
  const changeColor = (colorName: string) => {
    if (!isDisabled(colorName, curSize)) {
      setCurColor((prev) => (prev === colorName ? 'null' : colorName));
    }
  };

  // change current size (toggle behavior like detail-five)
  const changeSize = (sizeName: string) => {
    if (!isDisabled(curColor, sizeName)) {
      setCurSize((prev) => (prev === sizeName ? 'null' : sizeName));
    }
  };

  // reset selection
  const resetValueHandler = () => {
    setCurColor('null');
    setCurSize('null');
  };

  // disable invalid combinations like detail-five
  function isDisabled(colorName: string, sizeName: string) {
    if (colorName === 'null' || sizeName === 'null') return false;
    const variants = productData?.variants || [];

    const hasSizes = sizes.length > 0;
    const hasColors = colors.length > 0;

    if (!hasSizes) {
      return variants.findIndex((item: ProductVariant) => getVariantNames(item).colorName === colorName) === -1;
    }
    if (!hasColors) {
      return variants.findIndex((item: ProductVariant) => getVariantNames(item).sizeName === sizeName) === -1;
    }
    return variants.findIndex((item: ProductVariant) => {
      const names = getVariantNames(item);
      return names.colorName === colorName && names.sizeName === sizeName;
    }) === -1;
  }

  // add to cart
  const addToCartHandler = async () => {
    if (!cartActive || (productData as any).stock <= 0) return;

    const variants = productData.variants || [];
    const variant = variants.length > 0 ? (curIndex > -1 ? variants[curIndex] : variants[0]) : undefined;

    const variantId = variant?.id;
    const basePrice =
      typeof variant?.priceWithTax === 'number'
        ? variant.priceWithTax / 100
        : variant?.sale_price ?? variant?.price ?? (productData as any)?.price?.[0];

    let displayName = productData.name;
    const colorName = curColor !== 'null' ? curColor : null;
    const sizeName = curSize !== 'null' ? curSize : null;
    if (colorName) displayName += ` - ${colorName}`;
    if (sizeName) displayName += ` - ${sizeName}`;

    await addToCart({
      productVariantId: variantId,
      quantity,
      product: {
        slug: productData.slug,
        name: displayName,
        price: basePrice,
        pictures: productData.pictures,
        image: variant?.assets?.[0]?.preview || productData.pictures?.[0]?.url || null,
        variant,
      },
    });

    // Close quickview modal after adding to cart
    if (quickviewOpen) {
      closeQuickview();
    }
  };

  // Buy Now: add current selection to cart then go to checkout
  const buyNowHandler = async () => {
    if (!cartActive || (productData as any).stock <= 0) return;

    const variants = productData.variants || [];
    const variant = variants.length > 0 ? (curIndex > -1 ? variants[curIndex] : variants[0]) : undefined;

    // Require selection when variant has color/size
    if (Array.isArray(variants) && variants.length > 0) {
      const first = variants[0];
      const names = getVariantNames(first);
      const needColor = names.colorName !== null;
      const needSize = names.sizeName !== null;
      if ((needColor && curColor === 'null') || (needSize && curSize === 'null')) {
        toast.warn('Please select color/size before Buy Now.');
        return;
      }
    }

    const variantId = variant?.id;
    const basePrice =
      typeof variant?.priceWithTax === 'number'
        ? variant.priceWithTax / 100
        : variant?.sale_price ?? variant?.price ?? (productData as any)?.price?.[0];

    let displayName = productData.name;
    const colorName = curColor !== 'null' ? curColor : null;
    const sizeName = curSize !== 'null' ? curSize : null;
    if (colorName) displayName += ` - ${colorName}`;
    if (sizeName) displayName += ` - ${sizeName}`;

    await addToCart({
      productVariantId: variantId,
      quantity,
      product: {
        slug: productData.slug,
        name: displayName,
        price: basePrice,
        pictures: productData.pictures,
        image: variant?.assets?.[0]?.preview || productData.pictures?.[0]?.url || null,
        variant,
      },
    });

    if (quickviewOpen) {
      closeQuickview();
    }

    router.push('/checkout');
  };
  // (Removed duplicate addToCartHandler; using the unified version above)

  // quantity change
  const changeQty = (qty: number) => setQuantity(qty);

  // handle wishlist toggle / navigation
  const wishlistHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!wish) {
      const currentTarget = e.currentTarget;
      currentTarget.classList.add('load-more-overlay', 'loading');
      // Toggle wishlist for current product data
      toggleWishlist(productData);
      setTimeout(() => {
        currentTarget.classList.remove('load-more-overlay', 'loading');
      }, 1000);
    } else {
      router.push('/wishlist');
    }
  };

  // duplicate addToCartHandler removed

  // ---------- JSX ----------
  return (
    <div className={`product-details ${adClass}`}>
      {isNav && (
        <div className="product-navigation">
          <ul className="breadcrumb breadcrumb-lg">
            <li>
              <ALink href="/">
                <i className="d-icon-home" />
              </ALink>
            </li>
            <li>
              <ALink href="#" className="active">
                Products
              </ALink>
            </li>
            <li>Detail</li>
          </ul>
          <ProductNav product={productData} />
        </div>
      )}

      <h2 className="product-name">{productData.name}</h2>

      {/* Product Meta */}
      <div className="product-meta">
        SKU: <span className="product-sku">{productData.sku}</span>
        CATEGORIES:{' '}
        <span className="product-brand">
          {categories.map((cat, idx) => (
            <React.Fragment key={`${cat.name}-${idx}`}>
              <ALink href={{ pathname: '/shop', query: { category: cat.slug } }}>
                {cat.name}
              </ALink>
              {idx < categories.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </span>
      </div>

      {/* Price */}
      <div className="product-price">
        {price0 !== price1 ? (
          !Array.isArray(productData.variants) ||
            productData.variants.length === 0 ||
            (productData.variants.length > 0 && !productData.variants[0]?.price) ? (
            <>
              <ins className="new-price">${toDecimal(price0)}</ins>
              <del className="old-price">${toDecimal(price1)}</del>
            </>
          ) : (
            <div className="product-price">
              <ins className="new-price">${toDecimal(productData.variants[0]?.price ?? price0)}</ins>
            </div>
          )
        ) : (
          <div className="product-price">
            <ins className="new-price">${toDecimal(price0)}</ins>
          </div>
        )}
      </div>

      {/* Variations & Cart */}
      {Array.isArray(productData.variants) && productData.variants.length > 0 ? (
        <div className="product-variations mt-3">
          {colors.length > 0 && (
            <div className="product-form product-color">
              <label>Color:</label>
              <div className="product-variations">
                {colors.map((item: { id: string; name: string }) => (
                  <ALink
                    href="#"
                    className={`color ${curColor === item.name ? 'active' : ''} ${isDisabled(item.name, curSize) ? 'disabled' : ''}`}
                    data-color={`${item.name}`.toUpperCase()}
                    key={item.id}
                    onClick={() => changeColor(item.name)}
                  >
                    {item.name}
                  </ALink>
                ))}
              </div>
            </div>
          )}

          <br />

          {sizes.length > 0 && (
            <div className="product-form product-size">
              <label>Size:</label>
              <div className="product-form-group">
                <div className="product-variations">
                  {sizes.map((item: { id: string; name: string }) => (
                    <ALink
                      href="#"
                      className={`size ${curSize === item.name ? 'active' : ''} ${isDisabled(curColor, item.name) ? 'disabled' : ''}`}
                      key={item.id}
                      onClick={() => changeSize(item.name)}
                    >
                      {item.name}
                    </ALink>
                  ))}
                </div>
                {('null' !== curColor || 'null' !== curSize) && (
                  <div className="card-wrapper overflow-hidden reset-value-button w-100 mb-0">
                    <ALink href="#" className="product-variation-clean" onClick={() => resetValueHandler()}>
                      Clean All
                    </ALink>
                  </div>
                )}
              </div>
            </div>
          )}

          <br />

          <div className="product-variation-price">
            {cartActive && curIndex > -1 && (
              <div className="card-wrapper">
                <div className="single-product-price">
                  {(() => {
                    const v = productData.variants[curIndex];
                    if (!v) return null;
                    if (typeof v.price === 'number') {
                      if (typeof v.sale_price === 'number') {
                        return (
                          <div className="product-price mb-0">
                            <ins className="new-price">${toDecimal(v.sale_price)}</ins>
                            <del className="old-price">${toDecimal(v.price)}</del>
                          </div>
                        );
                      }
                      return (
                        <div className="product-price mb-0">
                          <ins className="new-price">${toDecimal(v.price)}</ins>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="product-form product-qty pb-0">
        <label className="d-none">QTY:</label>
        <div className="product-form-group">
          <Quantity qty={quantity} max={productData.stock} product={productData} onChangeQty={changeQty} />
          <button
            className={`btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${cartActive ? '' : 'disabled'
              }`}
            onClick={addToCartHandler}
          >
            <i className="d-icon-bag" />
            Add to Cart
          </button>
          <button
            className={`btn-product btn-primary text-normal ls-normal font-weight-semi-bold ml-2 ${cartActive ? '' : 'disabled'}`}
            onClick={buyNowHandler}
            aria-label="Buy Now"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <hr className="product-divider mb-3" />
      <div className="product-footer">
        <div className="social-links mr-4">
          <ALink href="#" className="social-link social-facebook fab fa-facebook-f" />
          <ALink href="#" className="social-link social-twitter fab fa-twitter" />
          <ALink href="#" className="social-link social-pinterest fab fa-pinterest-p" />
        </div>
        <span className="divider d-lg-show"></span>
        <a
          href="#"
          className="btn-product btn-wishlist"
          title={wish ? 'Browse wishlist' : 'Add to wishlist'}
          onClick={wishlistHandler}
        >
          <i className={wish ? 'd-icon-heart-full' : 'd-icon-heart'}></i>
          {wish ? 'Browse wishlist' : 'Add to Wishlist'}
        </a>
      </div>
    </div>
  );
};

export default DetailOne;
