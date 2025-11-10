"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import OwlCarousel from '~/components/features/owl-carousel';

import DetailOne from '~/components/partials/product/detail/detail-one';

import { mainSlider3 } from '~/utils/data/carousel';
import MediaOne from '@/components/partials/product/media/media-one';
import MediaFive from '@/components/partials/product/media/media-five';

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
    const product = data && (data.product ?? data);
    const productData = product && (product.data ?? product);

    // Close when route changes
    useEffect(() => {
        if (isOpen) {
            closeQuickview && closeQuickview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        if (data && isOpen) {
            setLoaded(true);
        } else {
            setLoaded(false);
        }
    }, [data, isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeQuickview && closeQuickview();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, closeQuickview]);

    const images: Array<{ src: string; alt: string }> = useMemo(() => {
        const list: Array<{ src: string; alt: string }> = [];
        const productData = data?.product ?? data;

        const toAbsolute = (u?: string | null): string | null => {
            if (!u) return null;
            if (/^https?:\/\//i.test(u)) return u;
            const base = (process.env.NEXT_PUBLIC_SHOP_API_BASE || '').replace(/\/$/, '');
            if (u.startsWith('/assets')) return base ? `${base}${u}` : u;
            return u;
        };

        // Legacy pictures sourced via NEXT_PUBLIC_ASSET_URI
        if (productData?.pictures?.length) {
            for (const item of productData.pictures) {
                const src = `${process.env.NEXT_PUBLIC_ASSET_URI || ''}${item.url}`;
                list.push({ src, alt: productData.name || 'product' });
            }
        }
        // Vendure shape: product.assets[].preview or featuredAsset.preview
        if (productData?.assets?.length) {
            for (const a of productData.assets) {
                const abs = toAbsolute(a?.preview || null);
                if (abs) list.push({ src: abs, alt: productData.name || 'product' });
            }
        }
        if (productData?.featuredAsset?.preview) {
            const abs = toAbsolute(productData.featuredAsset.preview);
            if (abs) list.unshift({ src: abs, alt: productData.name || 'product' });
        }
        // Fallback: variant assets
        if (list.length === 0 && productData?.variants?.length) {
            for (const v of productData.variants) {
                if (v?.assets?.length) {
                    for (const va of v.assets) {
                        const abs = toAbsolute(va?.preview || null);
                        if (abs) list.push({ src: abs, alt: productData.name || v.name || 'product' });
                    }
                }
            }
        }
        return list;
    }, [productData]);

    // Render overlay whenever isOpen; show skeleton while data is loading
    if (!isOpen) return null;

    const closeQuick = () => {
        setLoaded(false);
        closeQuickview && closeQuickview();
    }

    const isNew = !!(productData?.is_new);
    const isTop = !!(productData?.is_top);
    const discount = Number(productData?.discount || 0);
    const variantCount = Array.isArray(productData?.variants) ? productData.variants.length : 0;

    const overlayClass = `ReactModal__Overlay opened ReactModal__Overlay--after-open quickview-modal-overlay`;
    const contentClass = `ReactModal__Content quickview-modal product product-single ReactModal__Content--after-open`;

    return (
        <div className={overlayClass} role="dialog" aria-modal="true" onClick={closeQuick}>
            <div className={contentClass} onClick={(e) => e.stopPropagation()}>
                <div className="product product-single row product-popup mfp-product" id="product-quickview">
                    {loaded && productData ? (
                        <div className="row p-0 m-0">
                            <div className="col-md-6">
                                <div className="product-gallery mb-md-0 pb-0">
                                    <div className="product-label-group">
                                        {isNew ? <label className="product-label label-new">New</label> : ''}
                                        {isTop ? <label className="product-label label-top">Top</label> : ''}
                                        {discount > 0 ? (variantCount === 0 ? (
                                            <label className="product-label label-sale">{discount}% OFF</label>
                                        ) : (
                                            <label className="product-label label-sale">Sale</label>
                                        )) : ''}
                                    </div>

                                    <OwlCarousel adClass="product-single-carousel owl-theme owl-nav-inner" options={mainSlider3}>
                                        {images.map((img, index) => (
                                            <img
                                                key={'quickview-image-' + index}
                                                src={img.src}
                                                alt={img.alt}
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
                    ) : (
                        <div className="product row p-0 m-0 skeleton-body">
                            <div className="col-md-6">
                                <div className="skel-pro-gallery"></div>
                            </div>

                            <div className="col-md-6">
                                <div className="skel-pro-summary"></div>
                            </div>
                        </div>
                    )}

                    <button title="Close (Esc)" type="button" className="mfp-close p-0" onClick={closeQuick}><span>×</span></button>
                </div>
            </div>
        </div>
    );
}