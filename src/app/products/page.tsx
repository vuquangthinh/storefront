import type { Metadata } from 'next';
import ALink from '~/components/features/custom-link';
import ShopBannerDefault from '@/components/partials/shop/banner/shop-banner-default';
import ProductTwo from '~/components/features/product/product-two';
import SidebarFilterOne from '@/components/partials/shop/sidebar/sidebar-filter-one';
import ToolBox from '@/components/partials/shop/toolbox';
import ProductListGrid from '@/components/partials/shop/product-list-grid';


export const metadata: Metadata = {
  title: 'Products | All Items',
  description: 'Browse all products with search and category filters powered by Vendure.'
};

type SearchParams = { search?: string; category?: string; page?: string | number; per_page?: string | number; grid?: string; type?: string };

type VendureSearchItem = {
  slug: string;
  productName: string;
  productAsset?: { preview: string | null } | null;
  priceWithTax?: { value?: number; min?: number; max?: number } | null;
};

async function fetchVendureProducts(params: SearchParams) {
  const endpoint = process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:3000/shop-api';
  const { search, category } = params;
  const perPage = typeof params.per_page === 'string' ? parseInt(params.per_page) : (typeof params.per_page === 'number' ? params.per_page : 12);
  const page = typeof params.page === 'string' ? parseInt(params.page) : (typeof params.page === 'number' ? params.page : 1);
  const take = Number.isFinite(perPage) && perPage > 0 ? perPage : 12;
  const skip = (Number.isFinite(page) && page > 0 ? page - 1 : 0) * take;
  const query = `
    query Products($term: String, $collectionSlug: String, $take: Int, $skip: Int) {
      search(input: { term: $term, collectionSlug: $collectionSlug, groupByProduct: true, take: $take, skip: $skip }) {
        totalItems
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
    body: JSON.stringify({ query, variables: { term: search || null, collectionSlug: category || null, take, skip } }),
    // next: { revalidate: false },
    cache: 'no-store'
  });
  const json = await res.json();
  const items: VendureSearchItem[] = json?.data?.search?.items || [];
  const totalItems: number = json?.data?.search?.totalItems || 0;
  const products = items.map((it) => {
    const v = it.priceWithTax?.value;
    const min = it.priceWithTax?.min;
    const max = it.priceWithTax?.max;
    const priceMin = typeof v === 'number' ? v : (typeof min === 'number' ? min : 0);
    const priceMax = typeof v === 'number' ? v : (typeof max === 'number' ? max : priceMin);
    return {
      slug: it.slug,
      name: it.productName,
      price: [priceMin, priceMax],
      salePrice: priceMin,
      discount: 0,
      ratings: 0,
      reviews: 0,
      variants: [],
      categories: [],
      pictures: [{
        url: (it.productAsset?.preview || '')
      }]
    };
  });
  return { products, totalItems, search };
}

export default async function Page({ searchParams }: { searchParams?: SearchParams }) {
  const params = await searchParams || {};
  const perPage = typeof params.per_page === 'string' ? parseInt(params.per_page) : (typeof params.per_page === 'number' ? params.per_page : 12);
  const page = typeof params.page === 'string' ? parseInt(params.page) : (typeof params.page === 'number' ? params.page : 1);
  let products = [] as any[];
  let totalItems = 0;
  let notFoundMessage = "No products were found matching your selection.";
  try {
    const data = await fetchVendureProducts(params);
    products = data.products;
    totalItems = data.totalItems;
    notFoundMessage = data.search ? "No products were found matching \"" + data.search + "\"." : "No products were found matching your selection.";
  } catch {
    notFoundMessage = "No products were found matching your selection.";
  }

  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Products</li>
          </ul>
        </div>
      </nav>

      <ShopBannerDefault title="Products" subtitle="TonyZone" ctaHref="/products" ctaText="Discover now" backgroundColor="#3939a8" />

      <div className="page-content mb-10 pb-3">
        <div className="container">
          <div className="row gutter-lg main-content-wrap">
            <SidebarFilterOne type="banner" />

            <div className="col-lg-9 main-content">
              <ToolBox type="left" />

              <ProductListGrid
                products={products}
                grid={(params as any).grid || '3cols'}
                type={'grid'}
                perPage={perPage}
                page={page}
                totalItems={totalItems}
                showPagination={true}
                notFoundMessage={notFoundMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
