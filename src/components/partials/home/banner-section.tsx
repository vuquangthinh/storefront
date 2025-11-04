import React from 'react';
import Reveal from 'react-awesome-reveal';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import ALink from '~/components/features/custom-link';
import { fadeIn, blurIn } from '~/utils/data/keyframes';

interface BannerSectionProps {
  subTitle?: string;
  backgroundColor?: string;
  title?: string;
  url?: string;
  titleAdClass?: string;
}

const BannerSection: React.FC<BannerSectionProps> = ({
  subTitle = 'Accessories for',
  backgroundColor = '#27272c',
  title = "Summer Season's",
  url,
  titleAdClass = '',
}) => {
  return (
    <Reveal keyframes={fadeIn} delay={200} duration={1200} triggerOnce>
      <section
        className="container mt-10"
      >
        <div className="banner1 banner" style={{ backgroundColor }}>
          <figure style={{ minHeight: url ? 'unset' : 220 }}>
            {url && (
              <LazyLoadImage
                src={url}
                alt="banner"
                effect="opacity"
                width="auto"
                height={url ? 220 : 'auto'}
              />
            )}
          </figure>
          <div className="banner-content y-50" style={{ transformOrigin: '25%' }}>
            <Reveal keyframes={blurIn} delay={200} duration={1200} triggerOnce>
              <div>
                <h4 className="banner-subtitle text-white font-weight-normal">{subTitle}</h4>
                <h3
                  className={`banner-title d-inline-block text-white text-uppercase font-weight-bold mr-5 mb-0 ${titleAdClass}`}
                >
                  {title}
                </h3>
                <ALink
                  href="/products"
                  className="btn btn-white btn-link pb-2 pt-2 d-inline-block btn-infinite btn-slide-right"
                >
                  Shop now <i className="d-icon-arrow-right"></i>
                </ALink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Reveal>
  );
};

export default React.memo(BannerSection);
