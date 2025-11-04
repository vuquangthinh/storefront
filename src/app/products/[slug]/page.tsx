import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ALink from '~/components/features/custom-link';
import DetailFive from '@/components/partials/product/detail/detail-five';
import RelatedProducts from '@/components/partials/product/related-products';
import FakeReviews from '@/components/partials/product/fake-reviews';
import ShopBannerDefault from '@/components/partials/shop/banner/shop-banner-default';
import dynamic from 'next/dynamic';
import React from 'react';


const MediaFive = React.lazy(() => import('@/components/partials/product/media/media-five'));

type PageProps = { params: { slug: string } };

type VendureOptionGroup = {
  id: string;
  code?: string | null;
  name: string;
};

type VendureVariantOption = {
  id: string;
  code?: string | null;
  name: string;
  group?: VendureOptionGroup | null;
};

type VendureVariantResponse = {
  id: string;
  name: string;
  sku?: string | null;
  currencyCode?: string | null;
  priceWithTax?: number | null;
  stockLevel?: string | null;
  assets?: { preview?: string | null }[] | null;
  options?: VendureVariantOption[] | null;
};

type OptionGroupInfo = {
  name: string;
  code?: string | null;
  options: { id: string; name: string; code?: string | null }[];
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const endpoint = process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:3000/shop-api';
  const query = `query P($slug: String!) { product(slug: $slug) { name description } }`;
  try {
    const slug = (await params).slug;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { slug } }),
      cache: 'no-store'
    });
    const json = await res.json();
    const prod = json?.data?.product;
    if (prod) {
      return {
        title: `${prod.name} | Products`,
        description: prod.description || 'View product details, specs, and related items.'
      };
    }
  } catch { }
  return { title: 'Product not found', description: 'The requested product does not exist.' };
}

async function fetchVendureProduct(slug: string) {
  const endpoint = process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:3000/shop-api';
  const query = `
    query P($slug: String!) {
      product(slug: $slug) {
        slug
        name
        description
        assets { preview }
        featuredAsset { preview }
        variants {
          id
          name
          sku
          currencyCode
          priceWithTax
          stockLevel
          assets { preview }
          options {
            id
            code
            name
            group { id code name }
          }
        }
        collections { id name slug }
      }
    }
  `;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { slug } }),
    cache: 'no-store'
  });
  const json = await res.json();
  return json?.data?.product || null;
}

async function fetchRelatedByCollection(collectionSlug: string, excludeSlug: string) {
  const endpoint = process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:3000/shop-api';
  const query = `
    query R($slug: String!) {
      search(input: { collectionSlug: $slug, groupByProduct: true, take: 8 }) {
        items {
          slug
          productName
          productAsset { preview }
          priceWithTax {
            ... on SinglePrice { value }
            ... on PriceRange { min max }
          }
        }
      }
    }
  `;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { slug: collectionSlug } }),
    cache: 'no-store'
  });
  const json = await res.json();
  const items: any[] = json?.data?.search?.items || [];
  return items
    .filter((it) => it.slug !== excludeSlug)
    .map((it) => {
      const v = it.priceWithTax?.value;
      const min = it.priceWithTax?.min;
      const max = it.priceWithTax?.max;
      const priceMin = typeof v === 'number' ? v : (typeof min === 'number' ? min : 0);
      const priceMax = typeof v === 'number' ? v : (typeof max === 'number' ? max : priceMin);
      return {
        slug: it.slug,
        name: it.productName,
        price: [priceMin, priceMax],
        variants: [],
        discount: 0,
        ratings: 0,
        reviews: 0,
        pictures: [{ url: (it.productAsset?.preview || '') }],
        categories: [],
      };
    });
}

export default async function Page({ params }: PageProps) {
  // Try Vendure product first
  let v = null as any;
  try {
    v = await fetchVendureProduct((await params).slug);
  } catch { }

  let adapted: any = null;
  let relatedProducts: any[] = [];

  if (v) {
    const variantPrices = (v.variants || []).map((x: any) => x.priceWithTax).filter((p: number | null | undefined) => typeof p === 'number') as number[];
    const priceMin = variantPrices.length ? Math.min(...variantPrices) : 0;
    const priceMax = variantPrices.length ? Math.max(...variantPrices) : priceMin;
    const pictures = (v.assets && v.assets.length ? v.assets : (v.featuredAsset ? [v.featuredAsset] : []))
      .map((a: any) => ({ url: (a.preview || '') }));

    const optionGroupMap = new Map<string, OptionGroupInfo>();
    let hasInStockVariant = false;
    const variants = (v.variants || []).map((variant: VendureVariantResponse) => {
      const optionValues = (variant.options || []).map((opt: VendureVariantOption) => {
        const rawGroupKey = opt?.group?.code || opt?.group?.name || opt?.group?.id || 'options';
        const groupKey = rawGroupKey.toString().toLowerCase();
        const groupName = opt?.group?.name || opt?.group?.code || rawGroupKey.toString();
        const existing = optionGroupMap.get(groupKey) || {
          name: groupName,
          code: opt?.group?.code,
          options: [] as OptionGroupInfo['options'],
        };
        if (!existing.options.some((o) => o.id === opt.id)) {
          existing.options.push({ id: opt.id, name: opt.name, code: opt.code || null });
        }
        optionGroupMap.set(groupKey, existing);
        return {
          id: opt.id,
          name: opt.name,
          code: opt.code || null,
          groupKey,
          groupName,
        };
      });
      const colorOption = optionValues.find((opt) => opt.groupKey.includes('color') || opt.groupName.toLowerCase().includes('color'));
      const sizeOption = optionValues.find((opt) => opt.groupKey.includes('size') || opt.groupName.toLowerCase().includes('size'));
      if (!hasInStockVariant) {
        if (typeof variant.stockLevel === 'string') {
          hasInStockVariant = !['OUT_OF_STOCK', 'ZERO'].includes(variant.stockLevel);
        } else {
          hasInStockVariant = true;
        }
      }
      return {
        id: variant.id,
        name: variant.name,
        sku: variant.sku || variant.id,
        price: variant.priceWithTax ?? 0,
        sale_price: null,
        stockLevel: variant.stockLevel,
        optionValues,
        pictures: (variant.assets || []).map((asset: any) => ({ url: asset?.preview || '' })),
        color: colorOption
          ? { name: colorOption.name, color: colorOption.code || colorOption.name }
          : null,
        size: sizeOption
          ? { name: sizeOption.name, size: sizeOption.code || sizeOption.name }
          : null,
      };
    });

    const optionGroups = Array.from(optionGroupMap.entries()).map(([key, group]) => ({
      key,
      name: group.name,
      code: group.code,
      options: group.options,
    }));

    adapted = {
      product: {
        data: {
          slug: v.slug,
          name: v.name,
          sku: (v.slug || 'SKU').toUpperCase(),
          price: [priceMin, priceMax],
          salePrice: priceMin,
          discount: 0,
          ratings: 0,
          reviews: 0,
          short_description: v.description || 'Made-to-order with premium materials.',
          stock: hasInStockVariant || !variants.length ? 100 : 0,
          variants,
          optionGroups,
          categories: (v.collections || []).map((c: any) => ({ name: c.name, slug: c.slug })),
          brands: [],
          pictures,
        },
      },
    };

    const firstCol = v.collections && v.collections[0]?.slug;
    if (firstCol) {
      try {
        relatedProducts = await fetchRelatedByCollection(firstCol, v.slug);
      } catch { }
    }
  } else {
    return notFound();
  }

  if (!adapted) return notFound();

  const productName = adapted.product.data.name;

  return (
    <>
      <main className="container main mt-lg-6 single-product">
        {/* <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li><ALink href="/products">Products</ALink></li>
            <li>{productName}</li>
          </ul>
        </div>
      </nav> */}

        <div className="page-content">
          <div className="container-fluid mt-10 pt-3 mb-4">
            <div className="row gutter-lg">
              <div className="col-lg-12 col-xxl-12">
                <div className="product product-single row">
                  <div className="col-md-6">
                    <MediaFive product={adapted.product.data} />
                  </div>

                  <div className="col-md-6">
                    <DetailFive data={adapted} isDesc={true} isProductNav={false} isGuide />
                  </div>
                </div>

                <RelatedProducts products={relatedProducts} adClass="pt-3" />

              </div>
            </div>
          </div>

        </div>


      </main>
      <FakeReviews />

    </>
  );
}
