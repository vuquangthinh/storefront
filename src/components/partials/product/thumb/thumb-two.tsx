'use client';

import React, { useEffect, useRef } from 'react';
import { SwiperSlide } from 'swiper/react';
import Carousel, { CarouselHandle } from '~/components/features/carousel';
import { mainSlider15 } from '~/utils/data/carousel';

interface ProductImage {
  url: string;
}

interface Product {
  pictures?: ProductImage[];
}

interface ThumbTwoProps {
  product: Product;
  index: number;
  onChangeIndex: (idx: number) => void;
}

export default function ThumbTwo({ product, index, onChangeIndex }: ThumbTwoProps) {
  const thumbs = product.pictures ?? [];
  const thumbRef = useRef<CarouselHandle>(null);

  // ✅ Khi MediaFive thay đổi index → cập nhật carousel thumbnail
  useEffect(() => {
    if (thumbRef.current && index >= 0) {
      thumbRef.current.goTo(index);
    }

    const thumbsContainer = document.querySelector('.product-thumbs');
    if (!thumbsContainer) return;

    // Cập nhật class active
    thumbsContainer
      .querySelector('.product-thumb.active')
      ?.classList.remove('active');
    thumbsContainer
      .querySelectorAll('.product-thumb')
    [index]?.classList.add('active');
  }, [index]);

  // Khi click vào thumbnail
  const handleThumbClick = (e: React.MouseEvent<HTMLDivElement>, thumbIndex: number) => {
    e.preventDefault();
    if (thumbIndex !== index) {
      onChangeIndex(thumbIndex);
    }

    // Thay đổi trạng thái active ngay lập tức cho UX tốt
    const thumbsContainer = document.querySelector('.product-thumbs');
    thumbsContainer
      ?.querySelector('.product-thumb.active')
      ?.classList.remove('active');
    e.currentTarget.classList.add('active');
  };

  return (
    <div className="product-thumbs-wrap product-thumbs-two" style={{
      height: 300
    }}>
      <Carousel
        ref={thumbRef}
        adClass="product-thumb-carousel"
        options={mainSlider15}
      >
        {thumbs.map((thumb, i) => (
          <div
            key={`thumb-${i}`}
            className={` ${i === index ? 'active' : ''}`}
            onClick={(e) => handleThumbClick(e, i)}
            style={{
              width: '100%'
            }}
          >
            <img
              src={thumb.url}
              alt="product thumbnail"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
