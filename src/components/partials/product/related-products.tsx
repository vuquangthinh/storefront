'use client'

import React from 'react';
import ProductTwo from '~/components/features/product/product-two';
import { useQuickview } from '@/context/quickview/QuickviewContext';

interface RelatedProductsProps {
    products: any[];
    adClass?: string;
}

export default function RelatedProducts({ products, adClass = '' }: RelatedProductsProps) {
    const { openQuickview } = useQuickview();

    return (
        <section className={`related-products ${adClass}`}>
            <h2 className="title title-simple mb-8 mt-8">Related Products</h2>

            <div className="container">
                <div className="row cols-2 cols-sm-3 cols-md-4 product-wrapper">
                    {products && products.map((item: any, index: number) => (
                        <div className="product-wrap" key={`product-two-${index}`}>
                            <ProductTwo product={ item } openQuickview={openQuickview} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}