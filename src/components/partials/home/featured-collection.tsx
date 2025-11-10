"use client";
import React from 'react';
import ALink from '~/components/features/custom-link';

import ProductTwo from '~/components/features/product/product-two';
import { useQuickview } from '@/context/quickview/QuickviewContext';

function FeaturedCollection(props: { products: any[]; loading?: boolean }) {
  const { products, loading } = props;
  const { openQuickview } = useQuickview();
  return (
    <section className="product-wrapper container mt-6 pt-6">
      <h2 className="title title-simple text-left with-link">Featured Products<ALink href="/categories/trending">View All Products<i className="d-icon-arrow-right"></i></ALink></h2>
      <div className="product-grid row gutter-sm">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div className="height-x1" key={`featured-skel-${i}`}>
                <div className="product-loading-overlay"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            {products && products.slice(0, 8).map((item, index) => (
              <div className="height-x1" key={`featured-product-${index}`}>
                <ProductTwo product={item} isRatingText={false} openQuickview={openQuickview} />
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default React.memo(FeaturedCollection);