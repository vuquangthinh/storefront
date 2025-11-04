import { MetadataRoute } from 'next';

const DEFAULT_VENDURE_API = 'https://tonyzone-demo-graphql.teamsoft.vn/shop-api';
const DEFAULT_BASE_URL = 'https://tonyzone-demo.teamsoft.vn';
const PAGE_SIZE = 100;

const VENDURE_API =
  process.env.VENDURE_API_URL ||
  process.env.NEXT_PUBLIC_SHOP_API ||
  DEFAULT_VENDURE_API;

const BASE_URL = (process.env.NEXT_PUBLIC_FRONTEND_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

type SitemapEntry = MetadataRoute.Sitemap[number];

type ProductItem = {
  slug: string;
  updatedAt?: string | null;
};

type CollectionItem = {
  slug: string;
  updatedAt?: string | null;
};

type ProductsResponse = {
  products?: {
    totalItems: number;
    items: ProductItem[];
  };
};

type CollectionsResponse = {
  collections?: {
    totalItems: number;
    items: CollectionItem[];
  };
};

const PRODUCTS_QUERY = `
  query Products($skip: Int!, $take: Int!) {
    products(options: { skip: $skip, take: $take }) {
      totalItems
      items {
        slug
        updatedAt
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query Collections($skip: Int!, $take: Int!) {
    collections(options: { skip: $skip, take: $take }) {
      totalItems
      items {
        slug
        updatedAt
      }
    }
  }
`;

const pageCache = new Map<string, Promise<ProductsResponse['products'] | CollectionsResponse['collections']>>();

async function fetchGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(VENDURE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Vendure API request failed with status ${response.status}`);
  }

  const payload = await response.json() as { data?: T; errors?: Array<{ message?: string }> };

  if (payload.errors && payload.errors.length > 0) {
    const messages = payload.errors.map((error) => error.message || 'Unknown error').join('; ');
    throw new Error(`Vendure API returned errors: ${messages}`);
  }

  if (!payload.data) {
    throw new Error('Vendure API response missing data property');
  }

  return payload.data;
}

async function fetchEntitiesPage<T extends 'products' | 'collections'>(
  entity: T,
  page: number,
): Promise<T extends 'products' ? ProductsResponse['products'] : CollectionsResponse['collections']> {
  const skip = page * PAGE_SIZE;
  const query = entity === 'products' ? PRODUCTS_QUERY : COLLECTIONS_QUERY;
  const cacheKey = `${entity}-${skip}`;

  if (!pageCache.has(cacheKey)) {
    pageCache.set(
      cacheKey,
      fetchGraphQL<ProductsResponse | CollectionsResponse>(query, { skip, take: PAGE_SIZE }).then((data) =>
        entity === 'products'
          ? (data as ProductsResponse).products ?? undefined
          : (data as CollectionsResponse).collections ?? undefined,
      ),
    );
  }

  const result = await pageCache.get(cacheKey)!;
  return result as any;
}

function staticEntries(): SitemapEntry[] {
  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}

export async function generateSitemaps() {
  const [productPage, collectionPage] = await Promise.all([
    fetchEntitiesPage('products', 0),
    fetchEntitiesPage('collections', 0),
  ]);

  const productTotal = productPage?.totalItems ?? 0;
  const collectionTotal = collectionPage?.totalItems ?? 0;

  const productPages = Math.max(1, Math.ceil(productTotal / PAGE_SIZE));
  const collectionPages = Math.max(1, Math.ceil(collectionTotal / PAGE_SIZE));

  const sitemapUrlFor = (id: string) => `${BASE_URL}/sitemap.xml/${id}`;

  const entries = [{ id: 'static', url: sitemapUrlFor('static') }];

  for (let i = 0; i < productPages; i += 1) {
    const id = `products-${i + 1}`;
    entries.push({ id, url: sitemapUrlFor(id) });
  }

  for (let i = 0; i < collectionPages; i += 1) {
    const id = `collections-${i + 1}`;
    entries.push({ id, url: sitemapUrlFor(id) });
  }

  return entries;
}

export default async function sitemap({ id }: { id?: string } = {}): Promise<MetadataRoute.Sitemap> {
  if (!id) {
    const entries = await generateSitemaps();
    return entries.map((entry) => ({ url: entry.url ?? `${BASE_URL}/sitemap.xml/${entry.id}` }));
  }

  const targetId = id;

  if (targetId === 'static') {
    return staticEntries();
  }

  const [type, pageStr] = targetId.split('-');
  if (!type || !pageStr) {
    throw new Error(`Invalid sitemap identifier: ${targetId}`);
  }

  const pageIndex = Math.max(Number.parseInt(pageStr, 10) - 1, 0);

  if (type === 'products') {
    const page = await fetchEntitiesPage('products', pageIndex);
    const items = page?.items ?? [];
    return items.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      changeFrequency: 'daily',
      priority: 0.8,
      ...(product.updatedAt ? { lastModified: new Date(product.updatedAt) } : {}),
    }));
  }

  if (type === 'collections') {
    const page = await fetchEntitiesPage('collections', pageIndex);
    const items = page?.items ?? [];
    return items.map((collection) => ({
      url: `${BASE_URL}/categories/${collection.slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      ...(collection.updatedAt ? { lastModified: new Date(collection.updatedAt) } : {}),
    }));
  }

  throw new Error(`Unknown sitemap type: ${type}`);
}
