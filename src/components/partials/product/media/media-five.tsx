'use client';

import { useState, useEffect, useRef } from 'react';
import ALink from '~/components/features/custom-link';
import Carousel, { CarouselHandle } from '~/components/features/carousel';
import ThumbTwo from '~/components/partials/product/thumb/thumb-two';
import { mainSlider3 } from '~/utils/data/carousel';

// ==== Types ====

interface ProductImage {
  url: string;
}

interface Product {
  stock?: number;
  is_top?: boolean;
  is_new?: boolean;
  discount?: number;
  pictures?: ProductImage[];
  large_pictures?: ProductImage[];
}

interface MediaFiveProps {
  product: Product;
  adClass?: string;
}

// ==== Component ====

export default function MediaFive({ product, adClass = '' }: MediaFiveProps) {
  const [index, setIndex] = useState(0);
  const [isOpen, setOpenState] = useState(false);
  const mediaRef = useRef<CarouselHandle>(null); // ✅ type-safe ref

  const lgImages = product.large_pictures ?? product.pictures ?? [];

  // ✅ Điều khiển carousel khi index thay đổi
  useEffect(() => {
    if (mediaRef.current && index >= 0) {
      mediaRef.current.goTo(index);
    }
  }, [index]);

  // Khi click vào thumbnail
  const setIndexHandler = (mediaIndex: number) => {
    if (mediaIndex !== index) setIndex(mediaIndex);
  };

  const openLightBox = () => setOpenState(true);

  // ✅ Sự kiện khi slide đổi
  const events = {
    onTranslated: ({ item }: { item: { index: number } }) => {
      const thumbs = document.querySelector('.product-thumbs');
      if (!thumbs) return;
      thumbs.querySelector('.product-thumb.active')?.classList.remove('active');
      thumbs.querySelectorAll('.product-thumb')[item.index]?.classList.add('active');
    },
  };

  return (
    <div
      className={`product-gallery product-gallery-vertical product-gallery-sticky ${adClass}`}
    >
      {/* === Labels === */}
      <div className="product-label-group">
        {product.stock === 0 && (
          <label className="product-label label-out">out</label>
        )}
        {!!product.is_top && (
          <label className="product-label label-top">top</label>
        )}
        {!!product.is_new && (
          <label className="product-label label-new">new</label>
        )}
        {!!product.discount && (
          <label className="product-label label-sale">sale</label>
        )}
      </div>

      {/* === Main carousel === */}
      <Carousel
        ref={mediaRef}
        adClass="product-single-carousel owl-theme owl-nav-inner"
        options={mainSlider3}
        onChangeIndex={setIndexHandler}
        events={events}
      >
        {lgImages.map((image, idx) => (
          <div key={`${image.url || 'img'}-${idx}`}>
            <img
              src={image.url}
              alt="Product"
              className="product-image large-image"
            />
          </div>
        ))}
      </Carousel>

      {/* === Optional zoom button === */}
      {/* 
      <ALink href="#" className="product-image-full" onClick={openLightBox}>
        <i className="d-icon-zoom"></i>
      </ALink>
      */}

      {/* === Thumbnails === */}
      <ThumbTwo
        product={product}
        index={index}
        onChangeIndex={setIndexHandler}
      />
    </div>
  );
}
