import React from 'react';
import Reveal from "react-awesome-reveal";
import { LazyLoadImage } from 'react-lazy-load-image-component';

// import Custom Components
import ALink from '~/components/features/custom-link';
import OwlCarousel from '~/components/features/owl-carousel';

import { introSlider } from '~/utils/data/carousel';
import { fadeInRightShorter } from '~/utils/data/keyframes';
import { HOME_SLIDES } from '@/config/slide-config';

function IntroSection() {
    return (
        <OwlCarousel adClass="intro-slider animation-slider text-white owl-dot-inner owl-nav-big owl-theme" options={ introSlider }>
            {HOME_SLIDES.map((s, idx) => (
                <div key={s.key || `slide-${idx}`} className={`intro-slide${idx + 1} banner banner-fixed`} style={{ backgroundColor: s.backgroundColor }}>
                    <figure style={{ opacity: 0.5, height: 569, backgroundImage: `url(${s.image})`, backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
                        {/* <LazyLoadImage
                            src={s.image}
                            alt="Intro Slider"
                            effect="opacity"
                            width="auto"
                            height={469}
                        /> */}
                    </figure>
                    <div className="container">
                        <div className={`banner-content ${s.align === 'right' ? 'ml-auto mr-0' : 'ml-lg-2'} y-50`}>
                            <Reveal keyframes={ fadeInRightShorter } delay={ 300 } duration={ 800 }>
                                <h4 className={`banner-subtitle text-uppercase text-white ${idx === 1 ? ' text-primary' : ''}`}>{s.subtitle}</h4>
                                <h3 className="banner-title ls-m text-white font-weight-bolder" dangerouslySetInnerHTML={{ __html: s.titleHtml }}></h3>
                                {s.buttonText && s.buttonHref ? (
                                    <ALink href={s.buttonHref} className="btn btn-white btn-outline btn-rounded mb-1">{s.buttonText} <i className="d-icon-arrow-right"></i></ALink>
                                ) : null}
                            </Reveal>
                        </div>
                    </div>
                </div>
            ))}
        </OwlCarousel>
    )
}

export default React.memo( IntroSection );