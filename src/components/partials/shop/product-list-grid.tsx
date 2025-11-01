"use client";
import React from 'react';
import ProductTwo from '~/components/features/product/product-two';
import ProductEight from '~/components/features/product/product-eight';
import Pagination from '@/components/features/pagination';

export default function ProductListGrid({
  products,
  grid,
  type = 'grid',
  perPage,
  page,
  totalItems,
  showPagination = false,
  notFoundMessage = "No products were found matching your selection.",
}: {
  products: any[];
  grid?: string;
  type?: 'grid' | 'list';
  perPage?: number;
  page?: number;
  totalItems?: number;
  showPagination?: boolean;
  notFoundMessage?: string;
}) {
  const gridParam = grid || '3cols';
  const itemsPerRow = gridParam === '3cols' ? 3 : gridParam === '5cols' ? 5 : gridParam === '6cols' ? 6 : 4;
  const gridClasses: Record<number, string> = {
    3: 'cols-2 cols-sm-3',
    4: 'cols-2 cols-sm-3 cols-md-4',
    5: 'cols-2 cols-sm-3 cols-md-4 cols-xl-5',
    6: 'cols-2 cols-sm-3 cols-md-4 cols-xl-6',
    7: 'cols-2 cols-sm-3 cols-md-4 cols-lg-5 cols-xl-7',
    8: 'cols-2 cols-sm-3 cols-md-4 cols-lg-5 cols-xl-8',
  };

  if (type === 'grid') {
    return (
      <>
        <div className={`row product-wrapper ${gridClasses[itemsPerRow]}`}>
          {products.slice(0, 24).map((item: any, index: number) => (
            <div className="product-wrap" key={`shop-${item.slug || index}`}>
              <ProductTwo product={item} />
            </div>
          ))}
          {products.length === 0 && (
            <p className="ml-1">{notFoundMessage}</p>
          )}
        </div>

        {showPagination && products.length > 0 && perPage && page !== undefined && totalItems !== undefined && (
          <div className="toolbox toolbox-pagination" style={{ marginBottom: '2.3rem' }}>
            <p className="show-info">
              Showing <span>{perPage * (page - 1) + 1} - {Math.min(perPage * page, totalItems)}</span> of <span>{totalItems}</span> Products
            </p>
            <Pagination totalPage={Math.max(1, Math.ceil(totalItems / perPage))} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="product-lists product-wrapper">
        {products.slice(0, 24).map((item: any, index: number) => (
          <div className="product-wrap" key={`shop-list-${item.slug || index}`}>
            <ProductEight product={item} />
          </div>
        ))}
        {products.length === 0 && (
          <p className="ml-1">No products were found matching your selection.</p>
        )}
      </div>

      {showPagination && products.length > 0 && perPage && page !== undefined && totalItems !== undefined && (
        <div className="toolbox toolbox-pagination" style={{ marginBottom: '2.3rem' }}>
          <p className="show-info">
            Showing <span>{perPage * (page - 1) + 1} - {Math.min(perPage * page, totalItems)}</span> of <span>{totalItems}</span> Products
          </p>
          <Pagination totalPage={Math.max(1, Math.ceil(totalItems / perPage))} />
        </div>
      )}
    </>
  );
}
