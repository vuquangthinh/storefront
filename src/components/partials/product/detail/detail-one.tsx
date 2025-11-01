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

  const colors: Array<{ name: string; value: string }> = [];
  const sizes: Array<{ name: string; value: string }> = [];

  const wish = isWishlisted(productData.slug);

  // extract unique sizes and colors
  if (productData?.variants?.length > 0) {
    productData.variants.forEach((item) => {
      if (item.size && sizes.findIndex((s) => s.name === item.size!.name) === -1) {
        sizes.push({ name: item.size.name, value: item.size.size });
      }
      if (item.color && colors.findIndex((c) => c.name === item.color!.name) === -1) {
        colors.push({ name: item.color.name, value: item.color.color });
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
    if (productData?.variants?.length > 0) {
      const firstVariant = productData.variants[0];
      if (
        (curSize !== 'null' && curColor !== 'null') ||
        (curSize === 'null' && !firstVariant.size && curColor !== 'null') ||
        (curColor === 'null' && !firstVariant.color && curSize !== 'null')
      ) {
        setCartActive(true);
        const index = productData.variants.findIndex(
          (v) =>
            (v.size && v.color && v.size.name === curSize && v.color.name === curColor) ||
            (!v.size && v.color && v.color.name === curColor) ||
            (!v.color && v.size && v.size.name === curSize)
        );
        setCurIndex(index);
      } else {
        setCartActive(false);
      }
    } else {
      setCartActive(true);
    }

    if (productData.stock === 0) setCartActive(false);
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
  function isDisabled(color: string, size: string): boolean {
    if (!productData?.variants?.length) return false;
    if (color === 'null' || size === 'null') return false;

    return (
      productData.variants.findIndex(
        (v) =>
          (!v.size && v.color?.name === color) ||
          (!v.color && v.size?.name === size) ||
          (v.color?.name === color && v.size?.name === size)
      ) === -1
    );
  }

  // quantity change
  const changeQty = (qty: number) => setQuantity(qty);

  // add to cart
  const addToCartHandler = () => {
    if (!cartActive || productData.stock <= 0) return;

    const variants = productData.variants || [];
    const variant = variants.length > 0
      ? (curIndex > -1 ? variants[curIndex] : variants[0])
      : undefined;

    const variantId = variant?.id;
    const basePrice = variant?.sale_price ?? variant?.price ?? productData.price[0];

    let displayName = productData.name;
    if (curColor !== 'null') displayName += `-${curColor}`;
    if (curSize !== 'null') displayName += `-${curSize}`;

    addToCart({
      productVariantId: variantId,
      quantity,
      product: {
        slug: productData.slug,
        name: displayName,
        price: basePrice,
        pictures: productData.pictures,
        image: variant?.pictures?.[0]?.url ?? productData.pictures?.[0]?.url ?? null,
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
