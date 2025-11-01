"use client";
import React from "react";
import SlideToggle from 'react-slide-toggle';
import ALink from '~/components/features/custom-link';
import { useQuery } from "@apollo/client/react";
import { V_COLLECTIONS } from '@/server/queries';
import { usePathname } from 'next/navigation';

type Category = { name: string; slug: string; children?: Category[] };

export default function CategoryTree({ pathname, query, type }: { pathname: string; query: any; type?: string }) {
  const { data } = useQuery<{ collections: { items: Category[] } }>(V_COLLECTIONS);
  const categories: Category[] = data?.collections?.items || [];
  const currentPath = usePathname();
  const currentSlug = React.useMemo(() => {
    if (!currentPath) return query?.category || '';
    const idx = currentPath.indexOf('/categories/');
    if (idx === 0) {
      return currentPath.replace('/categories/', '').split('/')[0];
    }
    return query?.category || '';
  }, [currentPath, query?.category]);

  return (
    <div className="widget widget-collapsible">
      <div className="card">
        <h3 className="widget-title">All Categories</h3>
        <ul className="widget-body filter-items search-ul">
          {categories.map((item, index) => (
            item.children && item.children.length > 0 ? (
              <li
                key={item.name + ' - ' + index}
                className={`with-ul overflow-hidden ${item.slug === currentSlug || ((item.children || []).findIndex((subCat) => subCat.slug === currentSlug) > -1) ? 'show' : ''} `}
              >
                <SlideToggle collapsed={!((item.children || []).some((c) => c.slug === currentSlug) || item.slug === currentSlug)}>
                  {({ onToggle, setCollapsibleElement, toggleState }: { onToggle: () => void; setCollapsibleElement: (el: any) => void; toggleState: string }) => (
                    <>
                      <ALink href={`/categories/${item.slug}`} scroll={false}>
                        {item.slug === currentSlug ? <strong>{item.name}</strong> : item.name}
                        <i className={`fas fa-chevron-down ${toggleState.toLowerCase()}`} onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(); }}></i>
                      </ALink>
                      <div ref={setCollapsibleElement}>
                        <ul style={{ display: 'block' }}>
                          {(item.children || []).map((subItem, idx2) => (
                            <li key={subItem.name + ' - ' + idx2} className={`with-ul overflow-hidden ${subItem.slug === currentSlug ? 'show' : ''} `}>
                              <ALink scroll={false} href={`/categories/${subItem.slug}`}>{subItem.slug === currentSlug ? <strong>{subItem.name}</strong> : subItem.name}</ALink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </SlideToggle>
              </li>
            ) : (
              <li className={currentSlug === item.slug ? 'show' : ''} key={item.name + ' - ' + index}>
                <ALink href={`/categories/${item.slug}`} scroll={false}>{currentSlug === item.slug ? <strong>{item.name}</strong> : item.name}</ALink>
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
