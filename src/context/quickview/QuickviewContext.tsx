"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface QuickviewState {
  isOpen: boolean;
  slug: string | null;
  data: any | null;
}

interface QuickviewContextValue {
  isOpen: boolean;
  slug: string | null;
  data: any | null;
  openQuickview: (slug: string, preloadedData?: any | null) => Promise<void>;
  closeQuickview: () => void;
}

const QuickviewContext = createContext<QuickviewContextValue | undefined>(undefined);

async function fetchVendureProduct(slug: string): Promise<any | null> {
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
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { slug } }),
      cache: 'no-store'
    });
    const json = await res.json();
    const product = json?.data?.product || null;
    if (!product) return null;

    // Shape data to be compatible with existing DetailOne expectations.
    // DetailOne is tolerant and checks data?.product ?? data, and then .data ?? product.
    // We wrap vendure product under { product: product } to keep Quickview consuming it consistently.
    return { product };
  } catch (e) {
    console.error('Quickview: failed to fetch product', e);
    return null;
  }
}

export function QuickviewProvider({ children }: { children: React.ReactNode }) {
  const [{ isOpen, slug, data }, setState] = useState<QuickviewState>({ isOpen: false, slug: null, data: null });

  const closeQuickview = useCallback(() => {
    setState({ isOpen: false, slug: null, data: null });
  }, []);

  const openQuickview = useCallback(async (s: string, preloadedData?: any | null) => {
    setState(prev => ({ ...prev, isOpen: true, slug: s }));
    if (preloadedData) {
      setState({ isOpen: true, slug: s, data: preloadedData });
      return;
    }
    const fetched = await fetchVendureProduct(s);
    setState({ isOpen: true, slug: s, data: fetched });
  }, []);

  const value = useMemo(() => ({ isOpen, slug, data, openQuickview, closeQuickview }), [isOpen, slug, data, openQuickview, closeQuickview]);

  return (
    <QuickviewContext.Provider value={value}>
      {children}
    </QuickviewContext.Provider>
  );
}

export function useQuickview(): QuickviewContextValue {
  const ctx = useContext(QuickviewContext);
  if (!ctx) throw new Error('useQuickview must be used within QuickviewProvider');
  return ctx;
}