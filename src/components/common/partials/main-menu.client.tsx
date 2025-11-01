// import { usePathname } from 'next/navigation';
import ALink from '~/components/features/custom-link';
import React from 'react';

type VendureCollection = { id: string; name: string; slug: string };

function MainMenuClient({ collections, error }: { collections: VendureCollection[]; error?: boolean }) {
  return (
    <nav className="main-nav ml-0">
      <ul className="menu">
        <li id="menu-home">
          <ALink href='/'>Home</ALink>
        </li>

        <li className="submenu">
          <ALink href='/products'>Categories</ALink>

          <div className="megamenu">
            <div className="row">
              <div className="col-6 col-sm-4 col-md-3 col-lg-4">
                <h4 className="menu-title">Categories</h4>
                <ul>
                  {error ? (
                    <li className="text-muted">Unavailable</li>
                  ) : collections.length === 0 ? (
                    <li className="text-muted">No categories</li>
                  ) : collections.slice(0, 10).map((c) => (
                    <li key={`cat-${c.slug}`}>
                      <ALink href={`/categories/${c.slug}`}>{c.name}</ALink>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-6 col-sm-4 col-md-3 col-lg-4">
                <h4 className="menu-title">More</h4>
                <ul>
                  {error || collections.length === 0 ? (
                  <li className="text-muted">&nbsp;</li>
                  ) : collections.slice(10, 20).map((c) => (
                    <li key={`cat2-${c.slug}`}>
                      <ALink href={`/categories/${c.slug}`}>{c.name}</ALink>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-6 col-sm-4 col-md-3 col-lg-4 menu-banner menu-banner1 banner banner-fixed">
                <figure>
                  <img src="/images/menu/banner-1.jpg" alt="Menu banner" width="221" height="330" />
                </figure>
                <div className="banner-content y-50">
                  <h4 className="banner-subtitle font-weight-bold text-primary ls-m">Sale.</h4>
                  <h3 className="banner-title font-weight-bold"><span className="text-uppercase">Up to</span>70% Off</h3>
                  <ALink href={'/products'} className="btn btn-link btn-underline">shop now<i className="d-icon-arrow-right"></i></ALink>
                </div>
              </div>
            </div>
          </div>
        </li>

        <li>
          <ALink href="/about-us">About Us</ALink>
        </li>
      </ul>
    </nav>
  );
}

function arePropsEqual(prev: { collections: VendureCollection[]; error?: boolean }, next: { collections: VendureCollection[]; error?: boolean }) {
  if (prev.error !== next.error) return false;
  if (prev.collections.length !== next.collections.length) return false;
  for (let i = 0; i < prev.collections.length; i++) {
    if (prev.collections[i].id !== next.collections[i].id || prev.collections[i].slug !== next.collections[i].slug || prev.collections[i].name !== next.collections[i].name) {
      return false;
    }
  }
  return true;
}

export default React.memo(MainMenuClient, arePropsEqual);
