"use client";
import ALink from '~/components/features/custom-link';

export default function ShopBannerDefault({
  title,
  subtitle = 'TonyZone',
  ctaHref = '/products',
  ctaText = 'Discover now',
  backgroundImage = '',
  backgroundColor = '#3939a8'
}: {
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaText?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}) {
  return (
    <div className="container relative">
      <div className="shop-banner-default banner" style={{ backgroundAttachment: 'fixed', backgroundPosition: 'center', backgroundImage: backgroundImage ? `url(${backgroundImage})` : '', backgroundColor }}>
        <div className='shop-banner-overlay' />
        
        <div className="banner-content">
          <h4 className="banner-subtitle font-weight-bold ls-normal text-uppercase text-white">{subtitle}</h4>
          <h1 className="banner-title font-weight-bold text-white">{title}</h1>
          <ALink href={ctaHref} className="btn btn-white btn-outline btn-icon-right btn-rounded text-normal">
            {ctaText}
            <i className="d-icon-arrow-right"></i>
          </ALink>
        </div>
      </div>
    </div>
  );
}
