"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import OwlCarousel from '~/components/features/owl-carousel';

import DetailOne from '~/components/partials/product/detail/detail-one';

import { mainSlider3 } from '~/utils/data/carousel';

interface QuickviewProps {
    slug?: string;
    isOpen?: boolean;
    closeQuickview?: () => void;
    // Optional pre-fetched product data for flexibility
    data?: any;
}

export default function Quickview({ slug = '', isOpen = false, closeQuickview = () => {}, data }: QuickviewProps) {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const product = data && data.product;

    // Close when route changes
    useEffect(() => {
        closeQuickview && closeQuickview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
            if (data && isOpen) {
            setLoaded(true);
        } else {
            setLoaded(false);
        }
    }, [data, isOpen]);

    if (!isOpen || !product || !product.data) return null;

    const closeQuick = () => {
        setLoaded(false);
        closeQuickview && closeQuickview();
    }

    return (
        <div className="product-popup-overlay opened" role="dialog" aria-modal="true">
            <div className="product product-single row product-popup quickview-modal" id="product-quickview">
                <div className={`row p-0 m-0 ${loaded ? '' : 'd-none'}`}>
                    <div className="col-md-6">
                        <div className="product-gallery mb-md-0 pb-0">
                            <div className="product-label-group">
                                {product.data.is_new ? <label className="product-label label-new">New</label> : ''}
                                {product.data.is_top ? <label className="product-label label-top">Top</label> : ''}
                                {product.data.discount > 0 ? (product.data.variants.length === 0 ? (
                                    <label className="product-label label-sale">{product.data.discount}% OFF</label>
                                ) : (
                                    <label className="product-label label-sale">Sale</label>
                                )) : ''}
                            </div>

                            <OwlCarousel adClass="product-single-carousel owl-theme owl-nav-inner" options={mainSlider3}>
                                {product && product.data && product.data.large_pictures.map((item: any, index: number) => (
                                    <img
                                        key={'quickview-image-' + index}
                                        src={process.env.NEXT_PUBLIC_ASSET_URI + item.url}
                                        alt={product.data.name || 'product'}
                                        className="product-image large-image"
                                    />
                                ))}
                            </OwlCarousel>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <DetailOne data={data} adClass="scrollable pr-3" isNav={false} />
                    </div>
                </div>

                {!loaded ? (
                    <div className="product row p-0 m-0 skeleton-body mfp-product">
                        <div className="col-md-6">
                            <div className="skel-pro-gallery"></div>
                        </div>

                        <div className="col-md-6">
                            <div className="skel-pro-summary"></div>
                        </div>
                    </div>
                ) : null}

                <button title="Close (Esc)" type="button" className="mfp-close p-0" onClick={closeQuick}><span>×</span></button>
            </div>
        </div>
    );
}