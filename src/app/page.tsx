"use client";
import IntroSection from "~/components/partials/home/intro-section";
import CategorySection from "~/components/partials/home/category-section";
import ProductCollection from "~/components/partials/home/product-collection";
import BannerSection from "~/components/partials/home/banner-section";
import FeaturedCollection from "~/components/partials/home/featured-collection";
import { DEMO_PRODUCTS } from "@/server/demo-data";

export default function Page() {
  const products = DEMO_PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: [p.price, p.price],
    salePrice: p.price,
    discount: 0,
    ratings: 4.5,
    reviews: 12,
    variants: [],
    categories: (p.categories || []).map((c) => ({ name: c, slug: c })),
    pictures: p.pictures.map((pic) => ({ url: pic.url })),
  }));
  return (
    <main className="main">
      <div className="page-content">
        <IntroSection />
        <FeaturedCollection products={products} loading={false} />
        {/* <CategorySection /> */}
        <ProductCollection products={products} loading={false} />
        <BannerSection />
        <ProductCollection products={products} loading={false} adClass="mt-10 pt-5" title="Best for Gift" url="/images/home/banner/2.jpg" bannerSubTitle="Multiple Sports Modes" bannerTitle="Professional<br/>Mi Smart Band 5C" btnAdClass="mb-1" />
        <BannerSection subTitle="Black Friday Sale" title="Latest Power Bank" url="/images/home/banner/4.jpg" titleAdClass="ls-s" />
      </div>
    </main>
  );
}
