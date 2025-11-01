import React from 'react';
import Reveal from "react-awesome-reveal";

import ALink from '~/components/features/custom-link';
import OwlCarousel from '~/components/features/owl-carousel';

import { fadeIn, fadeInLeftShorter, fadeInRightShorter } from '~/utils/data/keyframes';
import { categorySlider } from '~/utils/data/carousel';

function CategorySection () {
    return (
        <Reveal keyframes={ fadeIn } delay={ 200 } duration={ 1200 } triggerOnce>
            <section className="categories container mt-10 pt-2">
                <h2 className="title title-simple text-left pb-1">Popular Categories</h2>

                <OwlCarousel adClass="owl-theme" options={ categorySlider }>
                    <div className="category category-group-icon" style={ { backgroundColor: "#4b5577" } }>
                        <ALink href={ { pathname: '/shop', query: { category: 'clothing' } } } className="mb-2">
                            <figure className="category-media">
                                <i className="d-icon-t-shirt1" style={ { fontSize: "6.8rem", margin: "0 0 1.4rem" } }></i>
                            </figure>
                            <h4 className="category-name">Clothing</h4>
                        </ALink>

                        <div className="category-content">
                            <ul className="category-list">
                                <li><ALink href={ { pathname: '/shop', query: { category: 'hats' } } }>Hats</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'men-s-necklace' } } }>Men's Necklace</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'pendant' } } }>Pendant</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'shirts' } } }>Shirts</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'traveller' } } }>Traveller</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'trousers' } } }>Trousers</ALink></li>
                            </ul>
                        </div>
                    </div>

                    <div className="category category-group-icon" style={ { backgroundColor: "#6d52af" } }>
                        <ALink href={ { pathname: '/shop', query: { category: 'sporting-goods' } } }>
                            <figure className="category-media">
                                <i className="d-icon-basketball2"></i>
                            </figure>
                            <h4 className="category-name">Sporting Goods</h4>
                        </ALink>

                        <div className="category-content">
                            <ul className="category-list">
                                <li><ALink href={ { pathname: '/shop', query: { category: 'caps' } } }>Caps</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'shoes' } } }>Shoes</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'ski-accessories' } } }>Ski Accessories</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'sport-balls' } } }>Sport balls</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'sportswear' } } }>Sportswear</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'watches' } } }>Watches</ALink></li>
                            </ul>
                        </div>
                    </div>

                    <div className="category category-group-icon" style={ { backgroundColor: "#3366cc" } }>
                        <ALink href={ { pathname: '/shop', query: { category: 'bag-and-backpack' } } }>
                            <figure className="category-media">
                                <i className="d-icon-backpack"></i>
                            </figure>
                            <h4 className="category-name">Bag &amp; Backpack</h4>
                        </ALink>

                        <div className="category-content">
                            <ul className="category-list">
                                <li><ALink href={ { pathname: '/shop', query: { category: 'backpack' } } }>Backpack</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'fashion' } } }>Fashion</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'handbag' } } }>Handbag</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'purse-bag' } } }>Purse Bag</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'sale' } } }>Sale</ALink></li>
                                <li><ALink href={ { pathname: '/shop', query: { category: 'travel-bag' } } }>Travel Bag</ALink></li>
                            </ul>
                        </div>
                    </div>
                </OwlCarousel>
            </section>
        </Reveal >
    )
}

export default React.memo( CategorySection );