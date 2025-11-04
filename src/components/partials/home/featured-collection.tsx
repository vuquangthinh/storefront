import React from 'react';
import Reveal from 'react-awesome-reveal';

import ALink from '~/components/features/custom-link';
import OwlCarousel from '~/components/features/owl-carousel';

import ProductTwo from '~/components/features/product/product-two';

import { productSlider } from '~/utils/data/carousel';
import { fadeIn } from '~/utils/data/keyframes';

type FeaturedCollectionProps = {
  products?: any[];
  loading?: boolean;
};

const skeletonItems = [1, 2, 3, 4, 5];

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products = [], loading = false }) => {
  return (
    <Reveal keyframes={fadeIn} delay={300} duration={1200} triggerOnce>
      <section className="product-wrapper container mt-10 pt-5">
        <h2 className="title title-simple text-left with-link">
          Our Featured
          <ALink href="/products">
            View All Products
            <i className="d-icon-arrow-right"></i>
          </ALink>
        </h2>

        {loading ? (
          <OwlCarousel adClass="owl-theme" options={productSlider}>
            {skeletonItems.map((item) => (
              <div className="product-loading-overlay" key={`featured-skel-${item}`} />
            ))}
          </OwlCarousel>
        ) : (
          <OwlCarousel adClass="owl-theme" options={productSlider}>
            {products.map((item, index) => (
              <ProductTwo product={item} key={`featured-product-${index}`} isRatingText={false} />
            ))}
          </OwlCarousel>
        )}
      </section>
    </Reveal>
  );
};

export default React.memo(FeaturedCollection);