import type { Metadata } from 'next';
import ALink from '~/components/features/custom-link';
import ProductTwo from '~/components/features/product/product-two';
import ProductListGrid from '@/components/partials/shop/product-list-grid';
import SidebarFilterOne from '@/components/partials/shop/sidebar/sidebar-filter-one';
import ShopBannerDefault from '@/components/partials/shop/banner/shop-banner-default';
import ToolBox from '@/components/partials/shop/toolbox';

export const metadata: Metadata = {
  title: 'Products | Category',
  description: 'Browse products by category with search and category filters powered by Vendure.'
};

type VendureSearchItem = {
  slug: string;
  productName: string;
  productAsset?: { preview: string | null } | null;
  priceWithTax?: { value?: number; min?: number; max?: number } | null;
};

async function fetchVendureProductsForCategory(slug: string, search?: string, opts?: { take?: number; skip?: number }) {
  const endpoint = process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:3000/shop-api';
  const query = `
    query Products($term: String, $collectionSlug: String, $take: Int, $skip: Int) {
      collection(slug: $collectionSlug) { name assets { source } }
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
    body: JSON.stringify({ query, variables: { term: search || null, collectionSlug: slug, take: opts?.take ?? 24, skip: opts?.skip ?? 0 } }),
    // next: { revalidate: 30 }
    cache: 'no-store'
  });
  const json = await res.json();
  const items: VendureSearchItem[] = json?.data?.search?.items || [];
  const collectionName: string = json?.data?.collection?.name || slug;
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
      pictures: [{ url: (it.productAsset?.preview || '') }],
    };
  });
  return { products, collectionName, backgroundImage: json?.data?.collection?.assets?.[0]?.source || '', totalItems };
}

export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams?: { search?: string; page?: string; per_page?: string; grid?: string } }) {
  const slug = (await params).slug;
  const sp = await searchParams;
  const search = sp?.search;
  const perPageRaw = sp?.per_page ? parseInt(sp.per_page as string) : 12;
  const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? perPageRaw : 12;
  const pageRaw = sp?.page ? parseInt(sp.page as string) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const grid = sp?.grid || '3cols';
  const take = perPage;
  const skip = (page - 1) * take;

  let products = [] as any[];
  let collectionName = slug;
  let backgroundImage = '';
  let totalItems = 0;
  try {
    const data = await fetchVendureProductsForCategory(slug, search, { take, skip });
    products = data.products;
    collectionName = data.collectionName || slug;
    backgroundImage = data.backgroundImage || '';
    totalItems = data.totalItems || 0;
  } catch (e) { }

  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li><ALink href="/products">Categories</ALink></li>
            <li>{collectionName || slug}</li>
          </ul>
        </div>
      </nav>

      <ShopBannerDefault title={collectionName || slug} subtitle="TonyZone" ctaHref="/products" ctaText="Discover now" backgroundColor="#3939a8" backgroundImage={backgroundImage} />

      <div className="page-content mb-10 pb-3">
        <div className="container">
          <div className="row gutter-lg main-content-wrap">
            <SidebarFilterOne type="banner" />

            <div className="col-lg-9 main-content">
              <ToolBox type="left" />

              <ProductListGrid
                products={products}
                grid={grid}
                type={'grid'}
                perPage={perPage}
                page={page}
                totalItems={totalItems}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
