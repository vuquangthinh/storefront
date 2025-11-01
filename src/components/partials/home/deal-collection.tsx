import React from 'react';
import Reveal from 'react-awesome-reveal';

import ALink from '~/components/features/custom-link';
import OwlCarousel from '~/components/features/owl-carousel';

import CountDown from '~/components/features/countdown';
import ProductTwo from '~/components/features/product/product-two';

import { productSlider } from '~/utils/data/carousel';
import { fadeIn } from '~/utils/data/keyframes';

function BestCollection ( props ) {
    const { products, loading } = props;
    let time = 10 * 3600000;

    return (
        <Reveal keyframes={ fadeIn } delay={ 600 } duration={ 1200 } triggerOnce>
            <section className="product-wrapper container mt-10 pt-6">
                <div className="title-wrapper d-flex align-items-center mb-5 with-link">
                    <h2 className="title title-simple text-left mb-0 ls-normal">Deals of the Week</h2>
                    <div className="pr-2 mr-xs-auto">
                        <div className="countdown-container d-flex align-items-center font-weight-semi-bold text-white">
                            <label>Ends In:</label>
                            <CountDown
                                type={ 2 }
                                date={ Date.now() + time }
                            />
                        </div>
                    </div>
                    <ALink href="/shop" className="">View All Products<i className="d-icon-arrow-right"></i></ALink>
                </div>

                {
                    loading ?
                        <OwlCarousel adClass="owl-theme" options={ productSlider }>
                            {
                                [ 1, 2, 3, 4, 5 ].map( ( item ) =>
                                    <div className="product-loading-overlay" key={ 'best-selling-skel-' + item }></div>
                                )
                            }
                        </OwlCarousel>
                        :
                        <OwlCarousel adClass="owl-theme" options={ productSlider }>
                            {
                                products && products.map( ( item, index ) =>
                                    <ProductTwo
                                        product={ item }
                                        isRatingText={ false }
                                        key={ `best-selling-product ${ index }` }
                                    />
                                )
                            }
                        </OwlCarousel>
                }
            </section>
        </Reveal>
    )
}

export default React.memo( BestCollection );
