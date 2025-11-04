import React from 'react';
import Reveal from 'react-awesome-reveal';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import ALink from '~/components/features/custom-link';

import ProductTwo from '~/components/features/product/product-two';

import { fadeIn, fadeInDownShorter } from '~/utils/data/keyframes';

function FeaturedCollection(props) {
    const { products, loading, adClass = "mt-10 pt-6", title = "T‑Shirts", bannerSubTitle = "Winter season's", bannerTitle = "Discover Our Ski<br />Equipments", url = "/images/home/banner/1.jpg", btnAdClass = '' } = props;

    function removeXSSAttacks(html) {
        const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

        // Removing the <script> tags
        while (SCRIPT_REGEX.test(html)) {
            html = html.replace(SCRIPT_REGEX, "");
        }

        // Removing all events from tags...
        html = html.replace(/ on\w+="[^"]*"/g, "");

        return {
            __html: html
        }
    }

    return (
        <Reveal keyframes={fadeIn} delay={300} duration={1200} triggerOnce>
            <section className={`product-wrapper container ${adClass}`}>
                <h2 className="title title-simple text-left with-link">{title}<ALink href="/products">View All Products<i className="d-icon-arrow-right"></i></ALink></h2>

                <div className="product-grid row gutter-sm">
                    <div className="height-x2">
                        <div className="banner banner-fixed">
                            <figure>
                                <LazyLoadImage
                                    src={url}
                                    alt="banner"
                                    effect="opacity"
                                    width="auto"
                                    height={593}
                                />
                            </figure>

                            <div className="banner-content">
                                <Reveal keyframes={fadeInDownShorter} delay={300} duration={1200} triggerOnce>
                                    <h4 className="banner-subtitle ls-m text-uppercase text-white">
                                        <span className='bg-primary' style={{
                                            display: 'inline-block',
                                            padding: '0.5rem',
                                        }}>
                                            {bannerSubTitle}
                                        </span>
                                    </h4>
                                    <h3 className="banner-title ls-s font-weight-bold text-white" dangerouslySetInnerHTML={removeXSSAttacks(bannerTitle)}></h3>
                                    <ALink href="/products" className={`btn btn-primary btn-shadow-sm ${btnAdClass}`}>Shop now <i className="d-icon-arrow-right"></i></ALink>
                                </Reveal>
                            </div>
                        </div>
                    </div>
                    {
                        loading ?
                            <>
                                {
                                    [1, 2, 3, 4, 5, 6, 7, 8].map((item) =>
                                        <div className="height-x1" key={'product-skel-' + item}>
                                            <div className="product-loading-overlay"></div>
                                        </div>
                                    )
                                }
                            </>
                            :
                            <>
                                {
                                    products && products.slice(0, 8).map((item, index) =>
                                        <div className="height-x1" key={`product-${index}`}>
                                            <ProductTwo
                                                product={item}
                                                isCat={false}
                                                isRatingText={false} />
                                        </div>
                                    )
                                }
                            </>
                    }
                </div>
            </section>
        </Reveal >
    )
}

export default React.memo(FeaturedCollection);
