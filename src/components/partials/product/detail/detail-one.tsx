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
  data: ProductProp;
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

  const [curColor, setCurColor] = useState<string>('null');
  const [curSize, setCurSize] = useState<string>('null');
  const [curIndex, setCurIndex] = useState<number>(-1);
  const [cartActive, setCartActive] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  const product = data?.product ?? data; // compatibility fallback
  const productData = product?.data ?? product;

  const colors: Array<{ id: string; name: string }> = [];
  const sizes: Array<{ id: string; name: string }> = [];

  const wish = isWishlisted(productData.slug);

  // extract unique sizes and colors
  if (productData?.variants?.length > 0) {
    productData.variants.forEach((variant: ProductVariant) => {
      if (variant.options?.length) {
        variant.options.forEach((opt: NonNullable<ProductVariant['options']>[number]) => {
          const groupCode = opt.group?.code || opt.group?.name || "";
          if (/color/i.test(groupCode)) {
            if (!colors.some((c) => c.id === opt.id)) {
              colors.push({ id: opt.id, name: opt.name });
            }
          } else if (/size/i.test(groupCode)) {
            if (!sizes.some((s) => s.id === opt.id)) {
              sizes.push({ id: opt.id, name: opt.name });
            }
          }
        });
      }

      if (!variant.options?.length) {
        if (variant.color && !colors.some((c) => c.name === variant.color!.name)) {
          colors.push({ id: variant.color.name, name: variant.color.name });
        }
        if (variant.size && !sizes.some((s) => s.name === variant.size!.name)) {
          sizes.push({ id: variant.size.name, name: variant.size.name });
        }
      }
    });
  }

  // reset states when product changes
  useEffect(() => {
    return () => {
      setCurIndex(-1);
      resetValueHandler();
    };
  }, [productData]);

  // determine active variant
  useEffect(() => {
    if (!productData?.variants?.length) {
      setCartActive(productData.stock > 0);
      return;
    }

    const matchesSelection = (variant: ProductVariant) => {
      if (!variant) return false;
      const optionIds = variant.options?.map((opt) => opt.id) || [];

      const colorSelected = curColor !== 'null';
      const sizeSelected = curSize !== 'null';

      const matchesColor = !colorSelected || optionIds.includes(curColor);
      const matchesSize = !sizeSelected || optionIds.includes(curSize);

      if (variant.options?.length) {
        return matchesColor && matchesSize;
      }

      const variantColor = variant.color?.name;
      const variantSize = variant.size?.name;
      const colorOk = !colorSelected || variantColor === curColor;
      const sizeOk = !sizeSelected || variantSize === curSize;
      return colorOk && sizeOk;
    };

    const nextIndex = productData.variants.findIndex(matchesSelection);
    setCurIndex(nextIndex);
    const hasMatch = nextIndex > -1;
    const inStock = productData.stock !== 0;
    setCartActive(hasMatch && inStock);
  }, [curColor, curSize, productData]);

  // wishlist handler
  const wishlistHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const currentTarget = e.currentTarget;

    if (!wish) {
      currentTarget.classList.add('load-more-overlay', 'loading');
      toggleWishlist(productData);
      setTimeout(() => {
        currentTarget.classList.remove('load-more-overlay', 'loading');
      }, 1000);
    } else {
      router.push('/wishlist');
    }
  };

  // color/size handlers
  const setColorHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurColor(e.target.value);
  };

  const setSizeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurSize(e.target.value);
  };

  // reset selection
  const resetValueHandler = () => {
    setCurColor('null');
    setCurSize('null');
  };

  // disable invalid combinations
  function isDisabled(colorId: string, sizeId: string): boolean {
    if (!productData?.variants?.length) return false;
    if (colorId === 'null' || sizeId === 'null') return false;

    return (
      productData.variants.findIndex((variant: ProductVariant) => {
        if (variant.options?.length) {
          const optionIds = variant.options.map((opt: NonNullable<ProductVariant['options']>[number]) => opt.id);
          const colorMatch = optionIds.includes(colorId);
          const sizeMatch = optionIds.includes(sizeId);
          return colorMatch && sizeMatch;
        }
        const variantColorId = variant.color?.name || variant.color?.color;
        const variantSizeId = variant.size?.name || variant.size?.size;
        return variantColorId === colorId && variantSizeId === sizeId;
      }) === -1
    );
  }

  // quantity change
  const changeQty = (qty: number) => setQuantity(qty);

  // add to cart
  const addToCartHandler = () => {
    if (!cartActive || productData.stock <= 0) return;

    const variants = productData.variants || [];
    const variant = variants.length > 0 ? (curIndex > -1 ? variants[curIndex] : variants[0]) : undefined;

    const variantId = variant?.id;
    const basePrice =
      typeof variant?.priceWithTax === 'number'
        ? variant.priceWithTax / 100
        : variant?.sale_price ?? variant?.price ?? productData.price[0];

    let displayName = productData.name;
    const colorName = colors.find((c) => c.id === curColor)?.name || curColor;
    const sizeName = sizes.find((s) => s.id === curSize)?.name || curSize;
    if (curColor !== 'null') displayName += ` - ${colorName}`;
    if (curSize !== 'null') displayName += ` - ${sizeName}`;

    addToCart({
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
  };

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
          {productData.categories.map((cat, idx) => (
            <React.Fragment key={`${cat.name}-${idx}`}>
              <ALink href={{ pathname: '/shop', query: { category: cat.slug } }}>
                {cat.name}
              </ALink>
              {idx < productData.categories.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </span>
      </div>

      {/* Price */}
      <div className="product-price">
        {productData.price[0] !== productData.price[1] ? (
          productData.variants.length === 0 ||
          (productData.variants.length > 0 && !productData.variants[0].price) ? (
            <>
              <ins className="new-price">${toDecimal(productData.price[0])}</ins>
              <del className="old-price">${toDecimal(productData.price[1])}</del>
            </>
          ) : (
            <del className="new-price">
              ${toDecimal(productData.price[0])} – ${toDecimal(productData.price[1])}
            </del>
          )
        ) : (
          <ins className="new-price">${toDecimal(productData.price[0])}</ins>
        )}
      </div>

      {productData.price[0] !== productData.price[1] &&
        productData.variants.length === 0 && <Countdown type={2} />}

      {/* Ratings */}
      <div className="ratings-container">
        <div className="ratings-full">
          <span
            className="ratings"
            style={{ width: `${20 * productData.ratings}%` }}
          />
          <span className="tooltiptext tooltip-top">
            {toDecimal(productData.ratings)}
          </span>
        </div>
        <ALink href="#" className="rating-reviews">
          ({productData.reviews} reviews)
        </ALink>
      </div>

      <p className="product-short-desc">{productData.short_description}</p>

      {/* Variations */}
      {productData.variants.length > 0 && (
        <>
          {productData.variants[0].color && (
            <div className="product-form product-variations product-color">
              <label>Color:</label>
              <div className="select-box">
                <select
                  name="color"
                  className="form-control select-color"
                  onChange={setColorHandler}
                  value={curColor}
                >
                  <option value="null">Choose an Option</option>
                  {colors.map(
                    (c) =>
                      !isDisabled(c.name, curSize) && (
                        <option value={c.name} key={`color-${c.name}`}>
                          {c.name}
                        </option>
                      )
                  )}
                </select>
              </div>
            </div>
          )}

          {productData.variants[0].size && (
            <div className="product-form product-variations product-size mb-0 pb-2">
              <label>Size:</label>
              <div className="product-form-group">
                <div className="select-box">
                  <select
                    name="size"
                    className="form-control select-size"
                    onChange={setSizeHandler}
                    value={curSize}
                  >
                    <option value="null">Choose an Option</option>
                    {sizes.map(
                      (s) =>
                        !isDisabled(curColor, s.name) && (
                          <option value={s.name} key={`size-${s.name}`}>
                            {s.name}
                          </option>
                        )
                    )}
                  </select>
                </div>

                <Collapse in={curColor !== 'null' || curSize !== 'null'}>
                  <div className="card-wrapper overflow-hidden reset-value-button w-100 mb-0">
                    <ALink href="#" className="product-variation-clean" onClick={resetValueHandler}>
                      Clean All
                    </ALink>
                  </div>
                </Collapse>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quantity & Cart */}
      <hr className="product-divider" />
      <div className="product-form product-qty pb-0">
        <label className="d-none">QTY:</label>
        <div className="product-form-group">
          <Quantity max={productData.stock} product={productData} onChangeQty={changeQty} />
          <button
            className={`btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${
              cartActive ? '' : 'disabled'
            }`}
            onClick={addToCartHandler}
          >
            <i className="d-icon-bag" />
            Add to Cart
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
