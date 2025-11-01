"use client";
import React from 'react';
import ALink from '@/components/features/custom-link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

type VendureCollection = { id: string; name: string; slug: string; assets?: { source: string; width: number; height: number }[] | []; parent?: { id: string | null; name?: string } | null };

const COLS_QUERY = gql`
  query COLS { collections(options:{ take: 20, sort:{ name: ASC }}) { items { id name slug assets { source width height} parent { id name } } } }
`;

export default function MainMenu() {
  const { data, loading, error } = useQuery(COLS_QUERY, { fetchPolicy: 'cache-and-network' });
  const pathname = usePathname();

  const all: VendureCollection[] = (data as any)?.collections?.items || [];

  // Parents are direct children of root (__root_collection__ has id '1' by default). We check parent without parent (root) or parent.name === '__root_collection__'.
  const parents = all.filter((c) => c.parent && c.parent.name === '__root_collection__');
  const childrenByParent: Record<string, VendureCollection[]> = {};
  for (const c of all) {
    if (c.parent && c.parent.name && c.parent.name !== '__root_collection__') {
      const pid = c.parent.id as string;
      if (!childrenByParent[pid]) childrenByParent[pid] = [];
      childrenByParent[pid].push(c);
    }
  }

  return (
    <nav className="main-nav ml-0">
      <ul className="menu">
        <li id="menu-home" className={pathname === '/' ? 'active' : ''}>
          <ALink href='/'>Home</ALink>
        </li>

        {error ? (
          <li className="text-muted">Unavailable {error.message}</li>
        ) : loading ? (
          <li className="text-muted">Loading...</li>
        ) : parents.length === 0 ? (
          <li className="text-muted">No categories</li>
        ) : (
          parents.map((p) => (
            <li key={`parent-${p.slug}`} className={`submenu ${pathname.startsWith(`/categories/${p.slug}`) ? 'active' : ''}`}>
              <ALink href={`/categories/${p.slug}`}>{p.name}</ALink>
              {(childrenByParent[p.id] && childrenByParent[p.id].length > 0) && (
                <div className="megamenu">
                  <div className="row">
                    <div className="col-7">
                      <ul>
                        {childrenByParent[p.id].map((c) => (
                          <li key={`child-${c.slug}`}>
                            <ALink href={`/categories/${c.slug}`}>{c.name}</ALink>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {p?.assets?.[0] && (
                      <div className="col-5 menu-banner menu-banner1 banner banner-fixed" style={{
                        minHeight: 250,
                        minWidth: 200
                      }}>
                        <figure>
                          <img src={p?.assets?.[0].source} alt="Menu banner" width={p?.assets?.[0].width} height={p?.assets?.[0].height} />
                        </figure>
                        <div className="banner-content y-50">
                          {/* <h4 className="banner-subtitle font-weight-bold text-primary ls-m">Sale.
                          </h4> */}
                          {/* <h3 className="banner-title font-weight-bold"><span
                            className="text-uppercase">Up to</span>70% Off</h3>
                          <ALink href={"/shop"} className="btn btn-link btn-underline">shop now<i
                            className="d-icon-arrow-right"></i></ALink> */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))
        )}

        <li>
          <ALink href="/about-us">About Us</ALink>
        </li>
      </ul>
    </nav>
  );
}