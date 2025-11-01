"use client";
import ALink from '~/components/features/custom-link';
import ShopBannerDefault from '@/components/partials/shop/banner/shop-banner-default';
import { useWishlist } from '@/context/wishlist/WishlistContext';
import ProductTwo from '~/components/features/product/product-two';
import ProductListGrid from '@/components/partials/shop/product-list-grid';
import ToolBox from '@/components/partials/shop/toolbox';

export default function Page() {
  const { items } = useWishlist();

  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Shop</li>
            <li>Wishlist</li>
          </ul>
        </div>
      </nav>

      <ShopBannerDefault title="My Wishlist" subtitle="TonyZone" ctaHref="/products" ctaText="Discover now" backgroundColor="#3939a8" />

      <div className="page-content mb-10 pb-3">
        <div className="container">
          <div className="row gutter-lg main-content-wrap">
            <div className="col-lg-12 main-content">
              <ToolBox type="left" />
              {items.length === 0 ? (
                <div>
                  <h1 className="mb-3">Your Wishlist</h1>
                  <p className="mb-4">Your wishlist is empty.</p>
                  <ALink href="/products" className="btn btn-primary btn-rounded">Go to Shop</ALink>
                </div>
              ) : (
                <ProductListGrid products={items} grid={'4cols'} type={'grid'} showPagination={false} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
