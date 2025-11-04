"use client";

import { useEffect, useMemo, useState } from "react";

import IntroSection from "~/components/partials/home/intro-section";
import CategorySection from "~/components/partials/home/category-section";
import ProductCollection from "~/components/partials/home/product-collection";
import BannerSection from "~/components/partials/home/banner-section";
import FeaturedCollection from "~/components/partials/home/featured-collection";
import { DEMO_PRODUCTS, type DemoProduct } from "@/server/demo-data";

type HomeProduct = {
  slug: string;
  name: string;
  price: [number, number];
  salePrice: number;
  discount: number;
  ratings: number;
  reviews: number;
  variants: unknown[];
  categories: unknown[];
  pictures: { url: string }[];
};

type SearchResultItem = {
  slug?: string;
  productName?: string;
  productAsset?: { preview?: string | null } | null;
  priceWithTax?: {
    value?: number | null;
    min?: number | null;
    max?: number | null;
  } | null;
};

type SortParameter = Record<string, "ASC" | "DESC"> | null | undefined;

const SHOP_API_ENDPOINT =
  process.env.NEXT_PUBLIC_SHOP_API || "http://localhost:3000/shop-api";

const SEARCH_QUERY = `
  query HomepageProducts($collectionSlug: String, $take: Int!, $skip: Int!, $sort: SearchResultSortParameter) {
    search(input: { collectionSlug: $collectionSlug, groupByProduct: true, take: $take, skip: $skip, sort: $sort }) {
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

const COLLECTION_CONFIG = {
  gifts: {
    slug: "gifts",
    title: "Gifts",
    bannerSubTitle: "Gift Ideas",
    bannerTitle: "Perfect Presents<br />For Everyone",
    url: "/images/home/banner/1.jpg",
    btnAdClass: "",
    adClass: "mt-10 pt-6",
  },
  hoodies: {
    slug: "hoodies",
    title: "Hoodies",
    bannerSubTitle: "Stay Warm",
    bannerTitle: "Cozy Hoodies<br />For Every Season",
    url: "/images/home/banner/2.jpg",
    btnAdClass: "mb-1",
    adClass: "mt-10 pt-5",
  },
  tshirts: {
    slug: "tshirts",
    title: "T-Shirts",
    bannerSubTitle: "Fresh Drops",
    bannerTitle: "Everyday Tees<br />You'll Love",
    url: "/images/home/banner/3.jpg",
    btnAdClass: "",
    adClass: "mt-10 pt-6",
  },
} as const;

type CollectionKey = keyof typeof COLLECTION_CONFIG;

function mapSearchResultToProduct(item: SearchResultItem): HomeProduct {
  const value = item.priceWithTax?.value ?? null;
  const min = item.priceWithTax?.min ?? null;
  const max = item.priceWithTax?.max ?? null;
  const priceMin =
    typeof value === "number"
      ? value
      : typeof min === "number"
      ? min
      : 0;
  const priceMax =
    typeof value === "number"
      ? value
      : typeof max === "number"
      ? max
      : priceMin;

  return {
    slug: item.slug || "",
    name: item.productName || "",
    price: [priceMin, priceMax],
    salePrice: priceMin,
    discount: 0,
    ratings: 0,
    reviews: 0,
    variants: [],
    categories: [],
    pictures: [{ url: item.productAsset?.preview || "" }],
  };
}

function mapDemoProduct(product: DemoProduct): HomeProduct {
  return {
    slug: product.slug,
    name: product.name,
    price: [product.price, product.price],
    salePrice: product.price,
    discount: 0,
    ratings: 4.5,
    reviews: 12,
    variants: product.variants || [],
    categories: (product.categories || []).map((c) => ({ name: c, slug: c })),
    pictures: product.pictures.map((pic) => ({ url: pic.url })),
  };
}

async function fetchProductsFromVendure(options: {
  collectionSlug?: string | null;
  take?: number;
  skip?: number;
  sort?: SortParameter;
}): Promise<HomeProduct[]> {
  const { collectionSlug = null, take = 8, skip = 0, sort = null } = options;

  try {
    const response = await fetch(SHOP_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { collectionSlug, take, skip, sort },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Vendure request failed with status ${response.status}`);
    }

    const json = await response.json();
    const items: SearchResultItem[] = json?.data?.search?.items || [];
    return items.map(mapSearchResultToProduct).filter((item) => item.slug && item.name);
  } catch (error) {
    console.error("Failed to fetch Vendure products", error);
    throw error;
  }
}

export default function Page() {
  const demoProducts = useMemo(
    () => DEMO_PRODUCTS.map(mapDemoProduct),
    []
  );

  const [trendingProducts, setTrendingProducts] = useState<HomeProduct[]>(demoProducts.slice(0, 8));
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [collectionProducts, setCollectionProducts] = useState<Record<CollectionKey, HomeProduct[]>>({
    gifts: [],
    hoodies: [],
    tshirts: [],
  });
  const [collectionsLoading, setCollectionsLoading] = useState<Record<CollectionKey, boolean>>({
    gifts: true,
    hoodies: true,
    tshirts: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadHomepageData() {
      try {
        setLoadingTrending(true);
        setCollectionsLoading({ gifts: true, hoodies: true, tshirts: true });

        const [trending, gifts, hoodies, tshirts] = await Promise.all([
          fetchProductsFromVendure({ take: 12, sort: { score: "DESC" } }).catch(() => []),
          fetchProductsFromVendure({ collectionSlug: COLLECTION_CONFIG.gifts.slug }).catch(() => []),
          fetchProductsFromVendure({ collectionSlug: COLLECTION_CONFIG.hoodies.slug }).catch(() => []),
          fetchProductsFromVendure({ collectionSlug: COLLECTION_CONFIG.tshirts.slug }).catch(() => []),
        ]);

        if (cancelled) {
          return;
        }

        setTrendingProducts(trending.length ? trending : demoProducts.slice(0, 8));
        setCollectionProducts({
          gifts: gifts.length ? gifts : demoProducts,
          hoodies: hoodies.length ? hoodies : demoProducts,
          tshirts: tshirts.length ? tshirts : demoProducts,
        });
      } finally {
        if (!cancelled) {
          setLoadingTrending(false);
          setCollectionsLoading({ gifts: false, hoodies: false, tshirts: false });
        }
      }
    }

    loadHomepageData();

    return () => {
      cancelled = true;
    };
  }, [demoProducts]);

  return (
    <main className="main">
      <div className="page-content">
        <IntroSection />
        <FeaturedCollection products={trendingProducts} loading={loadingTrending} />
        {/* <CategorySection /> */}

        <ProductCollection
          products={collectionProducts.gifts}
          loading={collectionsLoading.gifts}
          title={COLLECTION_CONFIG.gifts.title}
          bannerSubTitle={COLLECTION_CONFIG.gifts.bannerSubTitle}
          bannerTitle={COLLECTION_CONFIG.gifts.bannerTitle}
          url={COLLECTION_CONFIG.gifts.url}
          adClass={COLLECTION_CONFIG.gifts.adClass}
          btnAdClass={COLLECTION_CONFIG.gifts.btnAdClass}
        />

        <BannerSection />

        <ProductCollection
          products={collectionProducts.hoodies}
          loading={collectionsLoading.hoodies}
          title={COLLECTION_CONFIG.hoodies.title}
          bannerSubTitle={COLLECTION_CONFIG.hoodies.bannerSubTitle}
          bannerTitle={COLLECTION_CONFIG.hoodies.bannerTitle}
          url={COLLECTION_CONFIG.hoodies.url}
          adClass={COLLECTION_CONFIG.hoodies.adClass}
          btnAdClass={COLLECTION_CONFIG.hoodies.btnAdClass}
        />

        <BannerSection subTitle="Black Friday Sale" title="Latest Power Bank" url="/images/home/banner/4.jpg" titleAdClass="ls-s" />

        <ProductCollection
          products={collectionProducts.tshirts}
          loading={collectionsLoading.tshirts}
          title={COLLECTION_CONFIG.tshirts.title}
          bannerSubTitle={COLLECTION_CONFIG.tshirts.bannerSubTitle}
          bannerTitle={COLLECTION_CONFIG.tshirts.bannerTitle}
          url={COLLECTION_CONFIG.tshirts.url}
          adClass={COLLECTION_CONFIG.tshirts.adClass}
          btnAdClass={COLLECTION_CONFIG.tshirts.btnAdClass}
        />
      </div>
    </main>
  );
}
